import React from 'react'
import clsx from 'clsx'

export default function ABTestCard({ abtest }) {
  const {
    variantA, variantB,
    conversionA, conversionB,
    pValue, ciLow, ciHigh,
    significant, winner, uplift,
  } = abtest

  const variants = [
    { key: 'A', label: variantA, conv: conversionA, isWinner: winner === 'A' },
    { key: 'B', label: variantB, conv: conversionB, isWinner: winner === 'B' },
  ]

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5 sm:p-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
        <div>
          <h2 className="text-sm font-semibold text-slate-800">A/B Test Results</h2>
          <p className="text-xs text-slate-400 mt-0.5">Two-proportion Z-test · 95% confidence</p>
        </div>
        <span className={clsx(
          'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border',
          significant
            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
            : 'bg-slate-50 text-slate-500 border-slate-200'
        )}>
          <span className={clsx(
            'w-1.5 h-1.5 rounded-full',
            significant ? 'bg-emerald-500' : 'bg-slate-400'
          )} />
          {significant ? 'Statistically Significant' : 'Not Significant'}
        </span>
      </div>

      {/* Variant Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
        {variants.map(({ key, label, conv, isWinner }) => (
          <div
            key={key}
            className={clsx(
              'rounded-xl border-2 p-4 relative transition-colors',
              isWinner
                ? 'border-emerald-400 bg-gradient-to-br from-emerald-50 to-white'
                : 'border-slate-200 bg-slate-50'
            )}
          >
            {isWinner && (
              <span className="absolute top-3 right-3 inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                <svg viewBox="0 0 24 24" fill="currentColor" className="w-3 h-3">
                  <path d="M11.48 3.499a.562.562 0 0 1 1.04 0l2.125 5.111a.563.563 0 0 0 .475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 0 0-.182.557l1.285 5.385a.562.562 0 0 1-.84.61l-4.725-2.885a.562.562 0 0 0-.586 0L6.982 20.54a.562.562 0 0 1-.84-.61l1.285-5.386a.562.562 0 0 0-.182-.557l-4.204-3.602a.562.562 0 0 1 .321-.988l5.518-.442a.563.563 0 0 0 .475-.345L11.48 3.5Z" />
                </svg>
                Winner
              </span>
            )}
            <div className="flex items-center gap-2 mb-3">
              <span className={clsx(
                'w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold',
                isWinner ? 'bg-emerald-200 text-emerald-800' : 'bg-slate-200 text-slate-600'
              )}>
                {key}
              </span>
              <p className="text-xs text-slate-500 font-medium truncate">{label}</p>
            </div>
            <p className={clsx(
              'text-3xl sm:text-4xl font-bold tabular-nums',
              isWinner ? 'text-emerald-700' : 'text-slate-700'
            )}>
              {conv.toFixed(2)}<span className="text-base font-semibold">%</span>
            </p>
            <p className="text-xs text-slate-400 mt-1">Conversion Rate</p>
          </div>
        ))}
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-slate-50 rounded-xl p-3 text-center">
          <p className="text-[10px] text-slate-400 uppercase tracking-wider mb-1">p-value</p>
          <p className={clsx(
            'text-base font-bold tabular-nums',
            significant ? 'text-emerald-600' : 'text-slate-600'
          )}>
            {pValue < 0.0001 ? '< 0.0001' : pValue.toFixed(4)}
          </p>
          <p className="text-[10px] text-slate-400 mt-0.5">
            {significant ? '< 0.05 ✓' : '≥ 0.05'}
          </p>
        </div>

        <div className="bg-slate-50 rounded-xl p-3 text-center">
          <p className="text-[10px] text-slate-400 uppercase tracking-wider mb-1">Uplift</p>
          <p className={clsx(
            'text-base font-bold tabular-nums',
            uplift >= 0 ? 'text-emerald-600' : 'text-red-500'
          )}>
            {uplift >= 0 ? '+' : ''}{uplift.toFixed(1)}%
          </p>
          <p className="text-[10px] text-slate-400 mt-0.5">B vs A</p>
        </div>

        <div className="bg-slate-50 rounded-xl p-3 text-center">
          <p className="text-[10px] text-slate-400 uppercase tracking-wider mb-1">95% CI</p>
          <p className="text-[11px] font-bold text-slate-600 tabular-nums leading-tight mt-1">
            [{ciLow > 0 ? '+' : ''}{ciLow.toFixed(3)},<br />
            {ciHigh > 0 ? '+' : ''}{ciHigh.toFixed(3)}]
          </p>
        </div>
      </div>

      {/* Interpretation */}
      <div className={clsx(
        'mt-4 rounded-xl p-3 text-xs leading-relaxed',
        significant
          ? 'bg-emerald-50 text-emerald-800 border border-emerald-100'
          : 'bg-slate-50 text-slate-600 border border-slate-100'
      )}>
        {significant
          ? `Campaign ${winner} wins with statistical confidence. The ${Math.abs(uplift).toFixed(1)}% conversion uplift is unlikely due to chance (p ${pValue < 0.0001 ? '< 0.0001' : pValue.toFixed(4)}). Safe to roll out Campaign ${winner} to 100% of traffic.`
          : `Results are inconclusive at 95% confidence (p ${pValue < 0.0001 ? '< 0.0001' : '= ' + pValue.toFixed(4)}). Collect more data before making a deployment decision.`
        }
      </div>
    </div>
  )
}
