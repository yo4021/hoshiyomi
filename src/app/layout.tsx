import type { Metadata } from 'next'
import { Noto_Sans_JP, Noto_Serif_JP, Cinzel } from 'next/font/google'
import './globals.css'

const notoSans = Noto_Sans_JP({
  subsets: ['latin'],
  weight: ['300', '400', '500'],
  variable: '--font-noto-sans',
  display: 'swap',
})
const notoSerif = Noto_Serif_JP({
  subsets: ['latin'],
  weight: ['300', '400', '500', '700'],
  variable: '--font-noto-serif',
  display: 'swap',
})
const cinzel = Cinzel({
  subsets: ['latin'],
  weight: ['400', '600'],
  variable: '--font-cinzel',
  display: 'swap',
})

export const metadata: Metadata = {
  title: '星詠み | AI統合占術エンジン',
  description: '西洋・東洋・姓名判断を統合し、歳差補正で現代に最適化。AIが金運・仕事運・恋愛運を含む深層鑑定を生成します。',
  keywords: '占い,AI占い,統合占術,西洋占星術,四柱推命,九星気学,姓名判断,金運,恋愛運',
  openGraph: {
    title: '星詠み | AI統合占術エンジン',
    description: '複数占術を統合したAI鑑定。歳差補正・季節補正で精度を向上。金運・仕事運・恋愛運を詳細に鑑定。',
    locale: 'ja_JP',
    type: 'website',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja" className={`${notoSans.variable} ${notoSerif.variable} ${cinzel.variable}`}>
      <body className="font-sans bg-paper text-ink antialiased">
        {children}
      </body>
    </html>
  )
}
