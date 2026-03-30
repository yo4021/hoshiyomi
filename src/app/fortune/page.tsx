'use client'

import { useState, useCallback, useEffect } from 'react'
import type { DivinationInput, DivinationResult, ReadingSection } from '@/types'
import { buildDivinationResult } from '@/lib/divination'
import FortuneForm from '@/components/divination/FortuneForm'
import FortuneResults from '@/components/divination/FortuneResults'

export default function FortunePage() {
  const [result,           setResult]           = useState<DivinationResult | null>(null)
  const [loading,          setLoading]          = useState(false)
  const [error,            setError]            = useState<string | null>(null)
  const [streamingSection, setStreamingSection] = useState<ReadingSection | null>(null)
  const [currentInput,     setCurrentInput]     = useState<DivinationInput | null>(null)
  const [showAiPaywall,    setShowAiPaywall]    = useState(false)
  const [paying,           setPaying]           = useState(false)

  // 支払い完了後の自動実行
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const sessionId = params.get('session_id')
    if (!sessionId) return

    window.history.replaceState({}, '', '/fortune')

    const saved = sessionStorage.getItem('hoshiyomi_fortune_input')
    if (!saved) return
    sessionStorage.removeItem('hoshiyomi_fortune_input')

    const input = JSON.parse(saved) as DivinationInput
    const calcResult = buildDivinationResult(input)
    setResult(calcResult)
    setCurrentInput(input)
    setShowAiPaywall(false)
    startAI(input, sessionId)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // フォーム送信：計算のみ（無料）
  const handleSubmit = useCallback((input: DivinationInput) => {
    const calcResult = buildDivinationResult(input)
    setResult(calcResult)
    setCurrentInput(input)
    setShowAiPaywall(true)
    setError(null)
  }, [])

  // Stripe決済へ
  async function handlePay() {
    if (!currentInput || paying) return
    setPaying(true)
    try {
      sessionStorage.setItem('hoshiyomi_fortune_input', JSON.stringify(currentInput))
      const res = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'fortune' }),
      })
      const data = await res.json()
      if (data.url) window.location.href = data.url
      else setPaying(false)
    } catch {
      setPaying(false)
    }
  }

  // AI生成（支払い後）
  async function startAI(input: DivinationInput, sessionId: string) {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/divination', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...input, sessionId }),
      })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error ?? 'API Error')
      }

      const reader  = res.body!.getReader()
      const decoder = new TextDecoder()
      let buffer    = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split('\n')
        buffer = lines.pop() ?? ''

        for (const line of lines) {
          if (!line.startsWith('data: ')) continue
          const raw = line.slice(6).trim()
          if (!raw) continue
          try {
            const msg = JSON.parse(raw) as {
              type: string
              section?: ReadingSection
              text?: string
            }
            if (msg.type === 'section_start') {
              setStreamingSection(msg.section ?? null)
            } else if (msg.type === 'delta' && msg.section && msg.text) {
              setResult(prev => {
                if (!prev) return prev
                return {
                  ...prev,
                  readings: {
                    ...prev.readings,
                    [msg.section!]: (prev.readings[msg.section as ReadingSection] ?? '') + msg.text,
                  },
                }
              })
            } else if (msg.type === 'section_done') {
              setStreamingSection(null)
            } else if (msg.type === 'done') {
              setLoading(false)
              setStreamingSection(null)
            }
          } catch { /* skip */ }
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '鑑定中にエラーが発生しました。')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-paper">
      <header className="relative bg-deep text-white py-10 px-6 text-center overflow-hidden">
        <div className="absolute inset-0 pointer-events-none"
          style={{ background: 'radial-gradient(ellipse 80% 60% at 50% 0%, rgba(201,168,76,.2), transparent)' }} />
        <p className="font-display text-xs tracking-[.3em] text-gold mb-2 uppercase">
          Integrated Divination System
        </p>
        <h1 className="font-display text-2xl md:text-3xl font-semibold tracking-widest mb-2">
          星詠み<span className="text-gold2">占術</span>エンジン
        </h1>
        <p className="text-xs text-white/45 tracking-widest">
          歳差補正 × AI深層鑑定 × 人生運勢グラフ
        </p>
      </header>

      <div className="max-w-3xl mx-auto px-4 pb-24 pt-8">
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
            ⚠️ {error}
          </div>
        )}

        <FortuneForm onSubmit={handleSubmit} loading={loading} />

        {/* 計算結果 + AIペイウォール */}
        {result && (
          <div className="mt-8 animate-fade-up">
            {showAiPaywall ? (
              <>
                {/* 命式スコア（無料部分）*/}
                <FortuneResults result={result} streamingSection={null} paywallActive />

                {/* AIペイウォール */}
                <div className="card border-2 border-mid bg-[#EEEDFE] mt-5">
                  <div className="text-center py-4">
                    <div className="text-4xl mb-3">✦</div>
                    <h3 className="font-serif text-lg font-medium text-deep mb-1">AI深層鑑定を解除する</h3>
                    <div className="text-3xl font-medium font-serif text-deep mb-1">¥300</div>
                    <p className="text-xs text-muted mb-5">1回分・6項目の詳細AI鑑定</p>
                    <div className="text-left space-y-1.5 mb-5 bg-white rounded-xl p-4">
                      {[
                        { icon:'🌟', label:'総合運・人生テーマ' },
                        { icon:'💰', label:'金運・財運の詳細分析' },
                        { icon:'💑', label:'恋愛運・結婚運' },
                        { icon:'💼', label:'仕事運・才能開花' },
                        { icon:'🔮', label:'今の運気と転機' },
                        { icon:'🛡', label:'低迷期の乗り越え方' },
                      ].map(item => (
                        <p key={item.label} className="text-xs text-muted">
                          {item.icon} <span className="text-deep font-medium">{item.label}</span>
                        </p>
                      ))}
                    </div>
                    <button
                      onClick={handlePay}
                      disabled={paying}
                      className="w-full py-3.5 bg-deep text-white text-sm font-medium rounded-xl hover:bg-[#1e1446] transition mb-2 tracking-wide disabled:opacity-60">
                      {paying
                        ? <span className="flex items-center justify-center gap-2"><span className="spinner"/>決済画面へ移動中...</span>
                        : '💳 ¥300でAI鑑定を解除する'}
                    </button>
                    <p className="text-[10px] text-muted">クレジットカード・各種決済対応（Stripe）</p>
                  </div>
                </div>
              </>
            ) : (
              <FortuneResults result={result} streamingSection={streamingSection} />
            )}
          </div>
        )}
      </div>
    </div>
  )
}
