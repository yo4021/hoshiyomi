import Stripe from 'stripe'
import type { PlanType } from '@/types'

// サーバーサイドのみで使用
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-06-20',
  typescript: true,
})

export const PLANS: Record<PlanType, {
  name: string
  priceJpy: number | null
  priceId: string | null
  maxDivinations: number
  features: string[]
}> = {
  free: {
    name: 'フリープラン',
    priceJpy: null,
    priceId: null,
    maxDivinations: 3,
    features: [
      '基本スコア表示',
      '3占術まで選択',
      '人生年表グラフ',
      '簡易鑑定文（短文）',
    ],
  },
  standard: {
    name: 'スタンダードプラン',
    priceJpy: 980,
    priceId: process.env.STRIPE_PRICE_STANDARD_MONTHLY ?? null,
    maxDivinations: 30,
    features: [
      '全占術・補正オプション',
      'AI深層鑑定（全6項目）',
      '金運・仕事運・恋愛運',
      'PDF鑑定書ダウンロード',
      '月30回まで鑑定',
    ],
  },
  premium: {
    name: 'プレミアムプラン',
    priceJpy: 7800,
    priceId: process.env.STRIPE_PRICE_PREMIUM_YEARLY ?? null,
    maxDivinations: 999,
    features: [
      'スタンダード全機能',
      '月次自動更新鑑定',
      '相性鑑定（ペア占い）',
      '年間運勢カレンダー',
      '占い師監修コメント',
    ],
  },
  business: {
    name: 'ビジネスプラン',
    priceJpy: 50000,
    priceId: null, // 要お問い合わせ
    maxDivinations: -1,
    features: [
      'API連携（占術エンジン）',
      'ホワイトラベル提供',
      'カスタム占術追加',
      'SLA保証・専任サポート',
    ],
  },
}

/** Stripe チェックアウトセッション作成 */
export async function createCheckoutSession({
  plan,
  userId,
  email,
  successUrl,
  cancelUrl,
}: {
  plan: PlanType
  userId: string
  email: string
  successUrl: string
  cancelUrl: string
}): Promise<string> {
  const planConfig = PLANS[plan]
  if (!planConfig.priceId) throw new Error('この料金プランはお問い合わせください')

  const session = await stripe.checkout.sessions.create({
    mode: 'subscription',
    payment_method_types: ['card'],
    line_items: [{ price: planConfig.priceId, quantity: 1 }],
    customer_email: email,
    client_reference_id: userId,
    success_url: successUrl,
    cancel_url: cancelUrl,
    locale: 'ja',
    metadata: { userId, plan },
  })

  return session.url!
}

/** Stripe Customer Portal URL 取得 */
export async function createPortalSession(
  customerId: string,
  returnUrl: string
): Promise<string> {
  const session = await stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: returnUrl,
  })
  return session.url
}
