'use client'
import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { MessageSquare, Inbox, Users } from 'lucide-react'
import { useQuestions, useTags, useInbox, useMarkInboxRead, type InboxItem } from '@/hooks/useQA'
import { QuestionCard } from './QuestionCard'
import { TagChip } from './TagChip'

type Tab = 'all' | 'inbox' | 'team'

export function QADashboard() {
  const [tab,          setTab]          = useState<Tab>('all')
  const [activeTag,    setActiveTag]    = useState<string>('')
  const [activeStatus, setActiveStatus] = useState<string>('')
  const [page,         setPage]         = useState(1)

  const { data: questions, isLoading, isError } = useQuestions({
    tag:    activeTag    || undefined,
    status: activeStatus || undefined,
    page,
  })
  const { data: tags }  = useTags()
  const { data: inbox } = useInbox()
  const markPersonalRead = useMarkInboxRead('personal')
  const markTeamRead     = useMarkInboxRead('team')

  // Mark the active inbox as read when the user opens it
  useEffect(() => {
    if (tab === 'inbox' && (inbox?.personal.unread ?? 0) > 0) markPersonalRead.mutate()
    if (tab === 'team'  && (inbox?.team.unread    ?? 0) > 0) markTeamRead.mutate()
  }, [tab]) // eslint-disable-line react-hooks/exhaustive-deps

  const personalQuestions = inbox?.personal.questions ?? []
  const personalUnread    = inbox?.personal.unread    ?? 0
  const teamQuestions     = inbox?.team.questions     ?? []
  const teamUnread        = inbox?.team.unread        ?? 0
  const teamOuLabel       = inbox?.team.teamOu
    ? inbox.team.teamOu.split(',')[0]?.replace(/^OU=/i, '') ?? 'My Team'
    : 'My Team'

  return (
    <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">
      {/* Tab bar */}
      <div className="flex border-b" style={{ borderColor: '#e2e8f0' }}>
        {([
          { id: 'all',   icon: MessageSquare, label: 'All questions', badge: 0 },
          { id: 'inbox', icon: Inbox,         label: 'For me',        badge: personalUnread },
          { id: 'team',  icon: Users,         label: teamOuLabel,     badge: teamUnread },
        ] as const).map(({ id, icon: Icon, label, badge }) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            className="flex items-center gap-2 px-5 py-3 text-sm font-semibold transition-all"
            style={tab === id
              ? { color: '#1b2a4a', borderBottom: '2px solid #1b2a4a', marginBottom: '-1px' }
              : { color: '#94a3b8', borderBottom: '2px solid transparent', marginBottom: '-1px' }}
          >
            <Icon className="w-4 h-4" />
            {label}
            {badge > 0 && (
              <span
                className="text-xs font-bold px-1.5 py-0.5 rounded-full min-w-[1.25rem] text-center leading-none"
                style={{ background: '#ef4444', color: '#fff' }}
              >
                {badge > 9 ? '9+' : badge}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* ── For me tab ── */}
      {tab === 'inbox' && (
        <InboxList
          questions={personalQuestions}
          emptyIcon={<Inbox className="w-12 h-12 mx-auto mb-4 opacity-20" style={{ color: '#94a3b8' }} />}
          emptyText="No questions directed at you yet"
          emptySubtext="When someone asks you a question directly, it will appear here."
          showUnreadDot={(q) => !q.notified_at}
        />
      )}

      {/* ── For my team tab ── */}
      {tab === 'team' && (
        <InboxList
          questions={teamQuestions}
          emptyIcon={<Users className="w-12 h-12 mx-auto mb-4 opacity-20" style={{ color: '#94a3b8' }} />}
          emptyText={`No questions directed at ${teamOuLabel} yet`}
          emptySubtext="When someone asks your team a question, it will appear here."
          showUnreadDot={() => false}
        />
      )}

      {/* ── All questions tab ── */}
      {tab === 'all' && (
        <>
          {/* Filters */}
          <div className="flex flex-wrap gap-3 items-center">
            <div className="flex gap-2">
              {['', 'open', 'answered'].map((s) => (
                <button
                  key={s}
                  onClick={() => { setActiveStatus(s); setPage(1) }}
                  className="text-xs px-3 py-1.5 rounded-full border transition-all"
                  style={
                    activeStatus === s
                      ? { background: 'rgba(139,92,246,0.2)', borderColor: 'rgba(139,92,246,0.5)', color: '#c4b5fd' }
                      : { background: 'rgba(255,255,255,0.03)', borderColor: 'rgba(255,255,255,0.08)', color: '#64748b' }
                  }
                >
                  {s === '' ? 'All' : s.charAt(0).toUpperCase() + s.slice(1)}
                </button>
              ))}
            </div>

            {tags && tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {tags.slice(0, 10).map((t) => (
                  <button
                    key={t.tag}
                    onClick={() => { setActiveTag(activeTag === t.tag ? '' : t.tag); setPage(1) }}
                  >
                    <TagChip tag={t.tag} count={t.question_count} />
                  </button>
                ))}
              </div>
            )}
          </div>

          {isLoading && (
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-24 rounded-2xl animate-pulse" style={{ background: 'rgba(255,255,255,0.03)' }} />
              ))}
            </div>
          )}

          {isError && (
            <div className="text-center py-16 text-slate-500">
              <MessageSquare className="w-8 h-8 mx-auto mb-3 opacity-30" />
              <p>Failed to load questions.</p>
            </div>
          )}

          {!isLoading && !isError && (
            <>
              {!questions?.length ? (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="text-center py-20">
                  <MessageSquare className="w-12 h-12 mx-auto mb-4 text-brand-600 opacity-40" />
                  <p className="text-slate-300 font-medium">No questions yet</p>
                  <p className="text-slate-600 text-sm mt-1">Be the first to ask a question!</p>
                </motion.div>
              ) : (
                <div className="space-y-3">
                  {questions.map((q, i) => (
                    <QuestionCard key={q.id} question={q} index={i} />
                  ))}
                </div>
              )}

              {(questions?.length ?? 0) === 20 && (
                <div className="flex justify-center gap-3 pt-4">
                  {page > 1 && (
                    <button onClick={() => setPage((p) => p - 1)} className="text-xs px-4 py-2 rounded-lg text-slate-400 border border-slate-700 hover:bg-white/5 transition-colors">
                      ← Previous
                    </button>
                  )}
                  <button onClick={() => setPage((p) => p + 1)} className="text-xs px-4 py-2 rounded-lg text-slate-400 border border-slate-700 hover:bg-white/5 transition-colors">
                    Next →
                  </button>
                </div>
              )}
            </>
          )}
        </>
      )}
    </div>
  )
}

// ─── Shared inbox list renderer ───────────────────────────────────────────────

function InboxList({
  questions,
  emptyIcon,
  emptyText,
  emptySubtext,
  showUnreadDot,
}: {
  questions: InboxItem[]
  emptyIcon: React.ReactNode
  emptyText: string
  emptySubtext: string
  showUnreadDot: (q: InboxItem) => boolean
}) {
  if (questions.length === 0) {
    return (
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="text-center py-20">
        {emptyIcon}
        <p className="text-slate-400 font-medium">{emptyText}</p>
        <p className="text-slate-600 text-sm mt-1">{emptySubtext}</p>
      </motion.div>
    )
  }
  return (
    <div className="space-y-3">
      {questions.map((q, i) => (
        <div key={q.id} className="relative">
          {showUnreadDot(q) && (
            <span className="absolute -left-2 top-4 w-2 h-2 rounded-full z-10" style={{ background: '#ef4444' }} />
          )}
          <QuestionCard question={q} index={i} />
        </div>
      ))}
    </div>
  )
}
