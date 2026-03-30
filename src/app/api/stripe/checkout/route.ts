import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'

const PRODUCTS = {
  dream:   { name: 'AI夢占い深層鑑定',   amount: 100 },
  tarot:   { name: 'AIタロット悩み相談', amount: 300 },
  fortune: { name: 'AI統合深層鑑定',     amount: 500 },
} as const

type ProductType = keyof typeof PRODUCTS

export async function POST(req: NextRequest) {
  try {
    const { type } = await req.json() as { type: ProductType }
    const product = PRODUCTS[type]
    if (!product) return NextResponse.json({ error: 'Invalid type' }, { status: 400 })

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'
    const successPath = type === 'dream' ? '/dream' : type === 'tarot' ? '/tarot' : '/fortune'

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'],
      line_items: [{
        price_data: {
          currency: 'jpy',
          product_data: { name: product.name },
          unit_amount: product.amount,
        },
        quantity: 1,
      }],
      success_url: `${baseUrl}${successPath}?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url:  `${baseUrl}${successPath}?canceled=true`,
      locale: 'ja',
    })

    return NextResponse.json({ url: session.url })
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
