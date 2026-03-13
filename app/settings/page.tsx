import { SettingsPanel } from '@/components/settings/SettingsPanel'
import { Settings } from 'lucide-react'

export default function SettingsPage() {
  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden">
      <div
        className="px-6 pt-6 pb-4 shrink-0"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}
      >
        <div className="flex items-center gap-2">
          <Settings className="w-5 h-5 text-slate-500" />
          <div>
            <h1 className="text-xl font-bold text-slate-700">Settings</h1>
            <p className="text-sm text-slate-500 mt-0.5">Manage your preferences</p>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        <SettingsPanel />
      </div>
    </div>
  )
}
