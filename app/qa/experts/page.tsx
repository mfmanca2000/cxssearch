import { ExpertDirectory } from '@/components/qa/ExpertDirectory'

export default function ExpertsPage() {
  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden">
      <div
        className="px-6 pt-6 pb-4 shrink-0"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}
      >
        <h1 className="text-xl font-bold text-slate-700">Expert Directory</h1>
        <p className="text-sm text-slate-500 mt-0.5">
          Find the right person for your question based on their knowledge and activity
        </p>
      </div>
      <ExpertDirectory />
    </div>
  )
}
