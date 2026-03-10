'use client'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { MessageSquare, Eye, CheckCircle2, Clock } from 'lucide-react'
import type { Question } from '@/types'
import { TagChip } from './TagChip'

interface Props {
  question: Question
  index?: number
}

export function QuestionCard({ question, index = 0 }: Props) {
  const statusColors: Record<string, string> = {
    open:     '#94a3b8',
    answered: '#34d399',
    closed:   '#f87171',
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, delay: Math.min(index * 0.04, 0.3) }}
    >
      <Link href={`/qa/questions/${question.id}`}>
        <div
          className="group p-5 rounded-2xl border transition-all duration-200 hover:border-brand-500/40 cursor-pointer"
          style={{
            background: 'rgba(255,255,255,0.025)',
            border:     '1px solid rgba(255,255,255,0.07)',
          }}
        >
          {/* Header row */}
          <div className="flex items-start gap-3">
            {/* Vote score */}
            <div className="shrink-0 flex flex-col items-center">
              <span
                className="text-lg font-bold"
                style={{ color: Number(question.vote_score) > 0 ? '#34d399' : '#64748b' }}
              >
                {question.vote_score ?? 0}
              </span>
              <span className="text-xs text-slate-600">votes</span>
            </div>

            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-slate-700 group-hover:text-brand-300 transition-colors line-clamp-2 leading-snug">
                {question.title}
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                by <span className="text-slate-400">{question.author_cn}</span>{' '}
                · {new Date(question.created_at).toLocaleDateString()}
              </p>
            </div>

            {/* Status badge */}
            <div className="shrink-0">
              {question.status === 'answered' ? (
                <CheckCircle2 className="w-5 h-5" style={{ color: statusColors.answered }} />
              ) : (
                <Clock className="w-5 h-5" style={{ color: statusColors[question.status] ?? '#94a3b8' }} />
              )}
            </div>
          </div>

          {/* Tags + stats */}
          <div className="mt-3 flex items-center justify-between gap-3 flex-wrap">
            <div className="flex flex-wrap gap-1.5">
              {question.tags.map((t) => (
                <TagChip key={t} tag={t} />
              ))}
            </div>
            <div className="flex items-center gap-3 text-xs text-slate-500 shrink-0">
              <span className="flex items-center gap-1">
                <MessageSquare className="w-3.5 h-3.5" />
                {question.answer_count ?? 0}
              </span>
              <span className="flex items-center gap-1">
                <Eye className="w-3.5 h-3.5" />
                {question.view_count}
              </span>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  )
}
