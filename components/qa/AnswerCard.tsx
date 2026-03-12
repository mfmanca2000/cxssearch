'use client'
import { useState, useTransition } from 'react'
import { CheckCircle2, Pencil, X, Check } from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeHighlight from 'rehype-highlight'
import type { Answer } from '@/types'
import { useAuth } from '@/hooks/useAuth'
import { acceptAnswer, updateAnswer } from '@/app/actions/qa'
import { VoteButtons } from './VoteButtons'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface Props {
  answer: Answer
  questionAuthorDn: string
  onRefetch?: () => void
}

export function AnswerCard({ answer, questionAuthorDn, onRefetch }: Props) {
  const { user } = useAuth()
  const [editing, setEditing] = useState(false)
  const [editBody, setEditBody] = useState(answer.body)
  const [isPending, startTransition] = useTransition()

  const isQuestionAuthor = user?.dn === questionAuthorDn
  const isAnswerAuthor   = user?.dn === answer.author_dn

  const handleAccept = () => {
    startTransition(async () => {
      await acceptAnswer(answer.id)
      onRefetch?.()
    })
  }

  const handleSaveEdit = () => {
    startTransition(async () => {
      await updateAnswer(answer.id, editBody)
      setEditing(false)
      onRefetch?.()
    })
  }

  return (
    <Card className={cn(
      'p-5 relative transition-all',
      answer.is_accepted && 'border-emerald-300 bg-emerald-50/50',
    )}>
      {answer.is_accepted && (
        <div className="flex items-center gap-1.5 mb-3">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <Badge className="bg-emerald-100 text-emerald-700 border border-emerald-200">
            Accepted answer
          </Badge>
        </div>
      )}

      <div className="flex gap-4">
        {/* Vote column */}
        <VoteButtons targetType="answer" targetId={answer.id} score={Number(answer.vote_score)} />

        {/* Content */}
        <div className="flex-1 min-w-0">
          {editing ? (
            <div className="space-y-3">
              <textarea
                value={editBody}
                onChange={(e) => setEditBody(e.target.value)}
                rows={6}
                className="w-full px-4 py-3 rounded-xl text-sm text-slate-800 bg-white border border-input outline-none resize-y"
              />
              <div className="flex gap-2">
                <Button
                  size="sm"
                  onClick={handleSaveEdit}
                  disabled={isPending}
                  className="flex items-center gap-1.5"
                >
                  <Check className="w-3.5 h-3.5" /> Save
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => { setEditing(false); setEditBody(answer.body) }}
                  className="flex items-center gap-1.5"
                >
                  <X className="w-3.5 h-3.5" /> Cancel
                </Button>
              </div>
            </div>
          ) : (
            <div className="prose-dark prose max-w-none text-sm">
              <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeHighlight]}>
                {answer.body}
              </ReactMarkdown>
            </div>
          )}

          <div className="h-px bg-border my-3" />

          {/* Footer */}
          <div className="flex items-center justify-between">
            <p className="text-xs text-slate-500">
              by <span className="text-slate-600">{answer.author_cn}</span>
              {answer.author_title && <> · {answer.author_title}</>}
              {' · '}{new Date(answer.created_at).toLocaleDateString()}
            </p>
            <div className="flex items-center gap-2">
              {isAnswerAuthor && !editing && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setEditing(true)}
                  className="h-6 w-6 text-slate-500"
                  aria-label="Edit answer"
                >
                  <Pencil className="w-3 h-3" />
                </Button>
              )}
              {isQuestionAuthor && !answer.is_accepted && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleAccept}
                  disabled={isPending}
                  className="text-emerald-600 border-emerald-300 hover:bg-emerald-50 flex items-center gap-1"
                >
                  <CheckCircle2 className="w-3 h-3" /> Accept
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </Card>
  )
}
