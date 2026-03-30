'use client'

import { useEffect } from 'react'

declare global {
  interface Window { adsbygoogle: unknown[] }
}

// ① AdSenseの管理画面で取得したパブリッシャーIDに変更してください
const PUBLISHER_ID = 'ca-pub-XXXXXXXXXX'

interface Props {
  slot: string        // ② 広告ユニットごとのスロットIDに変更してください
  format?: 'auto' | 'rectangle' | 'horizontal'
  className?: string
}

export default function AdBanner({ slot, format = 'auto', className = '' }: Props) {
  useEffect(() => {
    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({})
    } catch {}
  }, [])

  return (
    <ins
      className={`adsbygoogle ${className}`}
      style={{ display: 'block' }}
      data-ad-client={PUBLISHER_ID}
      data-ad-slot={slot}
      data-ad-format={format}
      data-full-width-responsive="true"
    />
  )
}
