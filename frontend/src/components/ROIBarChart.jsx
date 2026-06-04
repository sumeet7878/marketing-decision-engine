import React from 'react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  LabelList,
} from 'recharts'

const PALETTE = ['#3b82f6', '#10b981', '#8b5cf6', '#f59e0b', '#06b6d4']

function formatNum(val, currency, rates) {
  const converted = val * rates[currency]
  if (converted >= 1_000_000) return (converted / 1_000_000).toFixed(1) + 'M'
  if (converted >= 1_000)     return (converted / 1_000).toFixed(0) + 'K'
  return converted.toFixed(0)
}

function CustomTooltip({ active, payload, symbol, rates, currency }) {
  if (!active || !payload?.length) return null
  const d = payload[0].payload
  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-lg p-3 text-sm min-w-[160px]">
      <p className="font-semibold text-slate-800 mb-2">{d.name}</p>
      <div className="space-y-1">
        <div className="flex justify-between gap-4">
          <span className="text-slate-500 text-xs">Spend</span>
          <span className="font-medium text-slate-700 text-xs">{symbol}{formatNum(d.spend, currency, rates)}</span>
        </div>
        <div className="flex justify-between gap-4">
          <span className="text-slate-500 text-xs">Revenue</span>
          <span className="font-medium text-slate-700 text-xs">{symbol}{formatNum(d.revenue, currency, rates)}</span>
        </div>
        <div className="flex justify-between gap-4 pt-1 border-t border-slate-100">
          <span className="text-slate-600 text-xs font-semibold">ROI</span>
          <span className={`font-bold text-xs ${d.roi >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>
            {d.roi > 0 ? '+' : ''}{d.roi}%
          </span>
        </div>
      </div>
    </div>
  )
}

export default function ROIBarChart({ channels, symbol, rates, currency }) {
  return (
    <ResponsiveContainer width="100%" height={260}>
      <BarChart
        data={channels}
        margin={{ top: 20, right: 12, left: 0, bottom: 4 }}
      >
        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
        <XAxis
          dataKey="name"
          tick={{ fontSize: 11, fill: '#64748b' }}
          axisLine={false}
          tickLine={false}
          interval={0}
        />
        <YAxis
          tickFormatter={(v) => `${v}%`}
          tick={{ fontSize: 10, fill: '#94a3b8' }}
          axisLine={false}
          tickLine={false}
          width={44}
        />
        <Tooltip
          content={<CustomTooltip symbol={symbol} rates={rates} currency={currency} />}
          cursor={{ fill: '#f8fafc' }}
        />
        <Bar dataKey="roi" radius={[6, 6, 0, 0]} maxBarSize={52}>
          {channels.map((_, i) => (
            <Cell key={i} fill={PALETTE[i % PALETTE.length]} />
          ))}
          <LabelList
            dataKey="roi"
            position="top"
            formatter={(v) => `${v}%`}
            style={{ fontSize: 10, fill: '#475569', fontWeight: 700 }}
          />
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}
