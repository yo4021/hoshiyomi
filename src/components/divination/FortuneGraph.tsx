'use client'

import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ReferenceLine, ResponsiveContainer, Dot,
} from 'recharts'
import type { TimelinePhase } from '@/types'

interface Props {
  timeline: TimelinePhase[]
  birthYear: number
}

function CustomDot(props: {
  cx?: number; cy?: number; payload?: TimelinePhase
}) {
  const { cx = 0, cy = 0, payload } = props
  if (!payload) return null
  const color = payload.isPeak ? '#1a5c3a' : payload.isLow ? '#8b2020' : '#534AB7'
  const r     = payload.isCurrent ? 7 : payload.isPeak || payload.isLow ? 5.5 : 4
  return (
    <g>
      <circle cx={cx} cy={cy} r={r + 2} fill={color} fillOpacity={0.15} />
      <circle cx={cx} cy={cy} r={r} fill={color} stroke="#fff" strokeWidth={1.5} />
    </g>
  )
}

function CustomTooltip({ active, payload }: {
  active?: boolean
  payload?: Array<{ payload: TimelinePhase }>
}) {
  if (!active || !payload?.length) return null
  const p = payload[0].payload
  return (
    <div className="bg-white border border-border rounded-xl p-3 shadow-md text-xs max-w-[200px]">
      <p className="font-medium text-deep mb-1">{p.age}歳（{p.year}年）</p>
      <p className="text-muted mb-1">{p.title}</p>
      <p className="font-medium" style={{
        color: p.isPeak ? '#1a5c3a' : p.isLow ? '#8b2020' : '#534AB7'
      }}>スコア {p.score}</p>
      {p.isFuture && <p className="text-muted/60 mt-1">※ 予測値</p>}
    </div>
  )
}

export default function FortuneGraph({ timeline, birthYear }: Props) {
  const nowYear = new Date().getFullYear()

  const data = timeline.map(p => ({
    ...p,
    label: `${p.age}歳`,
  }))

  // 現在位置をグラフ上のX軸ラベルで近似
  const nowAge  = nowYear - birthYear
  const nowLabel = `${Math.round(nowAge / 10) * 10}歳`

  return (
    <ResponsiveContainer width="100%" height={200}>
      <AreaChart data={data} margin={{ top: 12, right: 12, bottom: 0, left: -20 }}>
        <defs>
          <linearGradient id="fortune-gradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%"   stopColor="#534AB7" stopOpacity={0.22} />
            <stop offset="100%" stopColor="#534AB7" stopOpacity={0} />
          </linearGradient>
        </defs>

        <CartesianGrid strokeDasharray="3 3" stroke="#e8e3d8" strokeWidth={0.5} vertical={false} />

        <XAxis
          dataKey="label"
          tick={{ fontSize: 10, fill: '#aaa' }}
          tickLine={false}
          axisLine={false}
          interval={1}
        />
        <YAxis
          domain={[0, 100]}
          ticks={[25, 50, 75, 100]}
          tick={{ fontSize: 9, fill: '#bbb' }}
          tickLine={false}
          axisLine={false}
        />

        <Tooltip content={<CustomTooltip />} />

        {/* 現在地の縦線 */}
        <ReferenceLine
          x={nowLabel}
          stroke="#c9a84c"
          strokeWidth={1.5}
          strokeDasharray="5 3"
          label={{ value: '現在', position: 'top', fontSize: 9, fill: '#c9a84c' }}
        />

        <Area
          type="monotone"
          dataKey="score"
          stroke="#534AB7"
          strokeWidth={2.5}
          fill="url(#fortune-gradient)"
          dot={<CustomDot />}
          activeDot={{ r: 7, fill: '#534AB7', stroke: '#fff', strokeWidth: 2 }}
        />
      </AreaChart>
    </ResponsiveContainer>
  )
}
