/**
 * POST /api/divination
 *
 * Claude APIをサーバーサイドで呼び出し、ストリーミングで返す。
 * APIキーはサーバー環境変数に保存され、クライアントには露出しない。
 */

import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import {
  buildDivinationResult,
  buildBasePrompt,
  buildSectionPrompt,
} from '@/lib/divination'
import type { DivinationInput, ReadingSection } from '@/types'
import { stripe } from '@/lib/stripe'

// ─── レート制限（簡易インメモリ）────────────────────────────────
// 本番はRedis（Vercel KV / Upstash）を使用すること
const rateLimitMap = new Map<string, { count: number; resetAt: number }>()

function checkRateLimit(ip: string): boolean {
  const now = Date.now()
  const entry = rateLimitMap.get(ip)
  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + 60_000 })
    return true
  }
  if (entry.count >= 10) return false  // 1分間に10回まで
  entry.count++
  return true
}

// ─── バリデーション ──────────────────────────────────────────
function validateInput(body: unknown): DivinationInput | null {
  if (!body || typeof body !== 'object') return null
  const b = body as Record<string, unknown>
  if (typeof b.birthDate !== 'string') return null
  if (!/^\d{4}-\d{2}-\d{2}$/.test(b.birthDate)) return null

  return {
    birthDate:    b.birthDate,
    birthTime:    typeof b.birthTime === 'string' ? b.birthTime : undefined,
    birthCity:    typeof b.birthCity === 'string' ? b.birthCity : undefined,
    nameSei:      typeof b.nameSei   === 'string' ? b.nameSei   : undefined,
    nameMei:      typeof b.nameMei   === 'string' ? b.nameMei   : undefined,
    activeTypes:  Array.isArray(b.activeTypes)  ? b.activeTypes  : ['western','vedic','kyusei','shiju','numerology'],
    activeOptions:Array.isArray(b.activeOptions) ? b.activeOptions : ['precession','climate'],
  }
}

// ─── ストリーミングレスポンス ────────────────────────────────
const SECTIONS: ReadingSection[] = [
  'general', 'traits', 'money', 'love', 'currentFortune', 'hardTimes'
]

export async function POST(req: NextRequest) {
  // レート制限チェック
  const ip = req.headers.get('x-forwarded-for') ?? req.headers.get('x-real-ip') ?? 'unknown'
  if (!checkRateLimit(ip)) {
    return NextResponse.json({ error: 'Too many requests. Please try again later.' }, { status: 429 })
  }

  // バリデーション
  let body: unknown
  try { body = await req.json() } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }
  const input = validateInput(body)
  if (!input) {
    return NextResponse.json({ error: 'Invalid input: birthDate is required (YYYY-MM-DD)' }, { status: 400 })
  }

  // Stripeで支払い検証（サーバーサイド）
  const sessionId = (body as Record<string,unknown>).sessionId as string | undefined
  if (!sessionId) {
    return NextResponse.json({ error: 'payment_required' }, { status: 402 })
  }
  try {
    const stripeSession = await stripe.checkout.sessions.retrieve(sessionId)
    if (stripeSession.payment_status !== 'paid') {
      return NextResponse.json({ error: 'payment_required' }, { status: 402 })
    }
  } catch {
    return NextResponse.json({ error: 'payment_required' }, { status: 402 })
  }

  // セクション取得（部分更新時）
  const section = (body as Record<string,unknown>).section as ReadingSection | undefined

  // 占術計算（APIキー不要の純粋計算）
  const result = buildDivinationResult(input)
  const basePrompt = buildBasePrompt(result)

  // Anthropic クライアント初期化（サーバーサイドのみ）
  const client = new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY,
  })

  // ストリーミングレスポンス
  const encoder = new TextEncoder()
  const stream = new ReadableStream({
    async start(controller) {
      // まず計算結果（スコア・命式）をJSONで送る
      const calcData = JSON.stringify({
        type: 'calc',
        scores: result.scores,
        astro: result.astro,
        nameResult: result.nameResult,
        timeline: result.timeline,
        nowForecast: result.nowForecast,
      })
      controller.enqueue(encoder.encode(`data: ${calcData}\n\n`))

      // 指定セクションのみ、またはすべてのセクションをストリーミング
      const sectionsToRun = section ? [section] : SECTIONS

      for (const sec of sectionsToRun) {
        const prompt = buildSectionPrompt(sec, basePrompt, result)
        try {
          const anthropicStream = await client.messages.stream({
            model: 'claude-sonnet-4-20250514',
            max_tokens: 800,
            messages: [{ role: 'user', content: prompt }],
          })

          // セクション開始マーカー
          controller.enqueue(encoder.encode(
            `data: ${JSON.stringify({ type: 'section_start', section: sec })}\n\n`
          ))

          for await (const chunk of anthropicStream) {
            if (
              chunk.type === 'content_block_delta' &&
              chunk.delta.type === 'text_delta'
            ) {
              const data = JSON.stringify({
                type: 'delta',
                section: sec,
                text: chunk.delta.text,
              })
              controller.enqueue(encoder.encode(`data: ${data}\n\n`))
            }
          }

          // セクション完了マーカー
          controller.enqueue(encoder.encode(
            `data: ${JSON.stringify({ type: 'section_done', section: sec })}\n\n`
          ))

        } catch (err) {
          console.error(`Section ${sec} error:`, err)
          controller.enqueue(encoder.encode(
            `data: ${JSON.stringify({ type: 'section_error', section: sec })}\n\n`
          ))
        }
      }

      // 全セクション完了
      controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'done' })}\n\n`))
      controller.close()
    },
  })

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'X-Accel-Buffering': 'no',
    },
  })
}
