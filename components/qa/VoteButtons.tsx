'use client'
import { useState, useTransition } from 'react'
import { ChevronUp, ChevronDown } from 'lucide-react'
import { voteQuestion, voteAnswer } from '@/app/actions/qa'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

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

  const containerCls = vertical
    ? 'flex flex-col items-center gap-1'
    : 'flex items-center gap-2'

  return (
    <div className={containerCls}>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => vote(1)}
        disabled={isPending}
        className="h-7 w-7 text-slate-400 hover:text-emerald-600"
        aria-label="Upvote"
      >
        <ChevronUp className="w-5 h-5" />
      </Button>
      <span
        className={cn(
          'text-sm font-semibold min-w-[1.5rem] text-center',
          optimisticScore > 0 ? 'text-emerald-600' : optimisticScore < 0 ? 'text-red-500' : 'text-slate-400',
        )}
      >
        {optimisticScore}
      </span>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => vote(-1)}
        disabled={isPending}
        className="h-7 w-7 text-slate-400 hover:text-red-500"
        aria-label="Downvote"
      >
        <ChevronDown className="w-5 h-5" />
      </Button>
    </div>
  )
}
