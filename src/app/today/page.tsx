'use client'

import { useState } from 'react'
import Link from 'next/link'
import { calcTodayFortune, type TodayFortune } from '@/lib/today'

const LUCK_COLOR: Record<string, string> = {
  '大吉': '#1a5c3a', '吉': '#2d1f5e', '中吉': '#7a4d0a', '小吉': '#0d4f8a', '末吉': '#6b6560', '凶': '#8b2020',
}
const LUCK_BG: Record<string, string> = {
  '大吉': '#f2fbf5', '吉': '#EEEDFE', '中吉': '#fffbf0', '小吉': '#f0f6ff', '末吉': '#f5f4f0', '凶': '#fff5f5',
}
const LUCK_BORDER: Record<string, string> = {
  '大吉': '#b8d8c0', '吉': '#AFA9EC', '中吉': '#e8c96a80', '小吉': '#85B7EB80', '末吉': '#e0dbd0', '凶': '#f0c4c4',
}
const TZ_COLOR = { good: '#1a5c3a', bad: '#8b2020', neutral: '#534AB7' }
const TZ_BG   = { good: '#f2fbf5', bad: '#fff5f5', neutral: '#f8f7ff' }
const TZ_LABEL = { good: '吉', bad: '注意', neutral: '普通' }

export default function TodayPage() {
  const [birthDate, setBirthDate] = useState('')
  const [fortune, setFortune]     = useState<TodayFortune | null>(null)
  const [loading, setLoading]     = useState(false)

  const today = new Date()
  const dateLabel = `${today.getFullYear()}年${today.getMonth() + 1}月${today.getDate()}日（${'日月火水木金土'[today.getDay()]}）`

  function handleCheck() {
    if (!birthDate) return
    setLoading(true)
    setTimeout(() => {
      setFortune(calcTodayFortune(birthDate))
      setLoading(false)
    }, 600)
  }

  return (
    <div className="min-h-screen bg-paper">
      {/* Header */}
      <header className="bg-deep text-white py-10 px-6 text-center relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none"
          style={{ background: 'radial-gradient(ellipse 80% 60% at 50% 0%,rgba(201,168,76,.2),transparent)' }} />
        <nav className="absolute top-4 left-4">
          <Link href="/" className="text-xs text-white/50 hover:text-white transition">← ホーム</Link>
        </nav>
        <p className="font-display text-xs tracking-[.3em] text-gold mb-2 uppercase">Daily Fortune</p>
        <h1 className="font-display text-2xl font-semibold tracking-widest mb-1">今日の運勢</h1>
        <p className="text-xs text-white/50">{dateLabel}</p>
      </header>

      <div className="max-w-2xl mx-auto px-4 py-8 pb-20">

        {/* 入力 */}
        {!fortune && (
          <div className="card mb-6">
            <h2 className="font-serif text-sm font-medium mb-1 text-deep">生年月日を入力してください</h2>
            <p className="text-xs text-muted mb-4">あなたの命式に合わせた今日の運勢を算出します。毎日更新されます。</p>
            <input type="date" className="form-input mb-3" value={birthDate}
              onChange={e => setBirthDate(e.target.value)} />
            <button className="btn-primary" onClick={handleCheck} disabled={!birthDate || loading}>
              {loading
                ? <span className="flex items-center justify-center gap-2"><span className="spinner" />算出中...</span>
                : '✦ 今日の運勢を見る'}
            </button>
          </div>
        )}

        {/* 広告枠（AdSense設置予定） */}
        <div className="w-full h-16 bg-[#f0ede6] rounded-xl flex items-center justify-center mb-6 border border-border">
          <span className="text-xs text-muted">広告</span>
        </div>

        {fortune && (
          <div className="space-y-4 animate-fade-up">

            {/* 総合運 */}
            <div className="card text-center py-8"
              style={{ background: LUCK_BG[fortune.overall], borderColor: LUCK_BORDER[fortune.overall] }}>
              <p className="text-xs text-muted mb-2 tracking-widest">本日の総合運</p>
              <div className="text-6xl font-medium font-serif mb-2"
                style={{ color: LUCK_COLOR[fortune.overall] }}>{fortune.overall}</div>
              <div className="text-sm text-muted mb-4">スコア {fortune.overallScore}</div>
              <p className="text-sm leading-relaxed text-[#444] max-w-sm mx-auto">{fortune.advice}</p>
            </div>

            {/* 4運スコア */}
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: '金 運', icon: '💰', score: fortune.money,  scheme: { color: '#7a4d0a', bar: 'linear-gradient(to right,#b8903a,#e8c96a)', bg: '#fffbf0', border: '#e8c96a50' } },
                { label: '仕事運', icon: '💼', score: fortune.work,   scheme: { color: '#0d4f8a', bar: 'linear-gradient(to right,#185FA5,#85B7EB)', bg: '#f0f6ff', border: '#85B7EB50' } },
                { label: '恋愛運', icon: '💕', score: fortune.love,   scheme: { color: '#7a1f52', bar: 'linear-gradient(to right,#993556,#ED93B1)', bg: '#fff0f7', border: '#ED93B150' } },
                { label: '健康運', icon: '🌿', score: fortune.health, scheme: { color: '#1a5c3a', bar: 'linear-gradient(to right,#1a5c3a,#5DCAA5)', bg: '#f2fbf5', border: '#b8d8c080' } },
              ].map(({ label, icon, score, scheme }) => (
                <div key={label} className="rounded-2xl p-4 border" style={{ background: scheme.bg, borderColor: scheme.border }}>
                  <div className="text-xl mb-1">{icon}</div>
                  <div className="text-xs font-medium mb-1" style={{ color: scheme.color }}>{label}</div>
                  <div className="text-2xl font-medium font-serif mb-2" style={{ color: scheme.color }}>{score}</div>
                  <div className="h-1.5 rounded-full overflow-hidden bg-black/10">
                    <div className="h-full rounded-full" style={{ width: `${score}%`, background: scheme.bar }} />
                  </div>
                </div>
              ))}
            </div>

            {/* ラッキー情報 */}
            <div className="card">
              <h3 className="font-serif text-sm font-medium mb-3 text-deep">今日のラッキー</h3>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: 'ラッキーカラー', value: fortune.luckyColor, icon: '🎨' },
                  { label: 'ラッキーナンバー', value: fortune.luckyNumber, icon: '🔢' },
                  { label: 'ラッキー方位', value: fortune.luckyDirection, icon: '🧭' },
                  { label: 'ラッキーアイテム', value: fortune.luckyItem, icon: '✨' },
                ].map(item => (
                  <div key={item.label} className="bg-[#faf8f3] rounded-xl p-3 text-center">
                    <div className="text-lg mb-1">{item.icon}</div>
                    <div className="text-[10px] text-muted mb-1">{item.label}</div>
                    <div className="text-sm font-medium text-deep">{item.value}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* 時間帯別運勢 */}
            <div className="card">
              <h3 className="font-serif text-sm font-medium mb-3 text-deep">時間帯別の運勢</h3>
              <div className="space-y-2">
                {fortune.timeZones.map(tz => (
                  <div key={tz.time} className="flex items-center gap-3 p-2.5 rounded-xl"
                    style={{ background: TZ_BG[tz.luck] }}>
                    <div className="text-xs font-medium w-28 flex-shrink-0 text-muted">{tz.time}</div>
                    <span className="text-[10px] px-2 py-0.5 rounded-full font-medium flex-shrink-0"
                      style={{ background: TZ_COLOR[tz.luck] + '20', color: TZ_COLOR[tz.luck] }}>
                      {TZ_LABEL[tz.luck]}
                    </span>
                    <div className="text-xs text-muted leading-relaxed">{tz.desc}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* 注意 */}
            <div className="card bg-[#fff8f6] border-[#f0c4b0]">
              <h3 className="text-sm font-medium text-[#8b2020] mb-2">⚠ 今日の注意点</h3>
              <p className="text-sm text-[#555] leading-relaxed">{fortune.warning}</p>
            </div>

            {/* 今週のアドバイス */}
            <div className="card">
              <h3 className="font-serif text-sm font-medium mb-3 text-deep">今週のアドバイス</h3>
              <div className="mb-3">
                <p className="text-xs font-medium text-[#1a5c3a] mb-2">✓ やると良いこと</p>
                <div className="flex flex-wrap gap-2">
                  {fortune.weekAdvice.doThis.map(d => (
                    <span key={d} className="text-xs px-3 py-1 rounded-full bg-[#f2fbf5] text-[#1a5c3a] border border-[#b8d8c0]">{d}</span>
                  ))}
                </div>
              </div>
              <div className="mb-3">
                <p className="text-xs font-medium text-[#8b2020] mb-2">✕ 避けた方が良いこと</p>
                <div className="flex flex-wrap gap-2">
                  {fortune.weekAdvice.avoidThis.map(a => (
                    <span key={a} className="text-xs px-3 py-1 rounded-full bg-[#fff5f5] text-[#8b2020] border border-[#f0c4c4]">{a}</span>
                  ))}
                </div>
              </div>
              <div className="bg-[#EEEDFE] rounded-xl p-3 mt-2">
                <p className="text-xs text-[#534AB7]">
                  <span className="font-medium">今週のテーマ：</span>{fortune.weekAdvice.focusOn}
                </p>
              </div>
            </div>

            {/* 広告枠 */}
            <div className="w-full h-16 bg-[#f0ede6] rounded-xl flex items-center justify-center border border-border">
              <span className="text-xs text-muted">広告</span>
            </div>

            {/* 別の日付で見る */}
            <button className="btn-outline w-full" onClick={() => setFortune(null)}>
              別の生年月日で見る
            </button>

            {/* 深層鑑定へ誘導 */}
            <div className="card text-center bg-deep border-deep">
              <p className="text-xs text-white/60 mb-2">より深い鑑定を受けたい方へ</p>
              <h3 className="font-serif text-sm font-medium text-gold2 mb-3">AI統合深層鑑定（¥300）</h3>
              <p className="text-xs text-white/60 mb-4 leading-relaxed">
                金運・仕事運・恋愛運の詳細分析、人生年表グラフ、低迷期の乗り越え方など6項目のAI鑑定
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
