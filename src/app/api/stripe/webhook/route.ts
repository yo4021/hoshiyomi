/**
 * Stripe Webhook エンドポイント
 * サブスクリプションの開始・更新・キャンセルを処理する
 */

import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import Stripe from 'stripe'

export async function POST(req: NextRequest) {
  const body = await req.text()
  const sig  = req.headers.get('stripe-signature')

  if (!sig) return NextResponse.json({ error: 'No signature' }, { status: 400 })

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!)
  } catch (err) {
    console.error('Webhook signature verification failed:', err)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  try {
    switch (event.type) {
      case 'customer.subscription.created':
      case 'customer.subscription.updated': {
        const sub = event.data.object as Stripe.Subscription
        const userId = sub.metadata.userId
        const plan   = sub.metadata.plan ?? 'standard'
        console.log(`✅ Subscription ${event.type}: userId=${userId}, plan=${plan}`)
        // TODO: DBのユーザープランを更新
        // await db.user.update({ where: { id: userId }, data: { plan, stripeSubscriptionId: sub.id } })
        break
      }

      case 'customer.subscription.deleted': {
        const sub = event.data.object as Stripe.Subscription
        const userId = sub.metadata.userId
        console.log(`❌ Subscription canceled: userId=${userId}`)
        // TODO: DBのユーザープランをfreeに戻す
        // await db.user.update({ where: { id: userId }, data: { plan: 'free' } })
        break
      }

      case 'invoice.payment_succeeded': {
        const invoice = event.data.object as Stripe.Invoice
        console.log(`💰 Payment succeeded: ${invoice.customer_email}`)
        break
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice
        console.log(`⚠️ Payment failed: ${invoice.customer_email}`)
        // TODO: ユーザーに支払い失敗メールを送信
        break
      }

      default:
        console.log(`Unhandled event type: ${event.type}`)
    }
  } catch (err) {
    console.error('Webhook handler error:', err)
    return NextResponse.json({ error: 'Webhook handler failed' }, { status: 500 })
  }

  return NextResponse.json({ received: true })
}
