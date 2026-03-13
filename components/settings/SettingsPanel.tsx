'use client'
import { useEffect, useState } from 'react'
import { Mail, Bell, BellOff, Loader2, AlertCircle } from 'lucide-react'
import { useNotificationPermission } from '@/hooks/useNotifications'

interface UserSettings {
  email_notifications: boolean
}

function Toggle({
  checked,
  onChange,
  disabled,
}: {
  checked: boolean
  onChange: (v: boolean) => void
  disabled?: boolean
}) {
  return (
    <button
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      disabled={disabled}
      className="relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 disabled:opacity-50 shrink-0"
      style={{ background: checked ? '#2563eb' : '#cbd5e1' }}
    >
      <span
        className="inline-block h-4 w-4 rounded-full bg-white shadow transition-transform"
        style={{ transform: checked ? 'translateX(1.125rem)' : 'translateX(0.125rem)' }}
      />
    </button>
  )
}

function PushNotificationRow() {
  const { permission, subscribe, unsubscribe } = useNotificationPermission()

  if (permission === 'unsupported') {
    return (
      <div className="flex items-start gap-3 opacity-60">
        <div className="mt-0.5 w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
          style={{ background: '#f1f5f9' }}>
          <BellOff className="w-4 h-4 text-slate-400" />
        </div>
        <div className="flex-1">
          <p className="text-sm font-medium text-[#1b2a4a]">Browser push notifications</p>
          <p className="text-xs text-slate-400 mt-0.5 leading-snug">
            Not supported in this browser.
          </p>
        </div>
      </div>
    )
  }

  const isGranted = permission === 'granted'
  const isDenied  = permission === 'denied'

  return (
    <div className="flex items-start gap-3">
      <div className="mt-0.5 w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
        style={{ background: '#f0f4ff' }}>
        <Bell className="w-4 h-4 text-blue-600" />
      </div>
      <div className="flex-1">
        <p className="text-sm font-medium text-[#1b2a4a]">Browser push notifications</p>
        <p className="text-xs text-slate-400 mt-0.5 leading-snug">
          {isDenied
            ? 'Blocked by your browser. Allow notifications for this site in your browser settings.'
            : 'Get a browser notification when a question is directed at you or your team.'}
        </p>
        {isDenied && (
          <p className="flex items-center gap-1 text-xs text-amber-600 mt-1">
            <AlertCircle className="w-3 h-3 shrink-0" />
            Permission denied — change it in your browser site settings.
          </p>
        )}
      </div>
      <div className="mt-0.5">
        <Toggle
          checked={isGranted}
          onChange={(v) => (v ? subscribe() : unsubscribe())}
          disabled={isDenied}
        />
      </div>
    </div>
  )
}

export function SettingsPanel() {
  const [settings, setSettings] = useState<UserSettings | null>(null)
  const [saving,   setSaving]   = useState(false)
  const [saved,    setSaved]    = useState(false)
  const [error,    setError]    = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/settings')
      .then((r) => r.json())
      .then((data) => setSettings(data))
      .catch(() => setError('Failed to load settings.'))
  }, [])

  async function handleToggle(key: keyof UserSettings, value: boolean) {
    if (!settings) return
    const prev = settings
    setSettings({ ...settings, [key]: value })
    setSaving(true)
    setSaved(false)
    setError(null)
    try {
      const res = await fetch('/api/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ [key]: value }),
      })
      if (!res.ok) throw new Error('Save failed')
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    } catch {
      setSettings(prev)
      setError('Failed to save settings.')
    } finally {
      setSaving(false)
    }
  }

  if (!settings && !error) {
    return (
      <div className="flex items-center gap-2 text-slate-400 text-sm">
        <Loader2 className="w-4 h-4 animate-spin" />
        Loading…
      </div>
    )
  }

  if (error && !settings) {
    return <p className="text-sm text-red-500">{error}</p>
  }

  return (
    <div className="max-w-lg space-y-6">
      <section>
        <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-3">
          Notifications
        </h2>

        <div
          className="rounded-xl border bg-white p-4 divide-y"
          style={{ borderColor: '#e2e8f0', divideColor: '#f1f5f9' }}
        >
          {/* Browser push notifications */}
          <div className="pb-4">
            <PushNotificationRow />
          </div>

          {/* Email notifications */}
          <div className="pt-4 flex items-start gap-3">
            <div className="mt-0.5 w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
              style={{ background: '#f0f4ff' }}>
              <Mail className="w-4 h-4 text-blue-600" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-[#1b2a4a]">Email notifications</p>
              <p className="text-xs text-slate-400 mt-0.5 leading-snug">
                Receive an email when a question is directed at you or your team.
                Requires SMTP to be configured by your admin.
              </p>
            </div>
            <div className="mt-0.5">
              <Toggle
                checked={settings!.email_notifications}
                onChange={(v) => handleToggle('email_notifications', v)}
                disabled={saving}
              />
            </div>
          </div>
        </div>
      </section>

      <div className="h-5 text-xs">
        {saving && (
          <span className="flex items-center gap-1 text-slate-400">
            <Loader2 className="w-3 h-3 animate-spin" /> Saving…
          </span>
        )}
        {saved && <span className="text-green-600">Settings saved.</span>}
        {error && <span className="text-red-500">{error}</span>}
      </div>
    </div>
  )
}
