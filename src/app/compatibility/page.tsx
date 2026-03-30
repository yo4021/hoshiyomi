'use client'

import { useState } from 'react'
import Link from 'next/link'
import { calcCompatibility, type CompatibilityResult } from '@/lib/compatibility'
import ShareButtons from '@/components/ShareButtons'

const COMPAT_COLOR: Record<string, string> = {
  '運命の相手': '#c9a84c', '最高の相性': '#1a5c3a', '良い相性': '#2d1f5e',
  '普通': '#0d4f8a', '要努力': '#7a4d0a', '難しい相性': '#8b2020',
}
const COMPAT_BG: Record<string, string> = {
  '運命の相手': '#fffbf0', '最高の相性': '#f2fbf5', '良い相性': '#EEEDFE',
  '普通': '#f0f6ff', '要努力': '#fffbf0', '難しい相性': '#fff5f5',
}

function ScoreBar({ label, score, color }: { label: string; score: number; color: string }) {
  const grade = score >= 80 ? '◎' : score >= 65 ? '○' : score >= 50 ? '△' : '▽'
  return (
    <div className="flex items-center gap-3 mb-3">
      <span className="text-xs text-muted w-20 flex-shrink-0">{label}</span>
      <div className="flex-1 h-2 bg-[#f0ede6] rounded-full overflow-hidden">
        <div className="h-full rounded-full transition-all duration-1000 ease-out"
          style={{ width: `${score}%`, background: color }} />
      </div>
      <span className="text-xs font-medium w-12 text-right" style={{ color }}>{grade} {score}</span>
    </div>
  )
}

export default function CompatibilityPage() {
  const [name1,  setName1]  = useState('')
  const [date1,  setDate1]  = useState('')
  const [name2,  setName2]  = useState('')
  const [date2,  setDate2]  = useState('')
  const [result, setResult] = useState<CompatibilityResult | null>(null)
  const [loading,setLoading]= useState(false)

  function handleCalc() {
    if (!date1 || !date2) return
    setLoading(true)
    setTimeout(() => {
      setResult(calcCompatibility(date1, name1 || undefined, date2, name2 || undefined))
      setLoading(false)
    }, 800)
  }

  return (
    <div className="min-h-screen bg-paper">
      <header className="bg-deep text-white py-10 px-6 text-center relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none"
          style={{ background: 'radial-gradient(ellipse 80% 60% at 50% 0%,rgba(201,168,76,.2),transparent)' }} />
        <nav className="absolute top-4 left-4">
          <Link href="/" className="text-xs text-white/50 hover:text-white transition">← ホーム</Link>
        </nav>
        <p className="font-display text-xs tracking-[.3em] text-gold mb-2 uppercase">Compatibility</p>
        <h1 className="font-display text-2xl font-semibold tracking-widest mb-1">相性鑑定</h1>
        <p className="text-xs text-white/50">2人の命式を統合解析</p>
      </header>

      <div className="max-w-2xl mx-auto px-4 py-8 pb-20">

        {/* 入力フォーム */}
        <div className="card mb-4">
          <h2 className="font-serif text-sm font-medium text-deep mb-4">2人の情報を入力</h2>
          <div className="grid grid-cols-2 gap-4">
            {/* 人物1 */}
            <div>
              <div className="text-xs font-medium text-mid mb-2 pb-1 border-b border-border">あなた</div>
              <div className="space-y-2">
                <div>
                  <label className="text-xs text-muted block mb-1">名前（任意）</label>
                  <input className="form-input" value={name1} onChange={e => setName1(e.target.value)} placeholder="例：花子" />
                </div>
                <div>
                  <label className="text-xs text-muted block mb-1">生年月日 <span className="text-red-500">*</span></label>
                  <input type="date" className="form-input" value={date1} onChange={e => setDate1(e.target.value)} />
                </div>
              </div>
            </div>
            {/* 人物2 */}
            <div>
              <div className="text-xs font-medium text-[#993556] mb-2 pb-1 border-b border-border">相手</div>
              <div className="space-y-2">
                <div>
                  <label className="text-xs text-muted block mb-1">名前（任意）</label>
                  <input className="form-input" value={name2} onChange={e => setName2(e.target.value)} placeholder="例：太郎" />
                </div>
                <div>
                  <label className="text-xs text-muted block mb-1">生年月日 <span className="text-red-500">*</span></label>
                  <input type="date" className="form-input" value={date2} onChange={e => setDate2(e.target.value)} />
                </div>
              </div>
            </div>
          </div>
          <button className="btn-primary mt-4" onClick={handleCalc} disabled={!date1 || !date2 || loading}>
            {loading
              ? <span className="flex items-center justify-center gap-2"><span className="spinner" />解析中...</span>
              : '💑 相性を鑑定する'}
          </button>
        </div>

        {/* 広告枠 */}
        <div className="w-full h-16 bg-[#f0ede6] rounded-xl flex items-center justify-center mb-4 border border-border">
          <span className="text-xs text-muted">広告</span>
        </div>

        {result && (
          <div className="space-y-4 animate-fade-up">

            {/* 総合相性 */}
            <div className="card text-center py-8"
              style={{ background: COMPAT_BG[result.compatibility], borderColor: COMPAT_COLOR[result.compatibility] + '60' }}>
              <div className="flex items-center justify-center gap-4 mb-4">
                <div className="text-center">
                  <div className="text-sm font-medium text-deep">{result.person1.name || 'あなた'}</div>
                  <div className="text-xs text-muted">{result.person1.tropicSign}</div>
                  <div className="text-xs text-muted">{result.person1.kyusei}</div>
                </div>
                <div className="text-3xl">💑</div>
                <div className="text-center">
                  <div className="text-sm font-medium text-deep">{result.person2.name || '相手'}</div>
                  <div className="text-xs text-muted">{result.person2.tropicSign}</div>
                  <div className="text-xs text-muted">{result.person2.kyusei}</div>
                </div>
              </div>
              <div className="text-5xl font-medium font-serif mb-1"
                style={{ color: COMPAT_COLOR[result.compatibility] }}>{result.compatibility}</div>
              <div className="text-sm text-muted mb-3">総合スコア {result.overall}</div>
              <div className="text-xs px-3 py-1.5 rounded-full inline-block"
                style={{ background: COMPAT_COLOR[result.compatibility] + '15', color: COMPAT_COLOR[result.compatibility] }}>
                五行：{result.elementRelation}
              </div>
            </div>

            {/* スコア詳細 */}
            <div className="card">
              <h3 className="font-serif text-sm font-medium text-deep mb-4">相性スコア詳細</h3>
              <ScoreBar label="恋愛・情" score={result.love}       color="#993556" />
              <ScoreBar label="仕事・協力" score={result.work}     color="#185FA5" />
              <ScoreBar label="友情・信頼" score={result.friendship} color="#1a5c3a" />
              <ScoreBar label="長期的絆" score={result.longterm}   color="#534AB7" />
              <ScoreBar label="初期相性" score={result.chemistry}  color="#c9a84c" />
            </div>

            {/* 強みと課題 */}
            <div className="grid grid-cols-2 gap-3">
              <div className="card bg-[#f2fbf5] border-[#b8d8c0]">
                <h4 className="text-xs font-medium text-[#1a5c3a] mb-2">💚 この相性の強み</h4>
                {result.strengths.map((s, i) => (
                  <p key={i} className="text-xs text-[#333] leading-relaxed mb-1.5">✓ {s}</p>
                ))}
              </div>
              <div className="card bg-[#fffbf0] border-[#e8c96a50]">
                <h4 className="text-xs font-medium text-[#7a4d0a] mb-2">⚡ 乗り越えるべき課題</h4>
                {result.challenges.map((c, i) => (
                  <p key={i} className="text-xs text-[#333] leading-relaxed mb-1.5">△ {c}</p>
                ))}
              </div>
            </div>

            {/* アドバイス */}
            <div className="card">
              <h3 className="font-serif text-sm font-medium text-deep mb-3">関係を深めるアドバイス</h3>
              <p className="text-sm text-[#444] leading-relaxed mb-3">{result.advice}</p>
              <div className="bg-[#EEEDFE] rounded-xl p-3 mb-3">
                <p className="text-xs text-[#534AB7]"><span className="font-medium">最高の場面：</span>{result.bestScene}</p>
              </div>
              <div className="bg-[#fff5f5] rounded-xl p-3">
                <p className="text-xs text-[#8b2020]"><span className="font-medium">要注意：</span>{result.warningSign}</p>
              </div>
            </div>

            {/* 広告枠 */}
            <div className="w-full h-16 bg-[#f0ede6] rounded-xl flex items-center justify-center border border-border">
              <span className="text-xs text-muted">広告</span>
            </div>

            {/* シェアボタン */}
            <ShareButtons text={`💑 ${result.person1.name || 'あなた'}と${result.person2.name || '相手'}の相性は「${result.compatibility}」！\n総合スコア${result.overall}点\n#星詠み #AI占い #相性鑑定`} />

            {/* 別の組み合わせ */}
            <button className="btn-outline w-full" onClick={() => setResult(null)}>
              別の組み合わせで試す
            </button>

            {/* 深層鑑定誘導 */}
            <div className="card text-center bg-deep border-deep">
              <p className="text-xs text-white/60 mb-2">さらに詳しい相性の深層分析を</p>
              <h3 className="font-serif text-sm font-medium text-gold2 mb-3">AI相性深層鑑定（¥500）</h3>
              <p className="text-xs text-white/60 mb-4 leading-relaxed">
                2人の命式を使ったAIによる詳細な相性分析・関係の未来予測・改善アドバイス
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
