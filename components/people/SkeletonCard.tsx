'use client'

export function SkeletonCard() {
  return (
    <div
      className="rounded-2xl p-5 flex flex-col gap-4 bg-white border border-[#e2e8f0]"
      style={{ boxShadow: '0 1px 4px rgba(27,42,74,0.06)' }}
    >
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-full animate-pulse bg-slate-100 shrink-0" />
        <div className="flex-1 space-y-2">
          <div className="h-4 rounded-md animate-pulse bg-slate-100" style={{ width: '60%' }} />
          <div className="h-3 rounded-md animate-pulse bg-slate-100" style={{ width: '80%' }} />
        </div>
      </div>
      <div className="h-5 w-24 rounded-full animate-pulse bg-slate-100" />
      <div className="space-y-2">
        <div className="h-3 rounded animate-pulse bg-slate-100" style={{ width: '90%' }} />
        <div className="h-3 rounded animate-pulse bg-slate-100" style={{ width: '70%' }} />
      </div>
    </div>
  )
}
