'use client'
import { useState, useTransition } from 'react'
import { CheckCircle2, Pencil, X, Check } from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import type { Answer } from '@/types'
import { useAuth } from '@/hooks/useAuth'
import { acceptAnswer, updateAnswer } from '@/app/actions/qa'
import { VoteButtons } from './VoteButtons'

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
    <div
      className={`p-5 rounded-2xl relative transition-all ${answer.is_accepted ? 'border-emerald-500/40' : ''}`}
      style={{
        background: answer.is_accepted ? 'rgba(16,185,129,0.05)' : 'rgba(255,255,255,0.025)',
        border:     `1px solid ${answer.is_accepted ? 'rgba(16,185,129,0.3)' : 'rgba(255,255,255,0.07)'}`,
      }}
    >
      {answer.is_accepted && (
        <div className="flex items-center gap-1 text-xs text-emerald-400 font-medium mb-3">
          <CheckCircle2 className="w-4 h-4" />
          Accepted answer
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
                className="w-full px-4 py-3 rounded-xl text-sm text-slate-800 bg-transparent outline-none resize-y"
                style={{ border: '1px solid rgba(255,255,255,0.15)', background: 'rgba(255,255,255,0.04)' }}
              />
              <div className="flex gap-2">
                <button
                  onClick={handleSaveEdit}
                  disabled={isPending}
                  className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg text-emerald-400 border border-emerald-500/40 hover:bg-emerald-500/10 transition-colors"
                >
                  <Check className="w-3.5 h-3.5" /> Save
                </button>
                <button
                  onClick={() => { setEditing(false); setEditBody(answer.body) }}
                  className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg text-slate-400 border border-slate-600 hover:bg-white/5 transition-colors"
                >
                  <X className="w-3.5 h-3.5" /> Cancel
                </button>
              </div>
            </div>
          ) : (
            <div className="prose-dark prose max-w-none text-sm">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>{answer.body}</ReactMarkdown>
            </div>
          )}

          {/* Footer */}
          <div className="flex items-center justify-between mt-3 pt-3" style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
            <p className="text-xs text-slate-500">
              by <span className="text-slate-400">{answer.author_cn}</span>
              {answer.author_title && <> · {answer.author_title}</>}
              {' · '}{new Date(answer.created_at).toLocaleDateString()}
            </p>
            <div className="flex items-center gap-2">
              {isAnswerAuthor && !editing && (
                <button
                  onClick={() => setEditing(true)}
                  className="flex items-center gap-1 text-xs text-slate-500 hover:text-slate-300 transition-colors"
                >
                  <Pencil className="w-3 h-3" /> Edit
                </button>
              )}
              {isQuestionAuthor && !answer.is_accepted && (
                <button
                  onClick={handleAccept}
                  disabled={isPending}
                  className="flex items-center gap-1 text-xs px-2.5 py-1 rounded-lg text-emerald-400 border border-emerald-500/40 hover:bg-emerald-500/10 transition-colors"
                >
                  <CheckCircle2 className="w-3 h-3" /> Accept
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
