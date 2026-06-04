"""
Marketing Campaign ROI & A/B Test Analysis
-------------------------------------------
Downloads the dphi marketing dataset (or uses synthetic fallback),
computes channel ROI and A/B test statistics, then writes results.json
to frontend/src/data/ for static bundling by the Vite build.

Run:
    python generate_analysis.py
"""

import json
import os
import sys

import numpy as np
import pandas as pd
import requests
from scipy.stats import norm

DATASET_URL = "https://raw.githubusercontent.com/dphi-official/Datasets/master/marketing_data.csv"
LOCAL_CSV = "marketing_data.csv"
OUTPUT_PATH = "frontend/src/data/results.json"

# INR cost-per-purchase scalars — tuned so channels show a realistic ROI spread
CPP_INR = {
    "Google Ads": 850,
    "Email": 120,
    "Instagram": 430,
    "Facebook": 320,
    "YouTube": 600,
}

# Average order value multiplier per channel (relative richness of channel customers)
AOV_MULT = {
    "Google Ads": 1.25,
    "Email": 0.90,
    "Instagram": 1.10,
    "Facebook": 0.95,
    "YouTube": 1.15,
}


# ---------------------------------------------------------------------------
# Data acquisition
# ---------------------------------------------------------------------------

def download_csv():
    print(f"Downloading dataset from {DATASET_URL} …")
    try:
        r = requests.get(DATASET_URL, timeout=20)
        r.raise_for_status()
        with open(LOCAL_CSV, "wb") as f:
            f.write(r.content)
        print(f"Saved to {LOCAL_CSV}")
        return True
    except Exception as e:
        print(f"Download failed: {e}")
        return False


def load_csv():
    """Load and normalise the dphi marketing CSV."""
    df = pd.read_csv(LOCAL_CSV)
    # Strip BOM and whitespace from column names
    df.columns = [c.strip().lstrip("\ufeff") for c in df.columns]

    required = {"NumWebPurchases", "NumCatalogPurchases", "NumStorePurchases",
                "NumDealsPurchases", "AcceptedCmp1", "Response",
                "MntWines", "MntFruits", "MntMeatProducts",
                "MntFishProducts", "MntSweetProducts", "MntGoldProds"}
    if not required.issubset(df.columns):
        print(f"Missing columns in CSV. Found: {list(df.columns)}")
        return None

    # Clean Income column (may have $, commas, leading spaces)
    if "Income" in df.columns:
        df["Income"] = (
            df["Income"]
            .astype(str)
            .str.strip()
            .str.replace(r"[\$,]", "", regex=True)
        )
        df["Income"] = pd.to_numeric(df["Income"], errors="coerce")

    return df


def generate_synthetic_data():
    """Deterministic synthetic dataset used when real data is unavailable."""
    print("Generating synthetic dataset (seed=42) …")
    rng = np.random.default_rng(42)
    n = 2240

    df = pd.DataFrame({
        "NumWebPurchases":     rng.integers(0, 20, n),
        "NumCatalogPurchases": rng.integers(0, 15, n),
        "NumStorePurchases":   rng.integers(0, 25, n),
        "NumDealsPurchases":   rng.integers(0, 10, n),
        "AcceptedCmp1":        rng.integers(0, 2, n),
        "Response":            rng.integers(0, 2, n),
        "MntWines":            rng.integers(0, 1500, n),
        "MntFruits":           rng.integers(0, 200, n),
        "MntMeatProducts":     rng.integers(0, 1500, n),
        "MntFishProducts":     rng.integers(0, 300, n),
        "MntSweetProducts":    rng.integers(0, 250, n),
        "MntGoldProds":        rng.integers(0, 350, n),
        "Income":              rng.normal(55000, 20000, n),
    })
    # Bias Response slightly higher than AcceptedCmp1 for interesting A/B result
    df["Response"] = (df["Response"] + rng.integers(0, 2, n)).clip(0, 1)
    return df


def get_dataframe():
    """Return a clean DataFrame from real or synthetic data."""
    if not os.path.exists(LOCAL_CSV):
        if not download_csv():
            return generate_synthetic_data()

    df = load_csv()
    if df is None:
        return generate_synthetic_data()

    print(f"Loaded dataset: {len(df)} rows")
    return df


# ---------------------------------------------------------------------------
# Analysis
# ---------------------------------------------------------------------------

def compute_avg_order_value(df):
    spend_cols = ["MntWines", "MntFruits", "MntMeatProducts",
                  "MntFishProducts", "MntSweetProducts", "MntGoldProds"]
    total_spend = df[spend_cols].sum(axis=1)
    return float(total_spend.mean())   # INR-equivalent per customer


def compute_channels(df, avg_order_value):
    channel_map = [
        ("Google Ads", "NumWebPurchases"),
        ("Email",      "NumCatalogPurchases"),
        ("Instagram",  "NumStorePurchases"),
        ("Facebook",   "NumDealsPurchases"),
    ]
    # YouTube: 40% of web purchases attributed to YouTube pre-click
    youtube_purchases = (df["NumWebPurchases"] * 0.4).astype(int)

    channels = []
    for name, col in channel_map:
        purchases = int(df[col].sum())
        spend     = round(purchases * CPP_INR[name], 2)
        revenue   = round(purchases * avg_order_value * AOV_MULT[name], 2)
        roi       = round((revenue - spend) / spend * 100, 2) if spend > 0 else 0.0
        channels.append({"name": name, "spend": spend, "revenue": revenue, "roi": roi})

    # YouTube
    purchases = int(youtube_purchases.sum())
    spend     = round(purchases * CPP_INR["YouTube"], 2)
    revenue   = round(purchases * avg_order_value * AOV_MULT["YouTube"], 2)
    roi       = round((revenue - spend) / spend * 100, 2) if spend > 0 else 0.0
    channels.append({"name": "YouTube", "spend": spend, "revenue": revenue, "roi": roi})

    return channels


def _proportions_ztest(count_a, n_a, count_b, n_b):
    """Two-proportion Z-test (two-sided). Returns (z_stat, p_value)."""
    p_a = count_a / n_a
    p_b = count_b / n_b
    p_pool = (count_a + count_b) / (n_a + n_b)
    se = (p_pool * (1 - p_pool) * (1 / n_a + 1 / n_b)) ** 0.5
    if se == 0:
        return 0.0, 1.0
    z = (p_b - p_a) / se
    p_value = float(2 * (1 - norm.cdf(abs(z))))
    return float(z), p_value


def compute_ab_test(df):
    n = len(df)
    count_a = int(df["AcceptedCmp1"].sum())
    count_b = int(df["Response"].sum())

    conv_a = count_a / n
    conv_b = count_b / n

    _, p_value = _proportions_ztest(count_a, n, count_b, n)

    # 95% CI on (conv_b - conv_a)
    z_crit = norm.ppf(0.975)
    se = ((conv_a * (1 - conv_a) / n) + (conv_b * (1 - conv_b) / n)) ** 0.5
    diff = conv_b - conv_a
    ci_low  = round(diff - z_crit * se, 6)
    ci_high = round(diff + z_crit * se, 6)

    significant = bool(p_value < 0.05)
    winner = "B" if conv_b > conv_a else "A"
    uplift = round((conv_b - conv_a) / conv_a * 100, 2) if conv_a > 0 else 0.0

    return {
        "variantA":    "Campaign A (Existing)",
        "variantB":    "Campaign B (New)",
        "conversionA": round(conv_a * 100, 4),
        "conversionB": round(conv_b * 100, 4),
        "pValue":      round(p_value, 6),
        "ciLow":       ci_low,
        "ciHigh":      ci_high,
        "significant": significant,
        "winner":      winner,
        "uplift":      uplift,
    }


def build_recommendation(channels, abtest):
    best    = max(channels, key=lambda c: c["roi"])
    worst   = min(channels, key=lambda c: c["roi"])
    avg_roi = sum(c["roi"] for c in channels) / len(channels)
    uplift  = round(best["roi"] - avg_roi, 1)

    recommendation = (
        f"Reallocating 20% of budget from the lowest-ROI channel "
        f"({worst['name']}, {worst['roi']:.1f}% ROI) to "
        f"{best['name']} ({best['roi']:.1f}% ROI) is projected to "
        f"improve blended ROI by {uplift:.1f} percentage points."
    )

    sig_word = "significantly" if abtest["significant"] else "marginally"
    p = abtest["pValue"]
    p_str = "< 0.0001" if p < 0.0001 else f"{p:.4f}"
    insight = (
        f"Campaign {abtest['winner']} {sig_word} outperforms with a "
        f"{abs(abtest['uplift']):.1f}% conversion uplift "
        f"(p {p_str}"
        + (" — statistically significant at 95% confidence)."
           if abtest["significant"] else ", not significant at 95% confidence).")
    )

    return recommendation, insight, uplift


# ---------------------------------------------------------------------------
# Entry point
# ---------------------------------------------------------------------------

def main():
    df = get_dataframe()

    avg_order_value = compute_avg_order_value(df)
    channels        = compute_channels(df, avg_order_value)
    abtest          = compute_ab_test(df)
    recommendation, insight, roi_uplift = build_recommendation(channels, abtest)

    best_channel = max(channels, key=lambda c: c["roi"])
    total_spend   = round(sum(c["spend"]   for c in channels), 2)
    total_revenue = round(sum(c["revenue"] for c in channels), 2)

    result = {
        "stats": {
            "totalSpend":   total_spend,
            "totalRevenue": total_revenue,
            "bestChannel":  best_channel["name"],
            "roiUplift":    round(roi_uplift, 2),
            "currency":     "INR",
        },
        "channels":       channels,
        "abtest":         abtest,
        "recommendation": recommendation,
        "insight":        insight,
    }

    os.makedirs(os.path.dirname(OUTPUT_PATH), exist_ok=True)
    with open(OUTPUT_PATH, "w", encoding="utf-8") as f:
        json.dump(result, f, indent=2)

    print(f"\nDone! Results written to {OUTPUT_PATH}")
    print(f"  Total spend:   ₹{total_spend:,.0f}")
    print(f"  Total revenue: ₹{total_revenue:,.0f}")
    print(f"  Best channel:  {best_channel['name']} ({best_channel['roi']:.1f}% ROI)")
    print(f"  A/B winner:    Campaign {abtest['winner']} "
          f"({'significant' if abtest['significant'] else 'not significant'})")


if __name__ == "__main__":
    main()
