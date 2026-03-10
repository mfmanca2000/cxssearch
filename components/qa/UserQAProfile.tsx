'use client'
import Link from 'next/link'
import { MessageSquare, HelpCircle, CheckCircle2 } from 'lucide-react'
import { useUserQAProfile } from '@/hooks/useQA'
import { TagChip } from './TagChip'

interface Props {
  dn: string
  cn: string
}

export function UserQAProfile({ dn, cn }: Props) {
  const { data, isLoading } = useUserQAProfile(dn)

  if (isLoading) {
    return (
      <div className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-wider text-slate-600">Q&A Activity</p>
        <div className="space-y-2">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-4 rounded animate-pulse" style={{ background: 'rgba(255,255,255,0.05)', width: `${70 - i * 10}%` }} />
          ))}
        </div>
      </div>
    )
  }

  const hasActivity = (data?.questions?.length ?? 0) + (data?.answers?.length ?? 0) > 0

  return (
    <div className="space-y-4">
      <p className="text-xs font-semibold uppercase tracking-wider text-slate-600">Q&A Activity</p>

      {!hasActivity && (
        <p className="text-xs text-slate-600">No Q&A activity yet.</p>
      )}

      {(data?.top_tags?.length ?? 0) > 0 && (
        <div className="space-y-1.5">
          <p className="text-xs text-slate-500">Top topics</p>
          <div className="flex flex-wrap gap-1.5">
            {data!.top_tags.map((t) => <TagChip key={t} tag={t} linked />)}
          </div>
        </div>
      )}

      {(data?.questions?.length ?? 0) > 0 && (
        <div className="space-y-1.5">
          <p className="text-xs text-slate-500 flex items-center gap-1">
            <HelpCircle className="w-3.5 h-3.5" /> Recent questions
          </p>
          <div className="space-y-1">
            {data!.questions.slice(0, 3).map((q: any) => (
              <Link
                key={q.id}
                href={`/qa/questions/${q.id}`}
                className="block text-xs text-slate-400 hover:text-brand-400 transition-colors truncate"
              >
                → {q.title}
              </Link>
            ))}
          </div>
        </div>
      )}

      {(data?.answers?.length ?? 0) > 0 && (
        <div className="space-y-1.5">
          <p className="text-xs text-slate-500 flex items-center gap-1">
            <MessageSquare className="w-3.5 h-3.5" /> Recent answers
          </p>
          <div className="space-y-1">
            {data!.answers.slice(0, 3).map((a: any) => (
              <Link
                key={a.id}
                href={`/qa/questions/${a.question_id}`}
                className="block text-xs text-slate-400 hover:text-brand-400 transition-colors truncate flex items-center gap-1"
              >
                {a.is_accepted && <CheckCircle2 className="w-3 h-3 text-emerald-400 shrink-0" />}
                → {a.question_title}
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
