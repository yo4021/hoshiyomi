'use client'

import { useState } from 'react'

interface ShareButtonsProps {
  text: string
}

export default function ShareButtons({ text }: ShareButtonsProps) {
  const [copied, setCopied] = useState(false)

  const url = typeof window !== 'undefined' ? window.location.href : ''
  const fullText = text + '\n' + url
  const encodedFull = encodeURIComponent(fullText)
  const encodedUrl  = encodeURIComponent(url)
  const encodedText = encodeURIComponent(text)

  function copyLink() {
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  return (
    <div className="card text-center">
      <p className="text-xs text-muted mb-3">結果をシェアする</p>
      <div className="flex gap-2 justify-center flex-wrap">
        <a
          href={`https://twitter.com/intent/tweet?text=${encodedFull}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-medium bg-black text-white hover:bg-[#111] transition"
        >
          𝕏 でシェア
        </a>
        <a
          href={`https://www.threads.net/intent/post?text=${encodedFull}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-medium bg-[#1a1a1a] text-white hover:bg-[#333] transition"
        >
          Threads
        </a>
        <a
          href={`https://social-plugins.line.me/lineit/share?url=${encodedUrl}&text=${encodedText}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-medium bg-[#00B900] text-white hover:bg-[#009900] transition"
        >
          LINE
        </a>
        <button
          onClick={copyLink}
          className="flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-medium bg-[#f0ede6] text-deep hover:bg-[#e8e4dc] transition"
        >
          {copied ? '✓ コピー済み' : '🔗 リンクをコピー'}
        </button>
      </div>
    </div>
  )
}
