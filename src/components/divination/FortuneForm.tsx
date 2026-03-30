'use client'

import { useState } from 'react'
import type { DivinationInput, DivinationType, CorrectionOption } from '@/types'

interface Props {
  onSubmit: (input: DivinationInput) => void
  loading: boolean
}

const TYPE_OPTIONS: { value: DivinationType; label: string }[] = [
  { value: 'western',   label: '西洋占星術' },
  { value: 'vedic',     label: 'インド占星術' },
  { value: 'kyusei',    label: '九星気学' },
  { value: 'shiju',     label: '四柱推命' },
  { value: 'numerology',label: '数秘術' },
  { value: 'name',      label: '姓名判断' },
  { value: 'tarot',     label: 'タロット' },
]

const OPT_OPTIONS: { value: CorrectionOption; label: string }[] = [
  { value: 'precession', label: '歳差補正（約23°）' },
  { value: 'climate',    label: '季節・気候補正' },
  { value: 'realtime',   label: 'リアルタイム天体位置' },
]

export default function FortuneForm({ onSubmit, loading }: Props) {
  const [birthDate,    setBirthDate]    = useState('')
  const [birthTime,    setBirthTime]    = useState('')
  const [birthCity,    setBirthCity]    = useState('')
  const [nameSei,      setNameSei]      = useState('')
  const [nameMei,      setNameMei]      = useState('')
  const [nameSeiKana,  setNameSeiKana]  = useState('')
  const [nameMeiKana,  setNameMeiKana]  = useState('')
  const [activeTypes,  setActiveTypes]  = useState<Set<DivinationType>>(
    new Set<DivinationType>(['western','vedic','kyusei','shiju','numerology','name'])
  )
  const [activeOpts,   setActiveOpts]   = useState<Set<CorrectionOption>>(
    new Set<CorrectionOption>(['precession','climate'])
  )

  function toggleType(v: DivinationType) {
    setActiveTypes(prev => {
      const s = new Set(prev)
      s.has(v) ? s.delete(v) : s.add(v)
      return s
    })
  }
  function toggleOpt(v: CorrectionOption) {
    setActiveOpts(prev => {
      const s = new Set(prev)
      s.has(v) ? s.delete(v) : s.add(v)
      return s
    })
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!birthDate) return
    onSubmit({
      birthDate,
      birthTime: birthTime || undefined,
      birthCity: birthCity || undefined,
      nameSei:   nameSei   || undefined,
      nameMei:   nameMei   || undefined,
      activeTypes:  Array.from(activeTypes),
      activeOptions:Array.from(activeOpts),
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">

      {/* 名前 */}
      <div className="card">
        <div className="text-xs font-medium tracking-widest text-muted uppercase mb-1 flex items-center gap-2">
          <span className="inline-block w-1.5 h-1.5 rounded-full bg-gold" />
          お名前（任意）
        </div>
        <p className="text-xs text-muted mb-4 bg-paper rounded-lg px-3 py-2 leading-relaxed border-l-2 border-gold">
          姓名判断では漢字の画数から天格・人格・地格・外格・総格を算出します。入力は任意ですが、より精密な鑑定が可能です。
        </p>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs text-muted block mb-1.5">姓（漢字）</label>
            <input className="form-input" value={nameSei} onChange={e => setNameSei(e.target.value)} placeholder="例：鈴木" />
          </div>
          <div>
            <label className="text-xs text-muted block mb-1.5">名（漢字）</label>
            <input className="form-input" value={nameMei} onChange={e => setNameMei(e.target.value)} placeholder="例：花子" />
          </div>
          <div>
            <label className="text-xs text-muted block mb-1.5">姓（よみがな）</label>
            <input className="form-input" value={nameSeiKana} onChange={e => setNameSeiKana(e.target.value)} placeholder="例：すずき" />
          </div>
          <div>
            <label className="text-xs text-muted block mb-1.5">名（よみがな）</label>
            <input className="form-input" value={nameMeiKana} onChange={e => setNameMeiKana(e.target.value)} placeholder="例：はなこ" />
          </div>
        </div>
      </div>

      {/* 生年月日 */}
      <div className="card">
        <div className="text-xs font-medium tracking-widest text-muted uppercase mb-1 flex items-center gap-2">
          <span className="inline-block w-1.5 h-1.5 rounded-full bg-gold" />
          生年月日・出生情報
        </div>
        <p className="text-xs text-muted mb-4 bg-paper rounded-lg px-3 py-2 leading-relaxed border-l-2 border-gold">
          生年月日は必須です。出生時刻が分かると月の位置（アセンダント）まで算出でき、より精密な鑑定が可能になります。出生地・時刻が不明でも鑑定できます。
        </p>
        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className="text-xs text-muted block mb-1.5">
              生年月日 <span className="text-red-500">*</span>
            </label>
            <input type="date" className="form-input" required value={birthDate}
              onChange={e => setBirthDate(e.target.value)} />
          </div>
          <div>
            <label className="text-xs text-muted block mb-1.5">出生時刻（任意）</label>
            <input type="time" className="form-input" value={birthTime}
              onChange={e => setBirthTime(e.target.value)} />
            <p className="text-xs text-muted/60 mt-1">不明な場合は空欄</p>
          </div>
          <div>
            <label className="text-xs text-muted block mb-1.5">出生地（任意）</label>
            <input className="form-input" value={birthCity}
              onChange={e => setBirthCity(e.target.value)} placeholder="例：名古屋" />
            <p className="text-xs text-muted/60 mt-1">不明な場合は空欄</p>
          </div>
        </div>
      </div>

      {/* 占術選択 */}
      <div className="card">
        <div className="text-xs font-medium tracking-widest text-muted uppercase mb-1 flex items-center gap-2">
          <span className="inline-block w-1.5 h-1.5 rounded-full bg-gold" />
          使用する占術
        </div>
        <p className="text-xs text-muted mb-4 bg-paper rounded-lg px-3 py-2 leading-relaxed border-l-2 border-gold">
          複数の占術を統合することで、単独では見えない「共鳴するテーマ」が浮かび上がります。すべてONが推奨ですが、特定の占術のみでの鑑定も可能です。
        </p>
        <div className="flex flex-wrap gap-2">
          {TYPE_OPTIONS.map(opt => (
            <button key={opt.value} type="button"
              onClick={() => toggleType(opt.value)}
              className={`chip ${activeTypes.has(opt.value) ? 'active' : ''}`}>
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* 補正オプション */}
      <div className="card">
        <div className="text-xs font-medium tracking-widest text-muted uppercase mb-1 flex items-center gap-2">
          <span className="inline-block w-1.5 h-1.5 rounded-full bg-gold" />
          補正オプション
        </div>
        <p className="text-xs text-muted mb-4 bg-paper rounded-lg px-3 py-2 leading-relaxed border-l-2 border-gold">
          【歳差補正】地球の自転軸の歳差運動により、西洋占星術の星座と実際の天体位置には約23°のズレがあります。インド占星術との統合にこの補正は不可欠です。【季節補正】生まれた季節の気候エネルギーをスコアに反映します。
        </p>
        <div className="flex flex-wrap gap-2">
          {OPT_OPTIONS.map(opt => (
            <button key={opt.value} type="button"
              onClick={() => toggleOpt(opt.value)}
              className={`chip chip-gold ${activeOpts.has(opt.value) ? 'active' : ''}`}>
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      <button type="submit" className="btn-primary" disabled={loading || !birthDate}>
        {loading ? (
          <span className="flex items-center justify-center gap-3">
            <span className="spinner" /> 鑑定中...
          </span>
        ) : (
          '✦ AI統合鑑定を開始する'
        )}
      </button>
    </form>
  )
}
