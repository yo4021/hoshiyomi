'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

const DREAM_EXAMPLES = [
  '空を飛ぶ','追いかけられる','歯が抜ける','水・海・川',
  '試験に遅刻','亡くなった人','蛇が出てくる','家・部屋',
  '結婚式','火事・炎','赤ちゃん','動物',
  '知らない人','暗い場所','高いところ','花・植物',
]

const WHAT_YOU_GET = [
  { icon:'🔍', title:'夢のシンボル解読',       desc:'登場する人・場所・物・感情を東西両方の夢占いで丁寧に解説' },
  { icon:'🧠', title:'潜在意識からのメッセージ', desc:'ユング・フロイト心理学の観点から深層心理を読み解く' },
  { icon:'💭', title:'現在の心理状態',           desc:'この夢が映し出すあなたの今の感情・ストレス・欲求' },
  { icon:'🔮', title:'近未来への暗示',           desc:'1〜3ヶ月以内の恋愛・仕事・対人関係への予兆' },
  { icon:'✨', title:'開運アドバイス',           desc:'夢をポジティブエネルギーに変える具体的な行動指針3つ以上' },
]

function renderText(t: string) {
  return t
    .replace(/\*\*(.*?)\*\*/g,'<strong style="color:#2d1f5e">$1</strong>')
    .replace(/\n\n/g,'</p><p style="margin-bottom:1rem">')
    .replace(/\n/g,'<br/>')
}

export default function DreamPage() {
  const [keywords,  setKeywords]  = useState('')
  const [birthDate, setBirthDate] = useState('')
  const [result,    setResult]    = useState('')
  const [loading,   setLoading]   = useState(false)
  const [done,      setDone]      = useState(false)
  const [paying,    setPaying]    = useState(false)

  // 支払い完了後の自動実行
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const sessionId = params.get('session_id')
    if (!sessionId) return

    // URLをきれいにする（戻るボタンで再実行されないよう）
    window.history.replaceState({}, '', '/dream')

    const saved = sessionStorage.getItem('hoshiyomi_dream_input')
    if (!saved) return
    sessionStorage.removeItem('hoshiyomi_dream_input')

    const { keywords: kw, birthDate: bd } = JSON.parse(saved) as { keywords: string; birthDate: string }
    setKeywords(kw)
    setBirthDate(bd)
    startDream(sessionId, kw, bd)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function handlePay() {
    if (!keywords.trim() || paying) return
    setPaying(true)
    try {
      sessionStorage.setItem('hoshiyomi_dream_input', JSON.stringify({ keywords, birthDate }))
      const res = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'dream' }),
      })
      const data = await res.json()
      if (data.url) window.location.href = data.url
      else setPaying(false)
    } catch {
      setPaying(false)
    }
  }

  async function startDream(sessionId: string, kw: string, bd: string) {
    setLoading(true); setResult(''); setDone(false)
    try {
      const res = await fetch('/api/dream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ keywords: kw, birthDate: bd || undefined, sessionId }),
      })
      if (!res.ok) { setLoading(false); return }
      const reader = res.body!.getReader(); const dec = new TextDecoder(); let buf = ''
      while (true) {
        const { done: d, value } = await reader.read(); if (d) break
        buf += dec.decode(value, { stream: true })
        const lines = buf.split('\n'); buf = lines.pop() ?? ''
        for (const line of lines) {
          if (!line.startsWith('data: ')) continue
          const raw = line.slice(6).trim()
          if (raw === '[DONE]') { setDone(true); break }
          try { const j = JSON.parse(raw); if (j.text) setResult(p => p + j.text) } catch {}
        }
      }
    } catch { setResult('エラーが発生しました。しばらく待ってから再試行してください。') }
    setLoading(false); setDone(true)
  }

  return (
    <div className="min-h-screen bg-paper">
      <header className="bg-deep text-white py-10 px-6 text-center relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none"
          style={{background:'radial-gradient(ellipse 80% 60% at 50% 0%,rgba(201,168,76,.2),transparent)'}}/>
        <nav className="absolute top-4 left-4">
          <Link href="/" className="text-xs text-white/50 hover:text-white transition">← ホーム</Link>
        </nav>
        <p className="font-display text-xs tracking-[.3em] text-gold mb-2 uppercase">Dream Fortune</p>
        <h1 className="font-display text-2xl font-semibold tracking-widest mb-1">夢占い</h1>
        <p className="text-xs text-white/50">AIが夢の深層メッセージを800〜1000字で読み解きます</p>
      </header>

      <div className="max-w-2xl mx-auto px-4 py-8 pb-20 space-y-4">

        {/* サービス説明 */}
        <div className="card">
          <div className="flex items-center gap-3 mb-3">
            <span className="text-2xl">🌙</span>
            <div>
              <h2 className="font-serif text-sm font-medium text-deep">AI夢占い深層鑑定</h2>
              <div className="flex items-center gap-2 mt-1 flex-wrap">
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-[#EEEDFE] text-mid font-medium">¥100/回</span>
                <span className="text-xs text-muted">読み応えのある詳細鑑定</span>
              </div>
            </div>
          </div>
          <p className="text-xs text-muted leading-relaxed mb-4 bg-[#faf8f3] rounded-xl p-3 border-l-2 border-gold">
            「〇〇の夢は△△を意味する」というシンプルな解釈ではなく、東西の夢占い・ユング心理学・あなたの命式を統合した深層分析を提供します。夢のすべての要素を丁寧に読み解き、今のあなたへの具体的なメッセージをお伝えします。
          </p>
          <div className="space-y-2">
            {WHAT_YOU_GET.map(item=>(
              <div key={item.title} className="flex items-start gap-3 p-2.5 rounded-xl bg-[#faf8f3]">
                <span className="text-base flex-shrink-0">{item.icon}</span>
                <div>
                  <div className="text-xs font-medium text-deep">{item.title}</div>
                  <div className="text-xs text-muted leading-relaxed">{item.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 入力フォーム */}
        <div className="card">
          <h3 className="font-serif text-sm font-medium text-deep mb-1">夢の内容を入力</h3>
          <p className="text-xs text-muted mb-4 leading-relaxed">
            見た夢のキーワードや状況を自由に入力してください。詳しく書くほど精度の高い鑑定になります。断片的な記憶でも大丈夫です。
          </p>
          <p className="text-xs text-muted mb-2">よく見られる夢（タップで追加）</p>
          <div className="flex flex-wrap gap-2 mb-4">
            {DREAM_EXAMPLES.map(ex=>(
              <button key={ex} type="button"
                onClick={()=>setKeywords(p=>p?p+'、'+ex:ex)}
                className="text-xs px-3 py-1.5 rounded-full border border-border bg-white hover:bg-light hover:border-mid transition">
                {ex}
              </button>
            ))}
          </div>
          <textarea className="form-input resize-none mb-3" rows={4}
            value={keywords} onChange={e=>setKeywords(e.target.value)}
            placeholder="例：花に囲まれていて、どくどくと脈打ちながら四方から圧迫されて、高いところから落ちた…" />
          <div className="mb-4">
            <label className="text-xs text-muted block mb-1.5">生年月日（任意）</label>
            <input type="date" className="form-input" value={birthDate} onChange={e=>setBirthDate(e.target.value)}/>
            <p className="text-xs text-muted/60 mt-1">入力すると命式（星座・九星・四柱）を夢の解釈に統合します</p>
          </div>
          <button className="btn-primary" onClick={handlePay} disabled={!keywords.trim() || paying || loading}>
            {paying
              ? <span className="flex items-center justify-center gap-2"><span className="spinner"/>決済画面へ移動中...</span>
              : '🌙 ¥100で購入して夢を占う'}
          </button>
        </div>

        {/* 広告枠 */}
        <div className="w-full h-16 bg-[#f0ede6] rounded-xl flex items-center justify-center border border-border">
          <span className="text-xs text-muted">広告</span>
        </div>

        {/* 鑑定結果 */}
        {(result || loading) && (
          <div className="card animate-fade-up">
            <div className="flex items-center gap-2 mb-4 pb-3 border-b border-border">
              <span className="text-lg">🌙</span>
              <h3 className="font-serif text-sm font-medium flex-1">夢占い深層鑑定結果</h3>
              <span className="badge">AI生成</span>
            </div>
            {!result && loading ? (
              <div className="py-6 space-y-3">
                <div className="flex items-center gap-2 text-muted">
                  <span className="spinner"/>
                  <span className="text-sm">夢の深層を分析中...（30〜60秒かかります）</span>
                </div>
                <div className="h-1.5 bg-[#f0ede6] rounded-full overflow-hidden">
                  <div className="h-full bg-mid rounded-full animate-pulse" style={{width:'70%'}}/>
                </div>
              </div>
            ) : (
              <div className={`text-sm leading-loose text-[#333] ${!done?'typing-cursor':''}`}>
                <p dangerouslySetInnerHTML={{__html:renderText(result)}}/>
              </div>
            )}
          </div>
        )}

        {done && result && (
          <div className="space-y-4 animate-fade-up">
            <div className="w-full h-16 bg-[#f0ede6] rounded-xl flex items-center justify-center border border-border">
              <span className="text-xs text-muted">広告</span>
            </div>
            <button className="btn-outline w-full"
              onClick={()=>{setResult('');setKeywords('');setDone(false)}}>
              別の夢を占う
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
