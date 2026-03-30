'use client'

import { useState } from 'react'
import Link from 'next/link'

const WORRY_EXAMPLES = [
  '仕事を変えるべきか', '今の恋愛の行方', 'お金の不安', '人間関係のトラブル',
  '新しいことを始めるタイミング', '転居・引越しすべきか', '大切な決断について', '今の自分に必要なこと',
]

interface DrawnCard {
  name: string
  reversed: boolean
  position: string
}

const POSITION_COLORS = ['#2d1f5e', '#1a5c3a', '#7a4d0a']
const POSITION_BG    = ['#EEEDFE', '#f2fbf5', '#fffbf0']

export default function TarotPage() {
  const [question,  setQuestion]  = useState('')
  const [birthDate, setBirthDate] = useState('')
  const [cards,     setCards]     = useState<DrawnCard[]>([])
  const [reading,   setReading]   = useState('')
  const [loading,   setLoading]   = useState(false)
  const [done,      setDone]      = useState(false)

  async function handleDraw() {
    if (!question.trim() || loading) return
    setLoading(true)
    setCards([])
    setReading('')
    setDone(false)

    try {
      const res = await fetch('/api/tarot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question, birthDate: birthDate || undefined }),
      })
      if (!res.ok) { setLoading(false); return }

      const reader = res.body!.getReader()
      const dec    = new TextDecoder()
      let buf      = ''

      while (true) {
        const { done: d, value } = await reader.read()
        if (d) break
        buf += dec.decode(value, { stream: true })
        const lines = buf.split('\n')
        buf = lines.pop() ?? ''

        for (const line of lines) {
          if (!line.startsWith('data: ')) continue
          const raw = line.slice(6).trim()
          if (!raw) continue
          try {
            const msg = JSON.parse(raw) as {
              type: string
              cards?: DrawnCard[]
              text?: string
            }
            if (msg.type === 'cards' && msg.cards) setCards(msg.cards)
            else if (msg.type === 'delta' && msg.text) setReading(p => p + msg.text)
            else if (msg.type === 'done') setDone(true)
          } catch {}
        }
      }
    } catch {
      setReading('エラーが発生しました。しばらく待ってから再試行してください。')
      setDone(true)
    }
    setLoading(false)
  }

  function handleReset() {
    setQuestion('')
    setBirthDate('')
    setCards([])
    setReading('')
    setDone(false)
  }

  return (
    <div className="min-h-screen bg-paper">
      <header className="bg-deep text-white py-10 px-6 text-center relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none"
          style={{ background: 'radial-gradient(ellipse 80% 60% at 50% 0%,rgba(201,168,76,.2),transparent)' }} />
        <nav className="absolute top-4 left-4">
          <Link href="/" className="text-xs text-white/50 hover:text-white transition">← ホーム</Link>
        </nav>
        <p className="font-display text-xs tracking-[.3em] text-gold mb-2 uppercase">Tarot Reading</p>
        <h1 className="font-display text-2xl font-semibold tracking-widest mb-1">タロット悩み相談</h1>
        <p className="text-xs text-white/50">悩みを入力して3枚のカードを引く・無料</p>
      </header>

      <div className="max-w-2xl mx-auto px-4 py-8 pb-20 space-y-4">

        {/* 入力フォーム */}
        <div className="card">
          <h2 className="font-serif text-sm font-medium text-deep mb-1">悩み・質問を入力してください</h2>
          <p className="text-xs text-muted mb-4 leading-relaxed bg-[#faf8f3] rounded-xl p-3 border-l-2 border-gold">
            心の中の悩みや迷いを正直に書いてください。具体的に書くほど、カードのメッセージがあなたに届きやすくなります。
          </p>

          <p className="text-xs text-muted mb-2">よくある悩み（タップで入力）</p>
          <div className="flex flex-wrap gap-2 mb-4">
            {WORRY_EXAMPLES.map(ex => (
              <button key={ex} type="button"
                onClick={() => setQuestion(ex)}
                className="text-xs px-3 py-1.5 rounded-full border border-border bg-white hover:bg-light hover:border-mid transition">
                {ex}
              </button>
            ))}
          </div>

          <textarea
            className="form-input resize-none mb-3" rows={4}
            value={question}
            onChange={e => setQuestion(e.target.value)}
            placeholder="例：転職を考えているのですが、今の仕事を続けるべきか迷っています…" />

          <div className="mb-4">
            <label className="text-xs text-muted block mb-1.5">生年月日（任意）</label>
            <input type="date" className="form-input" value={birthDate}
              onChange={e => setBirthDate(e.target.value)} />
            <p className="text-xs text-muted/60 mt-1">入力すると命式をカード解釈に統合します</p>
          </div>

          <button className="btn-primary" onClick={handleDraw}
            disabled={!question.trim() || loading}>
            {loading
              ? <span className="flex items-center justify-center gap-2"><span className="spinner" />カードを読み解き中...</span>
              : '🔮 3枚のカードを引く（無料）'}
          </button>
        </div>

        {/* 広告 */}
        <div className="w-full h-16 bg-[#f0ede6] rounded-xl flex items-center justify-center border border-border">
          <span className="text-xs text-muted">広告</span>
        </div>

        {/* カード表示 */}
        {cards.length > 0 && (
          <div className="card animate-fade-up">
            <h3 className="font-serif text-sm font-medium text-deep mb-4 text-center">引いたカード</h3>
            <div className="grid grid-cols-3 gap-3">
              {cards.map((card, i) => (
                <div key={i} className="text-center rounded-2xl p-4 border"
                  style={{ background: POSITION_BG[i], borderColor: POSITION_COLORS[i] + '40' }}>
                  <div className="text-[10px] text-muted mb-2">{card.position}</div>
                  <div className={`text-3xl mb-2 ${card.reversed ? 'rotate-180 inline-block' : ''}`}>🃏</div>
                  <div className="font-serif text-xs font-medium" style={{ color: POSITION_COLORS[i] }}>
                    {card.name}
                  </div>
                  <div className="text-[10px] mt-1 opacity-70" style={{ color: POSITION_COLORS[i] }}>
                    {card.reversed ? '逆位置' : '正位置'}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 鑑定結果 */}
        {(reading || (loading && cards.length > 0)) && (
          <div className="card animate-fade-up">
            <div className="flex items-center gap-2 mb-4 pb-3 border-b border-border">
              <span className="text-lg">🔮</span>
              <h3 className="font-serif text-sm font-medium flex-1">タロット鑑定</h3>
              <span className="badge">AI生成</span>
            </div>
            {!reading && loading ? (
              <div className="py-6 space-y-3">
                <div className="flex items-center gap-2 text-muted">
                  <span className="spinner" />
                  <span className="text-sm">カードのメッセージを読み解き中...</span>
                </div>
                <div className="h-1.5 bg-[#f0ede6] rounded-full overflow-hidden">
                  <div className="h-full bg-mid rounded-full animate-pulse" style={{ width: '60%' }} />
                </div>
              </div>
            ) : (
              <div className={`text-sm leading-loose text-[#333] whitespace-pre-wrap ${!done ? 'typing-cursor' : ''}`}>
                {reading}
              </div>
            )}
          </div>
        )}

        {done && reading && (
          <div className="space-y-4 animate-fade-up">
            <div className="w-full h-16 bg-[#f0ede6] rounded-xl flex items-center justify-center border border-border">
              <span className="text-xs text-muted">広告</span>
            </div>
            <button className="btn-outline w-full" onClick={handleReset}>
              別の悩みを相談する
            </button>
            <div className="card text-center bg-deep border-deep">
              <p className="text-xs text-white/60 mb-2">命式からさらに深い鑑定を</p>
              <h3 className="font-serif text-sm font-medium text-gold2 mb-3">AI統合深層鑑定（¥300）</h3>
              <p className="text-xs text-white/60 mb-4 leading-relaxed">
                金運・仕事運・恋愛運・人生年表・低迷期の乗り越え方まで6項目のAI鑑定
              </p>
              <Link href="/fortune"
                className="inline-block bg-gold text-deep text-xs font-medium px-6 py-2.5 rounded-full hover:bg-gold2 transition">
                ✦ 深層鑑定を受ける
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
