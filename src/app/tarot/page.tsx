'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'

// ─── 大アルカナ ───────────────────────────────────────────────
const MAJOR_ARCANA = [
  '愚者', '魔術師', '女教皇', '女帝', '皇帝', '法皇', '恋人', '戦車',
  '力', '隠者', '運命の輪', '正義', '吊るされた男', '死神', '節制',
  '悪魔', '塔', '星', '月', '太陽', '審判', '世界',
]

// ─── スプレッド定義 ───────────────────────────────────────────
const SPREADS = [
  {
    id: 'onecard',
    name: '1枚引き',
    icon: '🃏',
    desc: '今のあなたへのメッセージ',
    positions: ['今のあなたへ'],
  },
  {
    id: 'three',
    name: '過去・現在・未来',
    icon: '🌙✨🌟',
    desc: '流れを読む定番の3枚引き',
    positions: ['過去・根本', '現在・状況', '未来・指針'],
  },
  {
    id: 'love',
    name: '恋愛スプレッド',
    icon: '💑',
    desc: 'あなた・相手・2人の関係性',
    positions: ['あなたの気持ち', '相手の気持ち', '2人の行方'],
  },
  {
    id: 'situation',
    name: '状況分析（5枚）',
    icon: '✦',
    desc: '状況・課題・アドバイス・可能性・結論',
    positions: ['現在の状況', '課題・障害', 'アドバイス', '可能性', '結論'],
  },
]

type Spread = typeof SPREADS[number]

interface DrawnCard {
  name: string
  reversed: boolean
  position: string
}

const CARD_COLORS = ['#2d1f5e', '#1a5c3a', '#7a4d0a', '#0d4f8a', '#993556']
const CARD_BG     = ['#EEEDFE', '#f2fbf5', '#fffbf0', '#f0f6ff', '#fff0f7']

function generateCards(spread: Spread): DrawnCard[] {
  const shuffled = [...MAJOR_ARCANA].sort(() => Math.random() - 0.5)
  return spread.positions.map((position, i) => ({
    name: shuffled[i],
    reversed: Math.random() > 0.65,
    position,
  }))
}

// ─── カード1枚コンポーネント ──────────────────────────────────
function TarotCardItem({
  card, isFlipped, canFlip, onClick, index,
}: {
  card: DrawnCard; isFlipped: boolean; canFlip: boolean; onClick: () => void; index: number
}) {
  const color = CARD_COLORS[index % CARD_COLORS.length]
  const bg    = CARD_BG[index % CARD_BG.length]

  return (
    <div
      onClick={canFlip ? onClick : undefined}
      className={`rounded-2xl transition-all duration-500 ${canFlip && !isFlipped ? 'cursor-pointer hover:-translate-y-1 hover:shadow-lg' : ''}`}>
      {!isFlipped ? (
        <div className="rounded-2xl p-4 text-center bg-deep border border-gold/20 min-h-[110px] flex flex-col items-center justify-center">
          <div className="text-3xl mb-2 opacity-60">🌙</div>
          <div className="text-[10px] text-white/40">
            {canFlip ? 'タップして引く' : ''}
          </div>
        </div>
      ) : (
        <div className="rounded-2xl p-4 text-center border min-h-[110px] flex flex-col items-center justify-center animate-fade-up"
          style={{ background: bg, borderColor: color + '40' }}>
          <div className="text-[10px] text-muted mb-2 leading-tight">{card.position}</div>
          <div className={`text-3xl mb-2 ${card.reversed ? 'rotate-180 inline-block' : ''}`}>🃏</div>
          <div className="font-serif text-xs font-semibold leading-tight" style={{ color }}>
            {card.name}
          </div>
          <div className="text-[10px] mt-1 opacity-60" style={{ color }}>
            {card.reversed ? '逆位置' : '正位置'}
          </div>
        </div>
      )}
    </div>
  )
}

// ─── メインページ ─────────────────────────────────────────────
type Phase = 'form' | 'draw' | 'paywall' | 'reading'

export default function TarotPage() {
  const [phase,          setPhase]          = useState<Phase>('form')
  const [selectedSpread, setSelectedSpread] = useState<Spread | null>(null)
  const [question,       setQuestion]       = useState('')
  const [birthDate,      setBirthDate]      = useState('')
  const [cards,          setCards]          = useState<DrawnCard[]>([])
  const [flipped,        setFlipped]        = useState<Set<number>>(new Set())
  const [reading,        setReading]        = useState('')
  const [loading,        setLoading]        = useState(false)
  const [done,           setDone]           = useState(false)
  const [paying,         setPaying]         = useState(false)

  const allFlipped = cards.length > 0 && flipped.size === cards.length

  // 支払い完了後の自動実行
  useEffect(() => {
    const params    = new URLSearchParams(window.location.search)
    const sessionId = params.get('session_id')
    if (!sessionId) return
    window.history.replaceState({}, '', '/tarot')

    const saved = sessionStorage.getItem('hoshiyomi_tarot_input')
    if (!saved) return
    sessionStorage.removeItem('hoshiyomi_tarot_input')

    const { question: q, birthDate: bd, spreadId, cards: c } = JSON.parse(saved) as {
      question: string; birthDate: string; spreadId: string; cards: DrawnCard[]
    }
    const sp = SPREADS.find(s => s.id === spreadId) ?? SPREADS[1]
    setQuestion(q)
    setBirthDate(bd)
    setSelectedSpread(sp)
    setCards(c)
    setFlipped(new Set(c.map((_, i) => i)))
    setPhase('reading')
    startReading(sessionId, q, bd, spreadId, c)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function handleStartDraw() {
    if (!selectedSpread || !question.trim()) return
    const generated = generateCards(selectedSpread)
    setCards(generated)
    setFlipped(new Set())
    setPhase('draw')
  }

  function flipCard(index: number) {
    if (flipped.has(index)) return
    // 1枚ずつ順番に引く
    if (index !== flipped.size) return
    setFlipped(prev => new Set([...prev, index]))
  }

  function handleDrawAll() {
    setFlipped(new Set(cards.map((_, i) => i)))
  }

  useEffect(() => {
    if (allFlipped && phase === 'draw') {
      setTimeout(() => setPhase('paywall'), 600)
    }
  }, [allFlipped, phase])

  async function handlePay() {
    if (paying || !selectedSpread) return
    setPaying(true)
    try {
      sessionStorage.setItem('hoshiyomi_tarot_input', JSON.stringify({
        question, birthDate, spreadId: selectedSpread.id, cards,
      }))
      const res  = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'tarot' }),
      })
      const data = await res.json()
      if (data.url) window.location.href = data.url
      else setPaying(false)
    } catch {
      setPaying(false)
    }
  }

  const startReading = useCallback(async (
    sessionId: string, q: string, bd: string, spreadId: string, c: DrawnCard[]
  ) => {
    setLoading(true); setReading(''); setDone(false)
    try {
      const res = await fetch('/api/tarot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: q, birthDate: bd || undefined, spreadId, cards: c, sessionId }),
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
            const msg = JSON.parse(raw) as { type: string; text?: string }
            if (msg.type === 'delta' && msg.text) setReading(p => p + msg.text)
            else if (msg.type === 'done') setDone(true)
          } catch {}
        }
      }
    } catch {
      setReading('エラーが発生しました。しばらく待ってから再試行してください。')
      setDone(true)
    }
    setLoading(false)
  }, [])

  function handleReset() {
    setPhase('form')
    setSelectedSpread(null)
    setQuestion('')
    setBirthDate('')
    setCards([])
    setFlipped(new Set())
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
        <p className="text-xs text-white/50">スプレッドを選んでカードを引く・AI深層解読 ¥300</p>
      </header>

      <div className="max-w-2xl mx-auto px-4 py-8 pb-20 space-y-4">

        {/* ── Phase: フォーム ── */}
        {phase === 'form' && (
          <>
            {/* スプレッド選択 */}
            <div className="card">
              <h2 className="font-serif text-sm font-medium text-deep mb-1">スプレッドを選んでください</h2>
              <p className="text-xs text-muted mb-4 leading-relaxed">どんな視点でカードに聞きますか？</p>
              <div className="grid grid-cols-2 gap-2">
                {SPREADS.map(sp => (
                  <button key={sp.id} type="button"
                    onClick={() => setSelectedSpread(sp)}
                    className={`text-left rounded-2xl p-3 border transition-all ${
                      selectedSpread?.id === sp.id
                        ? 'border-mid bg-[#EEEDFE]'
                        : 'border-border bg-white hover:border-mid/40'
                    }`}>
                    <div className="text-base mb-1">{sp.icon}</div>
                    <div className="font-serif text-xs font-medium text-deep">{sp.name}</div>
                    <div className="text-[10px] text-muted mt-0.5 leading-relaxed">{sp.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* 悩み入力 */}
            <div className="card">
              <h2 className="font-serif text-sm font-medium text-deep mb-1">悩みや質問を書いてください</h2>
              <p className="text-xs text-muted mb-4 leading-relaxed bg-[#faf8f3] rounded-xl p-3 border-l-2 border-gold">
                心の中の悩みや迷いを正直に。具体的に書くほどカードのメッセージが深まります。
              </p>
              <textarea
                className="form-input resize-none mb-3" rows={4}
                value={question}
                onChange={e => setQuestion(e.target.value)}
                placeholder="例：転職すべきか迷っています。今の仕事を続けるべきでしょうか…" />
              <div className="mb-1">
                <label className="text-xs text-muted block mb-1.5">生年月日（任意）</label>
                <input type="date" className="form-input" value={birthDate}
                  onChange={e => setBirthDate(e.target.value)} />
                <p className="text-xs text-muted/60 mt-1">入力すると命式をカード解釈に統合します</p>
              </div>
            </div>

            <button className="btn-primary w-full"
              disabled={!selectedSpread || !question.trim()}
              onClick={handleStartDraw}>
              🔮 カードを引く
            </button>
          </>
        )}

        {/* ── Phase: カードを引く ── */}
        {(phase === 'draw' || phase === 'paywall' || phase === 'reading') && cards.length > 0 && (
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-serif text-sm font-medium text-deep">
                {selectedSpread?.name} — {flipped.size}/{cards.length}枚
              </h3>
              {phase === 'draw' && !allFlipped && (
                <button onClick={handleDrawAll}
                  className="text-xs text-muted hover:text-deep transition underline">
                  全部引く
                </button>
              )}
            </div>

            <div className={`grid gap-3 ${cards.length === 1 ? 'grid-cols-1 max-w-[160px] mx-auto' : cards.length <= 3 ? 'grid-cols-3' : 'grid-cols-3 sm:grid-cols-5'}`}>
              {cards.map((card, i) => (
                <TarotCardItem
                  key={i}
                  card={card}
                  isFlipped={flipped.has(i)}
                  canFlip={phase === 'draw' && i === flipped.size}
                  onClick={() => flipCard(i)}
                  index={i}
                />
              ))}
            </div>

            {phase === 'draw' && !allFlipped && (
              <p className="text-xs text-muted text-center mt-4">
                カードを1枚ずつタップして引いてください
              </p>
            )}
          </div>
        )}

        {/* ── Phase: ペイウォール ── */}
        {phase === 'paywall' && (
          <div className="card border-2 border-mid bg-[#EEEDFE] animate-fade-up">
            <div className="text-center py-4">
              <div className="text-4xl mb-3">🔮</div>
              <h3 className="font-serif text-lg font-medium text-deep mb-1">カードのメッセージを解読する</h3>
              <div className="text-3xl font-medium font-serif text-deep mb-1">¥300</div>
              <p className="text-xs text-muted mb-5">AIが深層解読・共感コメント・行動指針を生成</p>
              <div className="text-left space-y-1.5 mb-5 bg-white rounded-xl p-4">
                {[
                  { icon: '💬', label: 'あなたの悩みへの共感と寄り添い' },
                  { icon: '🃏', label: '各カードの詳細解釈（位置の意味を踏まえて）' },
                  { icon: '✨', label: '逆位置も前向きにリフレーミング' },
                  { icon: '🎯', label: '今すぐできる具体的な行動指針' },
                  { icon: '🌟', label: '希望と励ましのメッセージ' },
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
                  ? <span className="flex items-center justify-center gap-2"><span className="spinner" />決済画面へ移動中...</span>
                  : '💳 ¥300でAI解読を受ける'}
              </button>
              <p className="text-[10px] text-muted">クレジットカード・各種決済対応（Stripe）</p>
            </div>
          </div>
        )}

        {/* 広告 */}
        <div className="w-full h-16 bg-[#f0ede6] rounded-xl flex items-center justify-center border border-border">
          <span className="text-xs text-muted">広告</span>
        </div>

        {/* ── Phase: 鑑定結果 ── */}
        {phase === 'reading' && (
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
                  <div className="h-full bg-mid rounded-full animate-pulse" style={{ width: '65%' }} />
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
              <h3 className="font-serif text-sm font-medium text-gold2 mb-3">AI統合深層鑑定（¥500）</h3>
              <p className="text-xs text-white/60 mb-4 leading-relaxed">
                7占術統合・金運・仕事運・恋愛運・人生年表・低迷期対策まで6項目のAI鑑定
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
