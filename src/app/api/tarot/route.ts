import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'

const MAJOR_ARCANA = [
  '愚者', '魔術師', '女教皇', '女帝', '皇帝', '法皇', '恋人', '戦車',
  '力', '隠者', '運命の輪', '正義', '吊るされた男', '死神', '節制',
  '悪魔', '塔', '星', '月', '太陽', '審判', '世界',
]

interface DrawnCard {
  name: string
  reversed: boolean
  position: string
}

function drawCards(): DrawnCard[] {
  const shuffled = [...MAJOR_ARCANA].sort(() => Math.random() - 0.5)
  const positions = ['過去・根本', '現在・状況', '未来・指針']
  return shuffled.slice(0, 3).map((name, i) => ({
    name,
    reversed: Math.random() > 0.6,
    position: positions[i],
  }))
}

export async function POST(req: NextRequest) {
  let body: unknown
  try { body = await req.json() } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const { question, birthDate } = body as { question?: string; birthDate?: string }
  if (!question?.trim()) {
    return NextResponse.json({ error: 'question is required' }, { status: 400 })
  }

  const cards = drawCards()
  const cardsText = cards.map(c =>
    `【${c.position}】${c.name}（${c.reversed ? '逆位置' : '正位置'}）`
  ).join('\n')
  const birthInfo = birthDate
    ? `\n依頼者の生年月日: ${birthDate}（命式を解釈の背景として参照）`
    : ''

  const prompt = `あなたはプロのタロット占い師です。以下の悩みと引いたカードを元に、深く丁寧なタロット鑑定を日本語で行ってください。

【依頼者の悩み・質問】
${question}
${birthInfo}

【引いたカード】
${cardsText}

以下の構成で鑑定文を書いてください（合計600〜800字）：

1. 3枚のカードが示す全体的なメッセージ（80字程度）
2. 各カードの解釈（各カードについて位置の意味を踏まえて100〜120字ずつ）
3. 悩みへの具体的なアドバイス（180字程度）
4. これからの展望と行動指針（100字程度）

語り口は温かく具体的に。カードの正位置・逆位置を明示しながら丁寧に解説してください。`

  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

  const encoder = new TextEncoder()
  const stream = new ReadableStream({
    async start(controller) {
      controller.enqueue(encoder.encode(
        `data: ${JSON.stringify({ type: 'cards', cards })}\n\n`
      ))

      try {
        const anthropicStream = await client.messages.stream({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 1200,
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
