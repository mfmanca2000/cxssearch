import { Suspense } from 'react'
import { QuestionForm } from '@/components/qa/QuestionForm'

export default function AskPage() {
  return (
    <div className="flex-1 overflow-y-auto px-6 py-6">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-xl font-bold text-slate-700 mb-2">Ask a Question</h1>
        <p className="text-sm text-slate-500 mb-8">
          Share your question with the team. Be specific so others can help you effectively.
        </p>
        <Suspense>
          <QuestionForm />
        </Suspense>
      </div>
    </div>
  )
}
