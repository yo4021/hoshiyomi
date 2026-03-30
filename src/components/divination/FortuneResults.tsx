'use client'

import type { DivinationResult, ReadingSection } from '@/types'
import FortuneGraph from './FortuneGraph'

interface Props {
  result: DivinationResult
  streamingSection: ReadingSection | null
  paywallActive?: boolean
}

const TYPE_LABELS: Record<string, string> = {
  western: '西洋占星術', vedic: 'インド占星術', kyusei: '九星気学',
  shiju: '四柱推命', numerology: '数秘術', name: '姓名判断', tarot: 'タロット',
}
const TYPE_COLORS: Record<string, string> = {
  western: '#AFA9EC', vedic: '#5DCAA5', kyusei: '#FAC775',
  shiju: '#F0997B', numerology: '#85B7EB', name: '#d4aa52', tarot: '#ED93B1',
}

function luckLabel(s: number) {
  return s >= 82 ? '大吉' : s >= 68 ? '吉' : s >= 54 ? '中吉' : '小吉'
}
function luckColor(s: number) {
  return s >= 82 ? '#1a5c3a' : s >= 68 ? '#2d1f5e' : s >= 54 ? '#7a4d0a' : '#8b2020'
}
function luckBg(s: number) {
  return s >= 82 ? '#f2fbf5' : s >= 68 ? '#EEEDFE' : s >= 54 ? '#fffbf0' : '#fff5f5'
}

/** Markdown太字・改行をHTMLに変換 */
function renderText(text: string) {
  return text
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\n\n/g, '</p><p>')
    .replace(/\n/g, '<br />')
}

function ReadingCard({
  icon, title, section, text, streaming,
}: {
  icon: string; title: string; section: ReadingSection; text?: string; streaming: boolean
}) {
  return (
    <div className="card">
      <div className="flex items-center gap-2 mb-4 pb-3 border-b border-border">
        <span className="text-lg">{icon}</span>
        <h3 className="font-serif text-sm font-medium flex-1">{title}</h3>
        <span className="badge">AI生成</span>
      </div>
      <div className="text-sm leading-relaxed text-[#333]">
        {!text ? (
          <div className="flex items-center gap-2 text-muted py-2">
            {streaming ? <><span className="spinner" />生成中...</> : <span>順番待ち...</span>}
          </div>
        ) : (
          <p className={streaming ? 'typing-cursor' : ''}
            dangerouslySetInnerHTML={{ __html: renderText(text) }} />
        )}
      </div>
    </div>
  )
}

export default function FortuneResults({ result, streamingSection, paywallActive = false }: Props) {
  const { scores, astro, nameResult, timeline, nowForecast, readings } = result

  return (
    <div className="space-y-5">

      {/* 命式ピル */}
      <div className="flex flex-wrap gap-2">
        {[
          `☀ 熱帯：${astro.tropicSign}`,
          `✦ 恒星（補正後）：${astro.vedicSign}`,
          `☯ ${astro.kyusei}`,
          `📅 ${astro.shiju}`,
          `♾ ライフパス：${astro.lifePathNumber}`,
        ].map((t, i) => (
          <span key={i} className={`text-xs px-3 py-1.5 rounded-full border ${
            i < 2
              ? 'border-gold/30 bg-[#fffbf0] text-[#7a4d0a]'
              : 'border-border bg-white text-ink'
          }`}>{t}</span>
        ))}
      </div>

      {/* 姓名判断 */}
      {nameResult && (
        <div className="card">
          <div className="sec-head">
            <h2>姓名判断</h2>
          </div>
          <div className="flex flex-wrap gap-3">
            {([
              ['天格', nameResult.tenkaku, nameResult.tenkakuLuck, nameResult.tenkakuMeaning],
              ['人格', nameResult.jinkaku, nameResult.jinkakuLuck, nameResult.jinkakuMeaning],
              ['地格', nameResult.chikaku, nameResult.chikakuLuck, nameResult.chikakuMeaning],
              ['外格', nameResult.gaikaku, nameResult.gaikakuLuck, nameResult.gaikakuMeaning],
              ['総格', nameResult.sokaku,  nameResult.sokakuLuck,  nameResult.sokakuMeaning],
            ] as [string, number, '吉'|'凶', string][]).map(([label, val, luck, meaning]) => (
              <div key={label}
                title={meaning}
                className={`text-center rounded-xl px-4 py-3 min-w-[80px] border ${
                  luck === '吉'
                    ? 'bg-[#f2fbf5] border-[#b8d8c0]'
                    : 'bg-[#fff5f5] border-[#f0c4c4]'
                }`}>
                <div className="text-[10px] text-muted mb-1">{label}</div>
                <div className={`text-lg font-medium font-serif ${luck === '吉' ? 'text-[#1a5c3a]' : 'text-[#8b2020]'}`}>
                  {val}画
                </div>
                <div className={`text-[11px] font-medium ${luck === '吉' ? 'text-[#1a5c3a]' : 'text-[#8b2020]'}`}>
                  {luck}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 概要スコア */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="card text-center bg-deep border-deep">
          <div className="text-xs text-white/55 mb-1">統合スコア</div>
          <div className="text-3xl font-medium font-serif text-gold2">{scores.unified}</div>
          <div className="text-xs text-white/40 mt-1">/100</div>
        </div>
        <div className="card text-center">
          <div className="text-xs text-muted mb-1">総合運</div>
          <div className="text-2xl font-medium font-serif" style={{ color: luckColor(scores.unified) }}>
            {luckLabel(scores.unified)}
          </div>
        </div>
        <div className="card text-center">
          <div className="text-xs text-muted mb-1">現在年齢</div>
          <div className="text-2xl font-medium font-serif">{astro.currentAge}<span className="text-sm">歳</span></div>
        </div>
        <div className="card text-center">
          <div className="text-xs text-muted mb-1">季節補正</div>
          <div className="text-xl font-medium font-serif">×{scores.climateCorrection.toFixed(2)}</div>
        </div>
      </div>

      {/* スコアバー */}
      <div className="card space-y-3">
        {Object.entries(scores.bySystem).map(([k, v]) => (
          <div key={k} className="flex items-center gap-3">
            <span className="text-xs text-muted w-24 flex-shrink-0">{TYPE_LABELS[k] ?? k}</span>
            <div className="flex-1 h-2 bg-[#f0ede6] rounded-full overflow-hidden">
              <div className="h-full rounded-full transition-all duration-1000 ease-out"
                style={{ width: `${v}%`, background: TYPE_COLORS[k] ?? '#ccc' }} />
            </div>
            <span className="text-xs text-muted w-7 text-right">{v}</span>
          </div>
        ))}
      </div>

      {/* 3大運 */}
      <div className="sec-head"><h2>金運・仕事運・恋愛運</h2></div>
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: '金 運', icon: '💰', score: scores.moneyScore, scheme: { bg: '#fffbf0', border: '#e8c96a50', color: '#7a4d0a', bar: 'linear-gradient(to right,#b8903a,#e8c96a)' } },
          { label: '仕事運', icon: '💼', score: scores.workScore,  scheme: { bg: '#f0f6ff', border: '#85B7EB50', color: '#0d4f8a', bar: 'linear-gradient(to right,#185FA5,#85B7EB)' } },
          { label: '恋愛運', icon: '💕', score: scores.loveScore,  scheme: { bg: '#fff0f7', border: '#ED93B150', color: '#7a1f52', bar: 'linear-gradient(to right,#993556,#ED93B1)' } },
        ].map(({ label, icon, score, scheme }) => (
          <div key={label} className="rounded-2xl p-4 border" style={{ background: scheme.bg, borderColor: scheme.border }}>
            <div className="text-2xl mb-1">{icon}</div>
            <div className="text-xs font-medium mb-2" style={{ color: scheme.color }}>{label}</div>
            <div className="text-3xl font-medium font-serif mb-1" style={{ color: scheme.color }}>{score}</div>
            <div className="text-xs font-medium mb-2" style={{ color: scheme.color }}>{luckLabel(score)}</div>
            <div className="h-1.5 rounded-full overflow-hidden bg-black/10">
              <div className="h-full rounded-full" style={{ width: `${score}%`, background: scheme.bar }} />
            </div>
          </div>
        ))}
      </div>

      {/* 人生年表グラフ */}
      <div className="sec-head"><h2>人生運勢グラフ</h2></div>
      <div className="card overflow-hidden p-0">
        <div className="px-5 py-4 border-b border-border">
          <h3 className="font-serif text-sm font-medium mb-1">人生運勢グラフ（0〜90歳）</h3>
          <p className="text-xs text-muted leading-relaxed">
            縦軸はスコア（0〜100）、金色縦線が現在地点。
            <span className="text-[#1a5c3a] font-medium">●緑</span>=ピーク、
            <span className="text-[#8b2020] font-medium">●赤</span>=低迷、
            <span className="text-[#534AB7] font-medium">●紫</span>=通常。未来は命式から算出した予測値。
          </p>
        </div>
        <div className="p-3">
          <FortuneGraph timeline={timeline} birthYear={astro.birthYear} />
        </div>
        {/* 年表リスト */}
        <div className="divide-y divide-border">
          {timeline.map(phase => (
            <div key={phase.age} className="flex gap-4 px-5 py-4">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-[9px] font-bold text-white flex-shrink-0 ${
                phase.isFuture  ? 'border-2 border-dashed border-gray-300 bg-transparent !text-gray-400 !text-[9px]' :
                phase.isPeak    ? 'bg-gradient-to-br from-[#1a5c3a] to-[#2a8a5a]' :
                phase.isLow     ? 'bg-gradient-to-br from-[#8b2020] to-[#c03030]' :
                                  'bg-gradient-to-br from-[#2d1f5e] to-[#534AB7]'
              }`}>
                {phase.score}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-baseline gap-2 flex-wrap mb-1">
                  <span className="text-sm font-medium">{phase.age}歳</span>
                  <span className="text-xs text-muted">{phase.year}年</span>
                  {phase.isCurrent && (
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#fffbf0] text-[#7a4d0a] border border-gold/30">◀ 現在</span>
                  )}
                  {phase.isFuture && (
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#f3f0e8] text-muted">予測</span>
                  )}
                </div>
                <div className="text-sm font-medium text-deep mb-1">
                  {phase.title}
                  <span className="text-xs text-muted font-normal ml-2">— {phase.subtitle}</span>
                </div>
                <p className="text-xs text-muted leading-relaxed mb-2">{phase.detail}</p>
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-1 bg-[#f0ede6] rounded-full overflow-hidden">
                    <div className="h-full rounded-full"
                      style={{
                        width: `${phase.score}%`,
                        background: phase.isPeak ? '#1a5c3a' : phase.isLow ? '#8b2020' : '#534AB7',
                      }} />
                  </div>
                  <span className="text-[11px] text-muted font-medium">{phase.score}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 今の運勢 */}
      <div className="sec-head"><h2>今の運勢・近未来の予測</h2></div>
      <div className="grid sm:grid-cols-2 gap-3">
        <div className="card bg-[#f2fbf5] border-[#b8d8c0]">
          <h4 className="text-sm font-medium flex items-center gap-2 mb-3">
            <span className="text-lg">✦</span>
            今の運勢（{nowForecast.currentPhase.title}）
          </h4>
          <div className="text-sm leading-relaxed space-y-1.5 text-[#333]">
            <p>スコア <strong className="text-deep">{nowForecast.currentPhase.score}</strong> ／ {nowForecast.trend}</p>
            {nowForecast.goodEvents.map((g, i) => <p key={i}>🟢 {g}</p>)}
          </div>
        </div>
        <div className="card">
          <h4 className="text-sm font-medium flex items-center gap-2 mb-3">
            <span className="text-lg">◉</span>
            次のフェーズへの備え
          </h4>
          <div className="text-sm leading-relaxed space-y-1.5 text-[#333]">
            <p>次：<strong className="text-deep">{nowForecast.nextPhase.title}</strong>（予測 {nowForecast.nextPhase.score}）</p>
            {nowForecast.preparations.map((p, i) => <p key={i}>📋 {p}</p>)}
          </div>
        </div>
        <div className="card bg-[#fff5f5] border-[#f0c4c4]">
          <h4 className="text-sm font-medium flex items-center gap-2 mb-3">
            <span className="text-lg">⚠️</span>
            来る試練・注意すること
          </h4>
          <div className="text-sm leading-relaxed space-y-1.5 text-[#333]">
            {nowForecast.badEvents.map((b, i) => <p key={i}>⚠️ {b}</p>)}
            <p className="text-xs text-muted mt-1">1〜3年以内に注意が必要な事象</p>
          </div>
        </div>
        <div className="card bg-[#f2fbf5] border-[#b8d8c0]">
          <h4 className="text-sm font-medium flex items-center gap-2 mb-3">
            <span className="text-lg">🌟</span>
            来る好機・いいこと
          </h4>
          <div className="text-sm leading-relaxed space-y-1.5 text-[#333]">
            {nowForecast.goodEvents.map((g, i) => <p key={i}>🌟 {g}</p>)}
            <p className="text-xs text-muted mt-1">1〜3年以内に訪れる好機</p>
          </div>
        </div>
      </div>

      {/* AI深層鑑定（ペイウォール時は非表示）*/}
      {!paywallActive && (
        <>
          <div className="sec-head"><h2>AI深層鑑定</h2><span className="badge ml-auto">Claude AI</span></div>
          <ReadingCard icon="✦" title="総合鑑定・魂のテーマ"        section="general"        text={readings.general}        streaming={streamingSection === 'general'} />
          <ReadingCard icon="◈" title="特性・才能・人間関係の傾向"   section="traits"         text={readings.traits}         streaming={streamingSection === 'traits'} />
          <ReadingCard icon="💰" title="金運・仕事運の詳細鑑定"       section="money"          text={readings.money}          streaming={streamingSection === 'money'} />
          <ReadingCard icon="💕" title="恋愛運・結婚運の詳細鑑定"     section="love"           text={readings.love}           streaming={streamingSection === 'love'} />
          <ReadingCard icon="◉" title="今の運勢・これからの流れ・備え" section="currentFortune" text={readings.currentFortune} streaming={streamingSection === 'currentFortune'} />
          <ReadingCard icon="▲" title="来る試練の乗り越え方・低迷期の過ごし方" section="hardTimes" text={readings.hardTimes} streaming={streamingSection === 'hardTimes'} />
        </>
      )}
    </div>
  )
}
