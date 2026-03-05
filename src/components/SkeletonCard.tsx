import React from 'react'

export function SkeletonCard() {
  return (
    <div
      className="rounded-2xl p-5 flex flex-col gap-4"
      style={{
        background: 'rgba(255,255,255,0.02)',
        border: '1px solid rgba(255,255,255,0.05)',
      }}
    >
      <div className="flex items-center gap-3">
        <div
          className="w-12 h-12 rounded-full animate-pulse shrink-0"
          style={{ background: 'rgba(255,255,255,0.07)' }}
        />
        <div className="flex-1 space-y-2">
          <div className="h-4 rounded-md animate-pulse" style={{ background: 'rgba(255,255,255,0.07)', width: '60%' }} />
          <div className="h-3 rounded-md animate-pulse" style={{ background: 'rgba(255,255,255,0.05)', width: '80%' }} />
        </div>
      </div>
      <div className="h-5 w-24 rounded-full animate-pulse" style={{ background: 'rgba(255,255,255,0.05)' }} />
      <div className="space-y-2">
        <div className="h-3 rounded animate-pulse" style={{ background: 'rgba(255,255,255,0.05)', width: '90%' }} />
        <div className="h-3 rounded animate-pulse" style={{ background: 'rgba(255,255,255,0.05)', width: '70%' }} />
      </div>
    </div>
  )
}
