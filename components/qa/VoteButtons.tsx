'use client'
import { useState, useTransition } from 'react'
import { ChevronUp, ChevronDown } from 'lucide-react'
import { voteQuestion, voteAnswer } from '@/app/actions/qa'

interface Props {
  targetType: 'question' | 'answer'
  targetId: number
  score: number
  vertical?: boolean
}

export function VoteButtons({ targetType, targetId, score, vertical = true }: Props) {
  const [isPending, startTransition] = useTransition()
  const [optimisticScore, setOptimisticScore] = useState(score)

  const vote = (value: 1 | -1) => {
    setOptimisticScore((s) => s + value)
    startTransition(async () => {
      try {
        if (targetType === 'question') {
          await voteQuestion(targetId, value)
        } else {
          await voteAnswer(targetId, value)
        }
      } catch {
        setOptimisticScore((s) => s - value)
      }
    })
  }

  const base = 'p-1 rounded transition-colors hover:bg-white/10 disabled:opacity-40'
  const containerCls = vertical
    ? 'flex flex-col items-center gap-1'
    : 'flex items-center gap-2'

  return (
    <div className={containerCls}>
      <button
        onClick={() => vote(1)}
        disabled={isPending}
        className={`${base} text-slate-400 hover:text-emerald-400`}
        aria-label="Upvote"
      >
        <ChevronUp className="w-5 h-5" />
      </button>
      <span
        className="text-sm font-semibold min-w-[1.5rem] text-center"
        style={{ color: optimisticScore > 0 ? '#34d399' : optimisticScore < 0 ? '#f87171' : '#94a3b8' }}
      >
        {optimisticScore}
      </span>
      <button
        onClick={() => vote(-1)}
        disabled={isPending}
        className={`${base} text-slate-400 hover:text-red-400`}
        aria-label="Downvote"
      >
        <ChevronDown className="w-5 h-5" />
      </button>
    </div>
  )
}
