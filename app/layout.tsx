import type { Metadata } from 'next'
import { ClerkProvider } from '@clerk/nextjs'
import { Toaster } from 'sonner'
import './globals.css'
import './globals-print.css'

export const metadata: Metadata = {
  title: 'Board Champions',
  description: 'Winning Expert Talent appointments',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body>
          <div className="min-h-screen w-full overflow-x-hidden">
            {children}
          </div>
          <Toaster position="top-right" richColors />
        </body>
      </html>
    </ClerkProvider>
  )
}
