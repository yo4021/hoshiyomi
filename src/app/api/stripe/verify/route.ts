import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'

export async function GET(req: NextRequest) {
  const sessionId = req.nextUrl.searchParams.get('session_id')
  if (!sessionId) return NextResponse.json({ paid: false })

  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId)
    return NextResponse.json({ paid: session.payment_status === 'paid' })
  } catch {
    return NextResponse.json({ paid: false })
  }
}
