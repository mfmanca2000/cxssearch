'use client'
import { useState } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { AuthProvider } from '@/context/AuthContext'
import { LoginModal } from '@/components/auth/LoginModal'
import { useToastState, ToastContainer } from '@/components/notifications/NotificationToast'
import { useNotifications } from '@/hooks/useNotifications'
import type { AuthUser } from '@/types'

function NotificationsWrapper({ children }: { children: React.ReactNode }) {
  const { toasts, showToast, dismiss } = useToastState()
  useNotifications(showToast)
  return (
    <>
      {children}
      <ToastContainer toasts={toasts} onDismiss={dismiss} />
    </>
  )
}

export function Providers({
  children,
  initialUser,
}: {
  children: React.ReactNode
  initialUser: AuthUser | null
}) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            retry: 1,
            refetchOnWindowFocus: false,
            staleTime: 5 * 60 * 1000,
          },
        },
      }),
  )

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider initialUser={initialUser}>
        <NotificationsWrapper>
          {children}
        </NotificationsWrapper>
        <LoginModal />
      </AuthProvider>
    </QueryClientProvider>
  )
}
