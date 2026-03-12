'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { AlertCircle } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'

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
      >
        <Alert className="border-brand-200 bg-brand-50">
          <AlertCircle className="w-3.5 h-3.5 text-brand-600" />
          <AlertTitle className="text-brand-700 text-xs font-medium">
            Similar questions already exist — check before posting:
          </AlertTitle>
          <AlertDescription className="mt-1 space-y-1">
            {loading && (
              <div className="flex gap-2 items-center text-xs text-slate-500">
                <div className="w-3 h-3 rounded-full border-2 border-brand-400/40 border-t-brand-400 animate-spin" />
                Searching…
              </div>
            )}
            {similar.map((q) => (
              <Link
                key={q.id}
                href={`/qa/questions/${q.id}`}
                className="block text-sm text-brand-700 hover:text-brand-900 transition-colors truncate"
                target="_blank"
                rel="noopener"
              >
                → {q.title}
              </Link>
            ))}
          </AlertDescription>
        </Alert>
      </motion.div>
    </AnimatePresence>
  )
}
