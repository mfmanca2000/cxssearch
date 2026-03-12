'use client'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { MessageSquare, Eye } from 'lucide-react'
import type { Question } from '@/types'
import { TagChip } from './TagChip'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

interface Props {
  question: Question
  index?: number
}

export function QuestionCard({ question, index = 0 }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, delay: Math.min(index * 0.04, 0.3) }}
    >
      <Link href={`/qa/questions/${question.id}`}>
        <Card className="px-5 py-4 hover:ring-brand-300 transition-all cursor-pointer group">
          {/* Header row */}
          <div className="flex items-start gap-3">
            {/* Vote score */}
            <div className="shrink-0 flex flex-col items-center">
              <span className={`text-lg font-bold ${Number(question.vote_score) > 0 ? 'text-emerald-600' : 'text-slate-400'}`}>
                {question.vote_score ?? 0}
              </span>
              <span className="text-xs text-slate-500">votes</span>
            </div>

            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-slate-700 group-hover:text-brand-600 transition-colors line-clamp-2 leading-snug">
                {question.title}
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                by <span className="text-slate-600">{question.author_cn}</span>{' '}
                · {new Date(question.created_at).toLocaleDateString()}
              </p>
            </div>

            {/* Status badge */}
            <div className="shrink-0">
              {question.status === 'answered' ? (
                <Badge className="bg-emerald-100 text-emerald-700 border border-emerald-200">Answered</Badge>
              ) : (
                <Badge variant="outline">Open</Badge>
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
        </Card>
      </Link>
    </motion.div>
  )
}
