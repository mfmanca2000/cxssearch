'use client'
import { useEffect, useRef, useState } from 'react'
import { useInbox } from '@/hooks/useQA'
import { useAuth } from '@/hooks/useAuth'
import type { ToastMessage } from '@/components/notifications/NotificationToast'

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
  const rawData = atob(base64)
  return Uint8Array.from([...rawData].map((c) => c.charCodeAt(0)))
}

// ─── useNotifications ─────────────────────────────────────────────────────────

export function useNotifications(showToast: (msg: Omit<ToastMessage, 'id'>) => void) {
  const { user } = useAuth()
  const { data: inbox } = useInbox()
  const prevUnread = useRef(0)

  // Register service worker once user is authenticated
  useEffect(() => {
    if (!user || typeof window === 'undefined' || !('serviceWorker' in navigator)) return
    navigator.serviceWorker.register('/sw.js').catch(console.error)
  }, [user])

  // Show in-app toast when unread count increases and tab is visible
  useEffect(() => {
    if (!inbox) return
    const total = (inbox.personal.unread ?? 0) + (inbox.team.unread ?? 0)
    if (total > prevUnread.current && document.visibilityState === 'visible') {
      // Find the newest unread question to surface in the toast
      const newest =
        inbox.personal.questions.find((q) => !q.notified_at) ??
        inbox.team.questions[0] ??
        null

      if (newest) {
        showToast({
          title: newest.title,
          body: `From ${newest.author_cn}`,
          url: `/qa/questions/${newest.id}`,
        })
      }
    }
    prevUnread.current = total
  }, [inbox, showToast])
}

// ─── useNotificationPermission ───────────────────────────────────────────────

export function useNotificationPermission() {
  const [permission, setPermission] = useState<NotificationPermission | 'unsupported'>('default')

  useEffect(() => {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      setPermission('unsupported')
    } else {
      setPermission(Notification.permission)
    }
  }, [])

  async function subscribe() {
    if (!('Notification' in window) || !('serviceWorker' in navigator)) return

    const perm = await Notification.requestPermission()
    setPermission(perm)
    if (perm !== 'granted') return

    const reg = await navigator.serviceWorker.ready

    const keyRes = await fetch('/api/notifications/vapid-public-key')
    const { publicKey } = await keyRes.json()

    const sub = await reg.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(publicKey) as BufferSource,
    })

    await fetch('/api/notifications/subscribe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(sub.toJSON()),
    })
  }

  async function unsubscribe() {
    if (!('serviceWorker' in navigator)) return

    const reg = await navigator.serviceWorker.ready
    const sub = await reg.pushManager.getSubscription()
    if (!sub) return

    await fetch('/api/notifications/subscribe', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ endpoint: sub.endpoint }),
    })
    await sub.unsubscribe()
    setPermission('default')
  }

  return { permission, subscribe, unsubscribe }
}
