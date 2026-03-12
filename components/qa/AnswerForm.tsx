'use client'
import { useState, useTransition } from 'react'
import dynamic from 'next/dynamic'
import { Send } from 'lucide-react'
import { postAnswer } from '@/app/actions/qa'
import { Button } from '@/components/ui/button'

// SSR-disable the markdown editor
const MDEditor = dynamic(() => import('@uiw/react-md-editor').then((m) => m.default), { ssr: false })

interface Props {
  questionId: number
  onSuccess?: () => void
}

export function AnswerForm({ questionId, onSuccess }: Props) {
  const [body, setBody] = useState('')
  const [error, setError] = useState('')
  const [isPending, startTransition] = useTransition()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!body.trim()) { setError('Answer cannot be empty'); return }
    setError('')
    startTransition(async () => {
      try {
        await postAnswer(questionId, body)
        setBody('')
        onSuccess?.()
      } catch (err) {
        setError(String((err as Error).message))
      }
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <h3 className="font-semibold text-slate-800">Your Answer</h3>
      <div data-color-mode="light">
        <MDEditor
          value={body}
          onChange={(v) => setBody(v ?? '')}
          height={200}
          preview="edit"
        />
      </div>
      {error && <p className="text-xs text-destructive">{error}</p>}
      <Button
        type="submit"
        disabled={isPending || !body.trim()}
        className="flex items-center gap-2"
      >
        <Send className="w-4 h-4" />
        {isPending ? 'Posting…' : 'Post Answer'}
      </Button>
    </form>
  )
}
