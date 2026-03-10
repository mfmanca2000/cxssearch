import Link from 'next/link'
import { QADashboard } from '@/components/qa/QADashboard'
import { HelpCircle } from 'lucide-react'

export default function QAPage() {
  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div
        className="px-6 pt-6 pb-4 shrink-0 flex items-center justify-between"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}
      >
        <div>
          <h1 className="text-xl font-bold text-slate-700">Q&A Forum</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Ask questions, share knowledge, find experts
          </p>
        </div>
        <Link
          href="/qa/ask"
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white transition-all"
          style={{ background: 'linear-gradient(135deg,#7c3aed,#06b6d4)' }}
        >
          <HelpCircle className="w-4 h-4" />
          Ask a Question
        </Link>
      </div>

      <QADashboard />
    </div>
  )
}
