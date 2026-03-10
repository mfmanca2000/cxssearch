'use client'
import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { LogIn, AlertCircle } from 'lucide-react'
import { useAuthContext } from '@/context/AuthContext'
import { useSearchParams } from 'next/navigation'

export function LoginModal() {
  const { user } = useAuthContext()
  const searchParams = useSearchParams()
  const [error, setError] = useState('')

  useEffect(() => {
    const authError = searchParams.get('auth_error')
    if (authError) {
      const messages: Record<string, string> = {
        missing_params:        'Authentication cancelled or missing parameters.',
        invalid_state:         'Security check failed. Please try again.',
        token_exchange_failed: 'Could not complete sign-in. Please try again.',
      }
      setError(messages[authError] ?? `Authentication error: ${authError}`)
      // Clean the URL
      window.history.replaceState({}, '', window.location.pathname)
    }
  }, [searchParams])

  if (user) return null

  return (
    <AnimatePresence>
      <motion.div
        key="login-backdrop"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="fixed inset-0 z-[100] flex items-center justify-center p-4"
        style={{ background: 'rgba(27,42,74,0.5)', backdropFilter: 'blur(8px)' }}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 28 }}
          className="w-full max-w-sm rounded-2xl p-8 relative bg-white"
          style={{
            border:    '1px solid #e2e8f0',
            boxShadow: '0 20px 60px rgba(27,42,74,0.2)',
          }}
        >
          {/* Logo */}
          <div className="flex items-center gap-3 mb-8">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold"
              style={{ background: 'linear-gradient(135deg,#1b2a4a,#2563eb)' }}
            >
              C
            </div>
            <div>
              <p className="font-semibold text-[#1b2a4a]">CSX Search</p>
              <p className="text-slate-400 text-xs">Sign in to continue</p>
            </div>
          </div>

          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                className="flex items-center gap-2 text-xs text-red-600 px-3 py-2 rounded-lg mb-4"
                style={{ background: '#fef2f2', border: '1px solid #fecaca' }}
              >
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                {error}
              </motion.div>
            )}
          </AnimatePresence>

          <a
            href="/api/auth/oauth"
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-sm text-white transition-all duration-200"
            style={{ background: '#1b2a4a' }}
          >
            <LogIn className="w-4 h-4" />
            Sign in with Corporate SSO
          </a>

          <p className="text-xs text-slate-400 text-center mt-6">
            You will be redirected to your company&apos;s identity provider.
          </p>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
