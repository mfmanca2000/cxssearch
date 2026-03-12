'use client'
import { useState, useCallback, useEffect, useRef } from 'react'
import { Bell, X } from 'lucide-react'
import { useRouter } from 'next/navigation'

export interface ToastMessage {
  id: string
  title: string
  body: string
  url: string
}

export function useToastState() {
  const [toasts, setToasts] = useState<ToastMessage[]>([])
  const timers = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map())

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
    const timer = timers.current.get(id)
    if (timer) { clearTimeout(timer); timers.current.delete(id) }
  }, [])

  const showToast = useCallback((msg: Omit<ToastMessage, 'id'>) => {
    const id = crypto.randomUUID()
    setToasts((prev) => [...prev, { ...msg, id }])
    const timer = setTimeout(() => dismiss(id), 6000)
    timers.current.set(id, timer)
  }, [dismiss])

  // Cleanup on unmount
  useEffect(() => {
    return () => { timers.current.forEach(clearTimeout) }
  }, [])

  return { toasts, showToast, dismiss }
}

export function ToastContainer({
  toasts,
  onDismiss,
}: {
  toasts: ToastMessage[]
  onDismiss: (id: string) => void
}) {
  const router = useRouter()

  if (!toasts.length) return null

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-full">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className="flex items-start gap-3 rounded-xl shadow-lg border p-3 cursor-pointer"
          style={{ background: '#1b2a4a', borderColor: '#2563eb', color: '#fff' }}
          onClick={() => { router.push(toast.url); onDismiss(toast.id) }}
        >
          <Bell className="w-4 h-4 shrink-0 mt-0.5 text-blue-400" />
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold truncate">{toast.title}</p>
            <p className="text-xs text-slate-300 line-clamp-2">{toast.body}</p>
          </div>
          <button
            onClick={(e) => { e.stopPropagation(); onDismiss(toast.id) }}
            className="text-slate-400 hover:text-white shrink-0"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      ))}
    </div>
  )
}
