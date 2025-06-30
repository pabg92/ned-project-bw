import type { Metadata } from 'next'
import './globals.css'

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
    <html lang="en">
      <body>
        <div className="min-h-screen w-full overflow-x-hidden">
          {children}
        </div>
      </body>
    </html>
  )
}
