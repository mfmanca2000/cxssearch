'use client'
import { useEffect, useState } from 'react'
import { Bell } from 'lucide-react'
import { useNotificationPermission } from '@/hooks/useNotifications'

const DISMISSED_KEY = 'csx_push_dismissed'

export function NotificationPermissionPrompt() {
  const { permission, subscribe } = useNotificationPermission()
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (
      permission === 'default' &&
      typeof window !== 'undefined' &&
      !localStorage.getItem(DISMISSED_KEY)
    ) {
      setVisible(true)
    }
  }, [permission])

  if (!visible) return null

  function handleEnable() {
    setVisible(false)
    subscribe()
  }

  function handleDismiss() {
    localStorage.setItem(DISMISSED_KEY, '1')
    setVisible(false)
  }

  return (
    <div
      className="mx-2 my-2 rounded-xl border p-3 text-xs"
      style={{ background: '#f0f4ff', borderColor: '#c7d7f8' }}
    >
      <div className="flex items-center gap-1.5 mb-2 font-semibold text-[#1b2a4a]">
        <Bell className="w-3.5 h-3.5" />
        Enable notifications
      </div>
      <p className="text-slate-500 mb-2 leading-snug">
        Get notified when a question is directed at you or your team.
      </p>
      <div className="flex gap-2">
        <button
          onClick={handleEnable}
          className="flex-1 rounded-lg py-1 text-xs font-medium text-white transition-colors"
          style={{ background: '#2563eb' }}
        >
          Enable
        </button>
        <button
          onClick={handleDismiss}
          className="flex-1 rounded-lg py-1 text-xs font-medium text-slate-500 transition-colors hover:text-[#1b2a4a]"
          style={{ background: '#e2e8f0' }}
        >
          Not now
        </button>
      </div>
    </div>
  )
}
