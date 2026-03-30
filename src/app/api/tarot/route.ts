import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { stripe } from '@/lib/stripe'

const SPREAD_NAMES: Record<string, string> = {
  onecard:   '1枚引き（今のメッセージ）',
  three:     '過去・現在・未来の3枚引き',
  love:      '恋愛スプレッド',
  situation: '状況分析の5枚引き',
}

interface DrawnCard {
  name: string
  reversed: boolean
  position: string
}

export async function POST(req: NextRequest) {
  let body: unknown
  try { body = await req.json() } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const { question, birthDate, spreadId, cards, sessionId } = body as {
    question?: string
    birthDate?: string
    spreadId?: string
    cards?: DrawnCard[]
    sessionId?: string
  }

  if (!question?.trim()) {
    return NextResponse.json({ error: 'question is required' }, { status: 400 })
  }
  if (!cards?.length) {
    return NextResponse.json({ error: 'cards are required' }, { status: 400 })
  }

  // Stripe決済検証（PAYMENT_ENABLED=true のときのみ）
  const paymentEnabled = process.env.PAYMENT_ENABLED === 'true'
  if (paymentEnabled) {
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
  }

  const spreadName  = SPREAD_NAMES[spreadId ?? 'three'] ?? '3枚引き'
  const cardsText   = cards.map(c =>
    `【${c.position}】${c.name}（${c.reversed ? '逆位置' : '正位置'}）`
  ).join('\n')
  const birthInfo   = birthDate
    ? `\n相談者の生年月日: ${birthDate}（命式・星座・九星の傾向を解釈に統合してください）`
    : ''

  const prompt = `あなたはプロのタロット占い師であり、温かい心のカウンセラーでもあります。
相談者の悩みに深く共感し、どんなカードが出ても必ず前向きな道を照らしてください。
逆位置や困難を示すカードが出た場合も、「気づき」「乗り越えるべき課題」「成長のチャンス」として
ポジティブにリフレーミングし、相談者が希望と勇気を持てるよう導いてください。

【スプレッド】${spreadName}
【相談者の悩み・質問】${question}
${birthInfo}

【引いたカード】
${cardsText}

以下の構成で、温かく丁寧な鑑定文を書いてください（合計700〜900字）：

◆ はじめに（50〜80字）
「${question}」という悩みに寄り添い、その気持ちを受け止める共感の言葉から始めてください。

◆ カードのメッセージ（各カード100〜150字）
各カードの位置の意味と、相談者の状況を具体的に結びつけて解釈してください。
逆位置のカードは「○○が逆位置で現れています。これは〜というメッセージです」と明示し、
前向きな意味として解釈してください。

◆ 今のあなたに必要なこと（150〜200字）
具体的な行動指針を2〜3点、実践しやすい形で伝えてください。

◆ 締めくくり（80〜100字）
希望と励ましを込めた温かいメッセージで締めてください。`

  const client  = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
  const encoder = new TextEncoder()

  const stream = new ReadableStream({
    async start(controller) {
      try {
        const anthropicStream = await client.messages.stream({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 1400,
          messages: [{ role: 'user', content: prompt }],
        })

        for await (const chunk of anthropicStream) {
          if (
            chunk.type === 'content_block_delta' &&
            chunk.delta.type === 'text_delta'
          ) {
            controller.enqueue(encoder.encode(
              `data: ${JSON.stringify({ type: 'delta', text: chunk.delta.text })}\n\n`
            ))
          }
        }
      } catch (err) {
        console.error('Tarot API error:', err)
      }

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
