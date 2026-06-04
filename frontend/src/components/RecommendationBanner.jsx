import React from 'react'

export default function RecommendationBanner({ recommendation, insight }) {
  return (
    <div className="rounded-2xl bg-gradient-to-r from-blue-600 via-blue-700 to-violet-700 text-white p-5 sm:p-6 shadow-lg shadow-blue-200">
      <div className="flex items-start gap-4">
        <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center flex-shrink-0 mt-0.5">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 18v-5.25m0 0a6.01 6.01 0 0 0 1.5-.189m-1.5.189a6.01 6.01 0 0 1-1.5-.189m3.75 7.478a12.06 12.06 0 0 1-4.5 0m3.75 2.383a14.406 14.406 0 0 1-3 0M14.25 18v-.192c0-.983.658-1.823 1.508-2.316a7.5 7.5 0 1 0-7.517 0c.85.493 1.509 1.333 1.509 2.316V18" />
          </svg>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-[10px] font-bold uppercase tracking-widest text-blue-200">
              Strategic Recommendation
            </span>
          </div>
          <p className="font-semibold text-base sm:text-lg leading-snug">{recommendation}</p>
          <div className="mt-3 flex items-start gap-2">
            <span className="text-[10px] font-bold uppercase tracking-widest text-blue-300 flex-shrink-0 mt-0.5">
              Key Insight
            </span>
            <p className="text-sm text-blue-100 leading-relaxed">{insight}</p>
          </div>
        </div>
      </div>
    </div>
  )
}
