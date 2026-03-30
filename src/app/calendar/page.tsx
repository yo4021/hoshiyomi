'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'

// シードハッシュ
function hash(s: string): number {
  let h = 0; for (let i = 0; i < s.length; i++) h = Math.imul(31, h) + s.charCodeAt(i) | 0; return Math.abs(h)
}

type DayType = 'taian' | 'shakku' | 'sensho' | 'tomobiki' | 'senbu' | 'butsumetsu'
const ROKUYOU: Record<DayType, { label: string; meaning: string; color: string; bg: string }> = {
  taian:    { label: '大安', meaning: '万事吉。特に婚礼・引越し・開業に最良', color: '#1a5c3a', bg: '#f2fbf5' },
  shakku:   { label: '赤口', meaning: '正午のみ吉。朝夕は凶。注意が必要な日', color: '#8b2020', bg: '#fff5f5' },
  sensho:   { label: '先勝', meaning: '午前中が吉。急ぎごとに向く', color: '#2d1f5e', bg: '#EEEDFE' },
  tomobiki: { label: '友引', meaning: '友を引く日。慶事は吉、葬儀は避ける', color: '#7a4d0a', bg: '#fffbf0' },
  senbu:    { label: '先負', meaning: '午後が吉。慌てず穏やかに過ごす日', color: '#0d4f8a', bg: '#f0f6ff' },
  butsumetsu:{ label: '仏滅', meaning: '六曜中最も凶とされる日。新事には不向き', color: '#6b6560', bg: '#f5f4f0' },
}
const ROKUYOU_ORDER: DayType[] = ['sensho','tomobiki','senbu','butsumetsu','taian','shakku']

const LUCKY_THEMES = [
  { icon: '💰', label: '金運アップ', days: [1,5,8,12,15,19,22,26] },
  { icon: '💕', label: '恋愛・出会い', days: [3,7,10,14,17,21,24,28] },
  { icon: '💼', label: '仕事・商談', days: [2,6,9,13,16,20,23,27] },
  { icon: '🏠', label: '引越し・新居', days: [4,11,18,25] },
]

export default function CalendarPage() {
  const now = new Date()
  const [year,  setYear]  = useState(now.getFullYear())
  const [month, setMonth] = useState(now.getMonth())
  const [birthDate, setBirthDate] = useState('')

  const days = useMemo(() => {
    const first  = new Date(year, month, 1)
    const last   = new Date(year, month + 1, 0)
    const offset = first.getDay() // 0=日
    const result: Array<{ date: Date | null; rokuyou?: typeof ROKUYOU[DayType]; isToday: boolean; score: number }> = []

    // 前月の空白
    for (let i = 0; i < offset; i++) result.push({ date: null, isToday: false, score: 0 })

    for (let d = 1; d <= last.getDate(); d++) {
      const date = new Date(year, month, d)
      const dateStr = `${year}-${String(month+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`
      const seed = birthDate ? birthDate + dateStr : dateStr
      const ryIdx = (hash(dateStr) + d) % 6
      const rokuyou = ROKUYOU[ROKUYOU_ORDER[ryIdx]]
      const isToday = dateStr === now.toISOString().slice(0,10)
      const score = hash(seed + 'score') % 60 + 40
      result.push({ date, rokuyou, isToday, score })
    }
    return result
  }, [year, month, birthDate])

  function prevMonth() { if (month === 0) { setYear(y => y-1); setMonth(11) } else setMonth(m => m-1) }
  function nextMonth() { if (month === 11) { setYear(y => y+1); setMonth(0) } else setMonth(m => m+1) }

  return (
    <div className="min-h-screen bg-paper">
      <header className="bg-deep text-white py-10 px-6 text-center relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none"
          style={{ background: 'radial-gradient(ellipse 80% 60% at 50% 0%,rgba(201,168,76,.2),transparent)' }} />
        <nav className="absolute top-4 left-4">
          <Link href="/" className="text-xs text-white/50 hover:text-white transition">← ホーム</Link>
        </nav>
        <p className="font-display text-xs tracking-[.3em] text-gold mb-2 uppercase">Fortune Calendar</p>
        <h1 className="font-display text-2xl font-semibold tracking-widest mb-1">吉日カレンダー</h1>
        <p className="text-xs text-white/50">六曜・開運日を一目で確認</p>
      </header>

      <div className="max-w-2xl mx-auto px-4 py-8 pb-20">

        {/* 生年月日 */}
        <div className="card mb-4">
          <label className="text-xs text-muted block mb-1.5">生年月日（入力するとあなた専用の運勢日が表示されます）</label>
          <input type="date" className="form-input" value={birthDate}
            onChange={e => setBirthDate(e.target.value)} />
        </div>

        {/* 六曜凡例 */}
        <div className="flex flex-wrap gap-2 mb-4">
          {Object.values(ROKUYOU).map(r => (
            <span key={r.label} className="text-xs px-2.5 py-1 rounded-full border"
              style={{ background: r.bg, borderColor: r.color + '40', color: r.color }}>
              {r.label}
            </span>
          ))}
        </div>

        {/* カレンダー */}
        <div className="card mb-4 p-0 overflow-hidden">
          {/* ナビ */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-border">
            <button onClick={prevMonth} className="text-sm text-muted hover:text-deep transition px-2">←</button>
            <h2 className="font-serif text-base font-medium">{year}年{month+1}月</h2>
            <button onClick={nextMonth} className="text-sm text-muted hover:text-deep transition px-2">→</button>
          </div>

          {/* 曜日ヘッダー */}
          <div className="grid grid-cols-7 border-b border-border">
            {['日','月','火','水','木','金','土'].map((d,i) => (
              <div key={d} className={`text-center text-xs py-2 font-medium ${i===0?'text-[#8b2020]':i===6?'text-[#0d4f8a]':'text-muted'}`}>
                {d}
              </div>
            ))}
          </div>

          {/* 日付グリッド */}
          <div className="grid grid-cols-7">
            {days.map((day, i) => (
              <div key={i}
                className={`min-h-[64px] p-1.5 border-r border-b border-border/50 last:border-r-0 ${
                  !day.date ? 'bg-[#faf8f3]' :
                  day.isToday ? 'bg-[#EEEDFE]' : 'bg-white hover:bg-[#faf8f3]'
                } transition`}>
                {day.date && (
                  <>
                    <div className={`text-xs font-medium mb-0.5 ${
                      day.isToday ? 'text-mid' :
                      i % 7 === 0 ? 'text-[#8b2020]' :
                      i % 7 === 6 ? 'text-[#0d4f8a]' : 'text-ink'
                    }`}>
                      {day.date.getDate()}
                      {day.isToday && <span className="ml-1 text-[9px] text-mid">今日</span>}
                    </div>
                    {day.rokuyou && (
                      <div className="text-[9px] px-1 py-0.5 rounded text-center leading-tight"
                        style={{ background: day.rokuyou.bg, color: day.rokuyou.color }}>
                        {day.rokuyou.label}
                      </div>
                    )}
                    {birthDate && (
                      <div className="mt-0.5">
                        <div className="h-1 rounded-full overflow-hidden bg-[#f0ede6]">
                          <div className="h-full rounded-full"
                            style={{
                              width: `${day.score}%`,
                              background: day.score >= 80 ? '#1a5c3a' : day.score >= 60 ? '#534AB7' : '#c9a84c'
                            }} />
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* 吉日テーマ */}
        <div className="card mb-4">
          <h3 className="font-serif text-sm font-medium text-deep mb-3">今月の開運テーマ別おすすめ日</h3>
          <div className="space-y-3">
            {LUCKY_THEMES.map(theme => (
              <div key={theme.label} className="flex items-start gap-3">
                <span className="text-xl flex-shrink-0">{theme.icon}</span>
                <div>
                  <div className="text-xs font-medium text-deep mb-1">{theme.label}</div>
                  <div className="flex flex-wrap gap-1.5">
                    {theme.days.filter(d => d <= new Date(year, month+1, 0).getDate()).map(d => (
                      <span key={d} className="text-xs px-2 py-0.5 rounded-full bg-[#EEEDFE] text-mid">
                        {month+1}/{d}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 六曜説明 */}
        <div className="card mb-4">
          <h3 className="font-serif text-sm font-medium text-deep mb-3">六曜について</h3>
          <div className="space-y-2.5">
            {Object.values(ROKUYOU).map(r => (
              <div key={r.label} className="flex items-start gap-3 p-2.5 rounded-xl"
                style={{ background: r.bg }}>
                <span className="text-xs font-medium w-12 flex-shrink-0" style={{ color: r.color }}>{r.label}</span>
                <span className="text-xs text-muted leading-relaxed">{r.meaning}</span>
              </div>
            ))}
          </div>
        </div>

        {/* 広告枠 */}
        <div className="w-full h-16 bg-[#f0ede6] rounded-xl flex items-center justify-center mb-4 border border-border">
          <span className="text-xs text-muted">広告</span>
        </div>

        {/* 深層鑑定誘導 */}
        <div className="card text-center bg-deep border-deep">
          <p className="text-xs text-white/60 mb-2">あなただけの詳細な運勢を知りたい方へ</p>
          <h3 className="font-serif text-sm font-medium text-gold2 mb-3">AI統合深層鑑定（¥500）</h3>
          <Link href="/fortune"
            className="inline-block bg-gold text-deep text-xs font-medium px-6 py-2.5 rounded-full hover:bg-gold2 transition">
            ✦ 深層鑑定を受ける
          </Link>
        </div>
      </div>
    </div>
  )
}
