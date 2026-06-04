import React from 'react'
import clsx from 'clsx'

const colorMap = {
  blue: {
    card:  'bg-blue-50 border-blue-100',
    label: 'text-blue-600',
    value: 'text-blue-900',
    icon:  'bg-blue-100 text-blue-600',
  },
  emerald: {
    card:  'bg-emerald-50 border-emerald-100',
    label: 'text-emerald-600',
    value: 'text-emerald-900',
    icon:  'bg-emerald-100 text-emerald-600',
  },
  violet: {
    card:  'bg-violet-50 border-violet-100',
    label: 'text-violet-600',
    value: 'text-violet-900',
    icon:  'bg-violet-100 text-violet-600',
  },
  amber: {
    card:  'bg-amber-50 border-amber-100',
    label: 'text-amber-600',
    value: 'text-amber-900',
    icon:  'bg-amber-100 text-amber-600',
  },
}

export default function KPICard({ label, value, sub, color = 'blue', icon }) {
  const c = colorMap[color]
  return (
    <div className={clsx('rounded-2xl border p-4 sm:p-5 flex flex-col gap-2', c.card)}>
      <div className="flex items-center justify-between">
        <span className={clsx('text-[10px] font-semibold uppercase tracking-widest', c.label)}>
          {label}
        </span>
        {icon && (
          <span className={clsx('w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0', c.icon)}>
            <svg viewBox="0 0 24 24" fill="none" strokeWidth="1.8" stroke="currentColor" className="w-4 h-4">
              {icon}
            </svg>
          </span>
        )}
      </div>
      <span className={clsx('text-xl sm:text-2xl font-bold tracking-tight truncate', c.value)}>
        {value}
      </span>
      <span className="text-[11px] text-slate-500">{sub}</span>
    </div>
  )
}
