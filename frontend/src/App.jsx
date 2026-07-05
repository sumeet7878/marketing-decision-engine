import React, { useState, useMemo } from 'react'
import data from './data/results.json'
import KPICard from './components/KPICard.jsx'
import ROIBarChart from './components/ROIBarChart.jsx'
import ABTestCard from './components/ABTestCard.jsx'
import RecommendationBanner from './components/RecommendationBanner.jsx'
import CurrencyToggle from './components/CurrencyToggle.jsx'

const RATES   = { INR: 1, USD: 0.012, AED: 0.044, GBP: 0.0095, EUR: 0.011 }
const SYMBOLS = { INR: '₹', USD: '$', AED: 'د.إ', GBP: '£', EUR: '€' }

function formatMoney(value, currency) {
  const converted = value * RATES[currency]
  if (converted >= 1_000_000) {
    return (converted / 1_000_000).toFixed(2) + 'M'
  }
  if (converted >= 1_000) {
    return (converted / 1_000).toFixed(1) + 'K'
  }
  return converted.toFixed(0)
}

export default function App() {
  const [currency, setCurrency] = useState('INR')

  const symbol  = SYMBOLS[currency]

  const fmt = useMemo(
    () => (val) => `${symbol}${formatMoney(val, currency)}`,
    [currency, symbol]
  )

  return (
    <div className="min-h-screen bg-slate-50">
      {/* ── Header ─────────────────────────────────────────────────────── */}
      <header className="bg-white border-b border-slate-200 shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center flex-shrink-0">
              <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5 text-white" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.5l4-4 4 4 4-6 4 3" />
              </svg>
            </div>
            <div>
              <h1 className="text-lg sm:text-xl font-bold text-slate-900 leading-tight">
                Marketing Decision Engine
              </h1>
              <p className="text-xs text-slate-500 hidden sm:block">Campaign ROI &amp; A/B Test Dashboard</p>
            </div>
          </div>
          <CurrencyToggle currency={currency} onChange={setCurrency} />
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">

        {/* ── Recommendation Banner ──────────────────────────────────────── */}
        <RecommendationBanner
          recommendation={data.recommendation}
          insight={data.insight}
        />

        {/* ── KPI Cards ──────────────────────────────────────────────────── */}
        <section className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <KPICard
            label="Total Spend"
            value={fmt(data.stats.totalSpend)}
            sub="All channels combined"
            color="blue"
            icon={
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0 1 15.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 0 1 3 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 0 0-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 0 1-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 0 0 3 15h-.75M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm3 0h.008v.008H18V10.5Zm-12 0h.008v.008H6V10.5Z" />
            }
          />
          <KPICard
            label="Total Revenue"
            value={fmt(data.stats.totalRevenue)}
            sub="All channels combined"
            color="emerald"
            icon={
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6 9 12.75l4.286-4.286a11.948 11.948 0 0 1 4.306 6.43l.776 2.898m0 0 3.182-5.511m-3.182 5.511-5.511-3.182" />
            }
          />
          <KPICard
            label="Best Channel"
            value={data.stats.bestChannel}
            sub="Highest ROI channel"
            color="violet"
            icon={
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 18.75h-9m9 0a3 3 0 0 1 3 3h-15a3 3 0 0 1 3-3m9 0v-3.375c0-.621-.503-1.125-1.125-1.125h-.871M7.5 18.75v-3.375c0-.621.504-1.125 1.125-1.125h.872m5.007 0H9.497m5.007 0a7.454 7.454 0 0 1-.982-3.172M9.497 14.25a7.454 7.454 0 0 0 .981-3.172M5.25 4.236c-.982.143-1.954.317-2.916.52A6.003 6.003 0 0 0 7.73 9.728M5.25 4.236V4.5c0 2.108.966 3.99 2.48 5.228M5.25 4.236V2.721C7.456 2.41 9.71 2.25 12 2.25c2.291 0 4.545.16 6.75.47v1.516M7.73 9.728a6.726 6.726 0 0 0 2.748 1.35m8.272-6.842V4.5c0 2.108-.966 3.99-2.48 5.228m2.48-5.492a46.32 46.32 0 0 1 2.916.52 6.003 6.003 0 0 1-5.395 4.972m0 0a6.726 6.726 0 0 1-2.749 1.35m0 0a6.772 6.772 0 0 1-3.044 0" />
            }
          />
          <KPICard
            label="ROI Uplift"
            value={`+${data.stats.roiUplift}pp`}
            sub="Best vs avg channel"
            color="amber"
            icon={
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 10.5 12 3m0 0 7.5 7.5M12 3v18" />
            }
          />
        </section>

        {/* ── Charts Row ─────────────────────────────────────────────────── */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* ROI Bar Chart — wider */}
          <div className="xl:col-span-2 bg-white rounded-2xl shadow-sm border border-slate-100 p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold text-slate-800">ROI by Channel</h2>
              <span className="text-xs text-slate-400 bg-slate-50 px-2 py-1 rounded-md">
                Return on Investment %
              </span>
            </div>
            <ROIBarChart channels={data.channels} symbol={symbol} rates={RATES} currency={currency} />
          </div>

          {/* Channel spend table — narrower */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5">
            <h2 className="text-sm font-semibold text-slate-800 mb-4">Channel Breakdown</h2>
            <div className="space-y-3">
              {[...data.channels]
                .sort((a, b) => b.roi - a.roi)
                .map((ch, i) => (
                  <div key={ch.name} className="flex items-center gap-3">
                    <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0 ${
                      i === 0 ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-500'
                    }`}>
                      {i + 1}
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-baseline mb-1">
                        <span className="text-xs font-medium text-slate-700 truncate">{ch.name}</span>
                        <span className={`text-xs font-bold ml-2 flex-shrink-0 ${
                          ch.roi > 0 ? 'text-emerald-600' : 'text-red-500'
                        }`}>
                          {ch.roi > 0 ? '+' : ''}{ch.roi}%
                        </span>
                      </div>
                      <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${i === 0 ? 'bg-amber-400' : 'bg-blue-400'}`}
                          style={{ width: `${Math.min(100, Math.max(0, (ch.roi / Math.max(...data.channels.map(c => c.roi))) * 100))}%` }}
                        />
                      </div>
                      <div className="flex justify-between mt-1">
                        <span className="text-[10px] text-slate-400">Spend: {fmt(ch.spend)}</span>
                        <span className="text-[10px] text-slate-400">Rev: {fmt(ch.revenue)}</span>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>

        {/* ── A/B Test Card ──────────────────────────────────────────────── */}
        <ABTestCard abtest={data.abtest} />

      </main>

      <footer className="flex flex-col items-center text-center text-xs text-slate-400 py-6 border-t border-slate-100 mt-2">
        <span>Data: Marketing Campaign Dataset (dphi) · Powered by React + Recharts + Tailwind CSS · Pre-computed = instant load</span>
        <span className="mt-1 text-[10px] text-slate-400">Currency conversion uses fixed approximate rates for presentation purposes.</span>
      </footer>
    </div>
  )
}
