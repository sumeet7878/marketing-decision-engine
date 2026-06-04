import React from 'react'

const CURRENCIES = [
  { code: 'INR', label: '₹ INR — India' },
  { code: 'USD', label: '$ USD — USA' },
  { code: 'GBP', label: '£ GBP — UK' },
  { code: 'EUR', label: '€ EUR — Germany' },
  { code: 'AED', label: 'د.إ AED — Dubai' },
]

export default function CurrencyToggle({ currency, onChange }) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-xs text-slate-500 font-medium hidden sm:block select-none">Currency</span>
      <select
        value={currency}
        onChange={(e) => onChange(e.target.value)}
        className="
          text-sm font-medium
          border border-slate-200 rounded-lg
          bg-white text-slate-700
          px-3 py-1.5
          focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
          cursor-pointer shadow-sm
          appearance-none
          pr-8
          bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 16 16%22%3E%3Cpath fill=%22none%22 stroke=%22%23666%22 stroke-linecap=%22round%22 stroke-linejoin=%22round%22 stroke-width=%222%22 d=%22m2 5 6 6 6-6%22/%3E%3C/svg%3E')]
          bg-no-repeat bg-[right_0.5rem_center] bg-[length:1em_1em]
        "
        aria-label="Select currency"
      >
        {CURRENCIES.map(({ code, label }) => (
          <option key={code} value={code}>{label}</option>
        ))}
      </select>
    </div>
  )
}
