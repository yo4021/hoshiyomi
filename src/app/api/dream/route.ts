import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { stripe } from '@/lib/stripe'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

// レート制限（有料ユーザー向けの緩やかな制限）
const rateLimitMap = new Map<string, { count: number; resetAt: number }>()
function checkRate(ip: string): boolean {
  const now = Date.now()
  const e = rateLimitMap.get(ip)
  if (!e || now > e.resetAt) { rateLimitMap.set(ip, { count: 1, resetAt: now + 60_000 }); return true }
  if (e.count >= 20) return false
  e.count++; return true
}

export async function POST(req: NextRequest) {
  const ip = req.headers.get('x-forwarded-for') ?? 'unknown'
  if (!checkRate(ip)) return NextResponse.json({ error: 'Too many requests' }, { status: 429 })

  const { keywords, birthDate, sessionId } = await req.json() as {
    keywords: string
    birthDate?: string
    sessionId: string
  }

  if (!keywords?.trim()) return NextResponse.json({ error: 'keywords required' }, { status: 400 })

  // Stripeで支払い検証（サーバーサイド）
  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId)
    if (session.payment_status !== 'paid') {
      return NextResponse.json({ error: 'payment_required' }, { status: 402 })
    }
  } catch {
    return NextResponse.json({ error: 'payment_required' }, { status: 402 })
  }

  const birthInfo = birthDate
    ? `\n【相談者の命式情報】生年月日：${birthDate}\nこの命式（星座・九星・四柱・数秘）を夢の解釈に統合してください。`
    : ''

  const prompt = `あなたは東西の夢占いと占術に精通したプロの夢分析師です。以下の夢の内容を元に、日本語で深く丁寧な夢占い鑑定を行ってください。${birthInfo}

【夢の内容・キーワード】
「${keywords}」

以下の構成で、読み応えのある詳細な鑑定文を書いてください（合計800〜1000字程度）。各セクションを**太字**の見出しで区切り、改行を活用して読みやすくしてください。

**夢のシンボル解読**
夢に登場した各要素（人物・場所・物・行動・感情）が象徴する意味を、東洋と西洋の夢占いの両観点から丁寧に解説してください。なぜそのシンボルがその意味を持つのかも説明してください。

**潜在意識からのメッセージ**
この夢全体があなたの深層心理・潜在意識から送っているメッセージを読み解いてください。フロイト心理学・ユング心理学の観点も取り入れながら、あなたの無意識が何を訴えているのかを具体的に伝えてください。

**現在の心理状態と感情**
この夢が映し出している今のあなたの感情状態・ストレス・抑圧された感情・欲求を読み取ってください。日常生活のどんな状況がこの夢を生んでいる可能性があるかも含めてください。

**近未来への暗示と予兆**
この夢が示す1〜3ヶ月以内の暗示・サイン・予兆を具体的に伝えてください。恋愛・仕事・対人関係・健康のうち、特に関連性の高い分野を中心に読み解いてください。

**開運アドバイスと行動指針**
この夢を受けて、今のあなたが取るべき具体的な行動・心がけ・避けること・大切にすることを3つ以上、わかりやすく伝えてください。この夢をポジティブなエネルギーに転換するための実践的な提案をしてください。`

  const encoder = new TextEncoder()
  const stream = new ReadableStream({
    async start(controller) {
      try {
        const s = await client.messages.stream({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 1500,
          messages: [{ role: 'user', content: prompt }],
        })
        for await (const chunk of s) {
          if (chunk.type === 'content_block_delta' && chunk.delta.type === 'text_delta') {
            controller.enqueue(encoder.encode(`data: ${JSON.stringify({ text: chunk.delta.text })}\n\n`))
          }
        }
      } catch (e) {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify({ error: 'API error' })}\n\n`))
      }
      controller.enqueue(encoder.encode('data: [DONE]\n\n'))
      controller.close()
    },
  })

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  })
}
