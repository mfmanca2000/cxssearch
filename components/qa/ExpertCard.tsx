'use client'
import Link from 'next/link'
import { CheckCircle2, MessageSquare, Star } from 'lucide-react'
import type { Expert } from '@/types'
import { Avatar } from '@/components/people/Avatar'

interface Props {
  expert: Expert
}

export function ExpertCard({ expert }: Props) {
  const hasQAActivity = expert.answer_count > 0

  return (
    <div
      className="p-5 rounded-2xl flex flex-col gap-4"
      style={{
        background: 'rgba(255,255,255,0.03)',
        border:     '1px solid rgba(255,255,255,0.07)',
      }}
    >
      {/* Header */}
      <div className="flex items-start gap-3">
        <Avatar name={expert.cn} size={48} />
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-slate-700 truncate">{expert.cn}</p>
          {expert.title && (
            <p className="text-xs text-slate-400 truncate">{expert.title}</p>
          )}
          {expert.department && (
            <p className="text-xs text-slate-600 truncate">{expert.department}</p>
          )}
        </div>
      </div>

      {/* Skill chips (up to 4) */}
      {expert.skills.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {expert.skills.slice(0, 4).map((s) => (
            <span
              key={s}
              className="text-[10px] px-2 py-0.5 rounded-full font-medium"
              style={{
                background: 'rgba(139,92,246,0.12)',
                border:     '1px solid rgba(139,92,246,0.25)',
                color:      '#a78bfa',
              }}
            >
              {s}
            </span>
          ))}
          {expert.skills.length > 4 && (
            <span
              className="text-[10px] px-2 py-0.5 rounded-full"
              style={{ background: 'rgba(255,255,255,0.04)', color: '#64748b' }}
            >
              +{expert.skills.length - 4}
            </span>
          )}
        </div>
      )}

      {/* Q&A stats (only when there is activity) */}
      {hasQAActivity && (
        <div className="flex items-center gap-3 text-xs text-slate-500">
          <span className="flex items-center gap-1">
            <MessageSquare className="w-3.5 h-3.5" />
            {expert.answer_count} answers
          </span>
          {expert.accepted_count > 0 && (
            <span className="flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              {expert.accepted_count} accepted
            </span>
          )}
          <span className="flex items-center gap-1 ml-auto">
            <Star className="w-3.5 h-3.5 text-amber-400" />
            {Math.round(expert.score)}
          </span>
        </div>
      )}

      {/* Ask Expert button */}
      <Link
        href={`/qa/ask?expert=${encodeURIComponent(expert.dn)}&expert_name=${encodeURIComponent(expert.cn)}`}
        className="text-center text-xs py-2 rounded-xl transition-all mt-auto"
        style={{
          background: 'rgba(139,92,246,0.1)',
          border:     '1px solid rgba(139,92,246,0.3)',
          color:      '#c4b5fd',
        }}
      >
        Ask this expert
      </Link>
    </div>
  )
}
