'use client'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowLeft, CheckCircle2, Clock, Eye, Pencil, X, Check } from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { useState, useTransition } from 'react'
import { useQuestion, useAnswers } from '@/hooks/useQA'
import { useAuth } from '@/hooks/useAuth'
import { updateQuestion } from '@/app/actions/qa'
import { VoteButtons } from './VoteButtons'
import { AnswerCard } from './AnswerCard'
import { AnswerForm } from './AnswerForm'
import { TagChip } from './TagChip'

interface Props {
  id: string
}

export function QuestionDetail({ id }: Props) {
  const { data: question, isLoading, refetch: refetchQ } = useQuestion(id)
  const { data: answers,  refetch: refetchA }            = useAnswers(id)
  const { user } = useAuth()

  const [editing, setEditing] = useState(false)
  const [editTitle, setEditTitle] = useState('')
  const [editBody,  setEditBody]  = useState('')
  const [isPending, startTransition] = useTransition()

  const isAuthor = user?.dn === question?.author_dn

  const startEdit = () => {
    setEditTitle(question?.title ?? '')
    setEditBody(question?.body ?? '')
    setEditing(true)
  }

  const saveEdit = () => {
    startTransition(async () => {
      await updateQuestion(Number(id), { title: editTitle, body: editBody })
      setEditing(false)
      refetchQ()
    })
  }

  if (isLoading) {
    return (
      <div className="flex-1 overflow-y-auto px-6 py-6">
        <div className="max-w-3xl mx-auto space-y-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-8 rounded-xl animate-pulse" style={{ background: 'rgba(255,255,255,0.05)' }} />
          ))}
        </div>
      </div>
    )
  }

  if (!question) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <p className="text-slate-500">Question not found.</p>
      </div>
    )
  }

  return (
    <div className="flex-1 overflow-y-auto px-6 py-6">
      <div className="max-w-3xl mx-auto space-y-8">

        {/* Back link */}
        <Link href="/qa" className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-300 transition-colors w-fit">
          <ArrowLeft className="w-4 h-4" /> Back to Q&A
        </Link>

        {/* Question */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
          <div
            className="p-6 rounded-2xl space-y-4"
            style={{ background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.07)' }}
          >
            <div className="flex items-start gap-4">
              <VoteButtons targetType="question" targetId={question.id} score={Number(question.vote_score)} />

              <div className="flex-1 min-w-0">
                {editing ? (
                  <input
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    className="w-full text-xl font-bold text-slate-700 bg-transparent border-b border-brand-500/50 outline-none pb-1 mb-3"
                  />
                ) : (
                  <h1 className="text-xl font-bold text-slate-700 leading-snug">{question.title}</h1>
                )}

                <div className="flex flex-wrap items-center gap-3 mt-2 text-xs text-slate-500">
                  {question.status === 'answered' ? (
                    <span className="flex items-center gap-1 text-emerald-400">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Answered
                    </span>
                  ) : (
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" /> Open
                    </span>
                  )}
                  <span className="flex items-center gap-1">
                    <Eye className="w-3.5 h-3.5" /> {question.view_count} views
                  </span>
                  <span>by <span className="text-slate-400">{question.author_cn}</span></span>
                  <span>{new Date(question.created_at).toLocaleDateString()}</span>
                </div>

                <div className="flex flex-wrap gap-1.5 mt-3">
                  {question.tags.map((t) => <TagChip key={t} tag={t} linked />)}
                </div>
              </div>

              {isAuthor && (
                <div className="shrink-0">
                  {editing ? (
                    <div className="flex gap-2">
                      <button onClick={saveEdit} disabled={isPending} className="p-1.5 rounded-lg text-emerald-400 hover:bg-emerald-500/10 transition-colors">
                        <Check className="w-4 h-4" />
                      </button>
                      <button onClick={() => setEditing(false)} className="p-1.5 rounded-lg text-slate-400 hover:bg-white/5 transition-colors">
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <button onClick={startEdit} className="p-1.5 rounded-lg text-slate-500 hover:text-slate-300 hover:bg-white/5 transition-colors">
                      <Pencil className="w-4 h-4" />
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Body */}
            <div className="pl-12">
              {editing ? (
                <textarea
                  value={editBody}
                  onChange={(e) => setEditBody(e.target.value)}
                  rows={8}
                  className="w-full px-4 py-3 rounded-xl text-sm text-slate-800 outline-none resize-y"
                  style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.15)' }}
                />
              ) : (
                <div className="prose-dark prose max-w-none text-sm">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>{question.body}</ReactMarkdown>
                </div>
              )}
            </div>
          </div>
        </motion.div>

        {/* Answers */}
        {(answers?.length ?? 0) > 0 && (
          <div className="space-y-4">
            <h2 className="font-semibold text-slate-700">
              {answers!.length} Answer{answers!.length !== 1 ? 's' : ''}
            </h2>
            {answers!.map((a) => (
              <AnswerCard
                key={a.id}
                answer={a}
                questionAuthorDn={question.author_dn}
                onRefetch={() => { refetchA(); refetchQ() }}
              />
            ))}
          </div>
        )}

        {/* Answer form */}
        {user && (
          <div
            className="p-6 rounded-2xl"
            style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}
          >
            <AnswerForm questionId={question.id} onSuccess={() => refetchA()} />
          </div>
        )}
      </div>
    </div>
  )
}
