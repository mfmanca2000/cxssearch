'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { AlertCircle } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

interface SimilarQuestion {
  id: number
  title: string
  status: string
}

interface Props {
  title: string
}

export function SimilarQuestions({ title }: Props) {
  const [similar, setSimilar] = useState<SimilarQuestion[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (title.trim().length < 5) {
      setSimilar([])
      return
    }

    const timer = setTimeout(async () => {
      setLoading(true)
      try {
        const res = await fetch(`/api/qa/questions/similar?title=${encodeURIComponent(title)}`)
        const data = await res.json()
        setSimilar(data)
      } catch {
        setSimilar([])
      } finally {
        setLoading(false)
      }
    }, 400)

    return () => clearTimeout(timer)
  }, [title])

  if (!similar.length && !loading) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8 }}
        className="rounded-xl p-4 space-y-2"
        style={{ background: 'rgba(6,182,212,0.06)', border: '1px solid rgba(6,182,212,0.2)' }}
      >
        <div className="flex items-center gap-2 text-xs text-cyan-300 font-medium">
          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
          Similar questions already exist — check before posting:
        </div>
        {loading && (
          <div className="flex gap-2 items-center text-xs text-slate-500">
            <div className="w-3 h-3 rounded-full border-2 border-cyan-500/40 border-t-cyan-400 animate-spin" />
            Searching…
          </div>
        )}
        {similar.map((q) => (
          <Link
            key={q.id}
            href={`/qa/questions/${q.id}`}
            className="block text-sm text-slate-300 hover:text-brand-300 transition-colors truncate"
            target="_blank"
            rel="noopener"
          >
            → {q.title}
          </Link>
        ))}
      </motion.div>
    </AnimatePresence>
  )
}
