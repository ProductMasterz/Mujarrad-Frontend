import './globals.css'
import '@/styles/markdown.css'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { Providers } from './providers'
import { Navbar } from '@/components/layout/Navbar'
import { ChatSidePanelHost } from '@/components/chat/ChatSidePanelHost'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Mujarrad - Knowledge Graph',
  description: 'Visual knowledge graph management system',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Providers>
          <div className="flex min-h-screen flex-col">
            <Navbar />
            <main className="flex-1">{children}</main>
          </div>
          <ChatSidePanelHost />
        </Providers>
      </body>
    </html>
  )
}
