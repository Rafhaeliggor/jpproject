import type { Metadata } from 'next'
import { Inter, Noto_Sans_JP, Open_Sans, Lexend, Source_Sans_3 } from 'next/font/google'
import VLibrasWidget from '@/components/VLibrasWidget/VLibrasWidget'
import KeyboardNavManager from '@/components/KeyboardNavManager/KeyboardNavManager'
import { AuthProvider } from '@/contexts/AuthContext'
import './globals.css'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

const notoSansJP = Noto_Sans_JP({
  subsets: ['latin'],
  variable: '--font-noto-sans-jp',
  weight: ['400', '500', '600', '700'],
  display: 'swap',
})

const openSans = Open_Sans({
  subsets: ['latin'],
  variable: '--font-open-sans',
  weight: ['400', '500', '600', '700'],
  display: 'swap',
})

const lexend = Lexend({
  subsets: ['latin'],
  variable: '--font-lexend',
  weight: ['400', '500', '600', '700'],
  display: 'swap',
})

const sourceSans3 = Source_Sans_3({
  subsets: ['latin'],
  variable: '--font-source-sans',
  weight: ['400', '500', '600', '700'],
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Viagem Colaborativa',
  description: 'POC de planejamento colaborativo de viagem ao Japão',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html
      lang="pt-BR"
      className={`${inter.variable} ${notoSansJP.variable} ${openSans.variable} ${lexend.variable} ${sourceSans3.variable}`}
    >
      <head>
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css"
        />
      </head>
      <body>
        <AuthProvider>
          {children}
        </AuthProvider>
        <VLibrasWidget />
        <KeyboardNavManager />
      </body>
    </html>
  )
}
