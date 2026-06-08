// src/app/layout.tsx
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Providers } from './providers'
import { Navbar } from '@/components/layout/Navbar'
import { Sidebar } from '@/components/layout/Sidebar'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'StreamForge',
  description: 'A full-stack video streaming platform',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className={inter.className}>
        <Providers>
          <Navbar />
          <div className="flex pt-14">
            <Sidebar />
            <main className="ml-60 flex-1 min-h-[calc(100vh-3.5rem)]">
              {children}
            </main>
          </div>
        </Providers>
      </body>
    </html>
  )
}
