import type { Metadata } from 'next'
import './globals.css'
import { getSession } from '@/lib/session'
import { Providers } from './providers'
import { Sidebar } from '@/components/layout/Sidebar'
import { Geist } from "next/font/google";
import { cn } from "@/lib/utils";

const geist = Geist({subsets:['latin'],variable:'--font-sans'});

export const metadata: Metadata = {
  title: 'CSX Search – People & Q&A',
  description: 'Active Directory colleague search with Q&A knowledge forum',
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getSession()
  const initialUser = session.isLoggedIn ? (session.user ?? null) : null

  return (
    <html lang="en" className={cn("font-sans", geist.variable)}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <Providers initialUser={initialUser}>
          <div className="min-h-screen flex h-screen overflow-hidden bg-[#f4f7fb]">
            <Sidebar />
            <main className="flex-1 flex flex-col h-full overflow-hidden relative z-10">
              {children}
            </main>
          </div>
        </Providers>
      </body>
    </html>
  )
}
