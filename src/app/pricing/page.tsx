import Link from 'next/link'
import { PLANS } from '@/lib/stripe'

export default function PricingPage() {
  const plans = [
    { key: 'free',     highlight: false, popular: false },
    { key: 'standard', highlight: true,  popular: true  },
    { key: 'premium',  highlight: false, popular: false },
    { key: 'business', highlight: false, popular: false },
  ] as const

  return (
    <div className="min-h-screen bg-paper">
      {/* Header */}
      <header className="bg-deep text-white py-14 px-6 text-center relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none"
          style={{ background: 'radial-gradient(ellipse 80% 60% at 50% 0%,rgba(201,168,76,.2),transparent)' }} />
        <p className="font-display text-xs tracking-[.3em] text-gold mb-3 uppercase">Pricing</p>
        <h1 className="font-display text-3xl font-semibold tracking-widest mb-3">料金プラン</h1>
        <p className="text-sm text-white/50 tracking-wide">まずは無料で体験。いつでもアップグレード可能。</p>
      </header>

      <main className="max-w-5xl mx-auto px-5 py-16">
        {/* Plans Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-16">
          {plans.map(({ key, popular }) => {
            const plan = PLANS[key]
            return (
              <div key={key}
                className={`rounded-2xl p-6 flex flex-col ${
                  key === 'business'
                    ? 'bg-gradient-to-br from-[#b8903a] to-[#d4aa52] text-white'
                    : key === 'premium'
                    ? 'bg-deep text-white border border-deep'
                    : popular
                    ? 'bg-white border-2 border-mid shadow-md shadow-mid/10'
                    : 'bg-white border border-border'
                }`}>

                {popular && (
                  <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-mid text-white w-fit mb-3">
                    人気 No.1
                  </span>
                )}

                <div className={`text-xs font-medium tracking-widest uppercase mb-1 ${
                  key === 'business' || key === 'premium' ? 'text-white/60' : 'text-muted'
                }`}>
                  {plan.name}
                </div>

                <div className={`text-2xl font-medium font-serif mb-5 ${
                  key === 'business' || key === 'premium' ? 'text-white' : 'text-deep'
                }`}>
                  {plan.priceJpy === null
                    ? key === 'business' ? '要相談' : '無 料'
                    : `¥${plan.priceJpy.toLocaleString()}`}
                  {plan.priceJpy !== null && key !== 'business' && (
                    <span className={`text-xs font-normal ml-1 ${
                      key === 'premium' ? 'text-white/60' : 'text-muted'
                    }`}>
                      {key === 'premium' ? '/年' : '/月'}
                    </span>
                  )}
                </div>

                <ul className="space-y-2.5 flex-1 mb-6">
                  {plan.features.map(f => (
                    <li key={f} className={`text-xs flex items-start gap-2 ${
                      key === 'business' || key === 'premium' ? 'text-white/80' : 'text-muted'
                    }`}>
                      <span className={`mt-0.5 flex-shrink-0 ${
                        key === 'business' ? 'text-white' :
                        key === 'premium'  ? 'text-gold2' : 'text-gold'
                      }`}>✓</span>
                      {f}
                    </li>
                  ))}
                </ul>

                {key === 'business' ? (
                  <a href="mailto:info@hoshiyomi.jp"
                    className="block text-center text-xs font-medium py-2.5 px-4 rounded-xl
                               bg-white/20 hover:bg-white/30 transition text-white">
                    お問い合わせ
                  </a>
                ) : key === 'free' ? (
                  <Link href="/fortune"
                    className="block text-center text-xs font-medium py-2.5 px-4 rounded-xl
                               border border-border hover:bg-paper transition">
                    無料で始める
                  </Link>
                ) : (
                  <Link href="/fortune"
                    className={`block text-center text-xs font-medium py-2.5 px-4 rounded-xl transition ${
                      popular
                        ? 'bg-mid text-white hover:bg-deep'
                        : 'bg-white/20 hover:bg-white/30 text-white'
                    }`}>
                    プランを選ぶ
                  </Link>
                )}
              </div>
            )
          })}
        </div>

        {/* FAQ */}
        <section>
          <h2 className="font-serif text-xl font-medium text-center mb-8 tracking-wider">
            よくある質問
          </h2>
          <div className="space-y-4 max-w-2xl mx-auto">
            {[
              {
                q: '無料プランでどこまで使えますか？',
                a: '生年月日を入力すると基本スコア・命式データ・人生年表グラフ・簡易鑑定文（短文）が表示されます。AI深層鑑定（6項目）・3大運詳細・PDF鑑定書はスタンダードプラン以上でご利用いただけます。',
              },
              {
                q: '解約はいつでもできますか？',
                a: 'はい、いつでもキャンセル可能です。解約後も現在の支払い期間終了まではサービスをご利用いただけます。',
              },
              {
                q: '鑑定結果はどのくらい正確ですか？',
                a: '本サービスはエンターテインメント目的です。AIが命式データを元に鑑定文を生成しますが、科学的根拠はありません。人生の重要な決定には専門家のアドバイスをお求めください。',
              },
              {
                q: '姓名判断は名前を入力しないと使えませんか？',
                a: '名前の入力は任意です。生年月日だけでも西洋占星術・インド占星術・九星気学・四柱推命・数秘術の5占術を統合した鑑定が可能です。',
              },
              {
                q: 'APIプランはどのような用途に使えますか？',
                a: '占いサービス・アプリへの組み込み、ホワイトラベル提供、占い師向けツールなど法人・開発者向けのB2B用途を想定しています。詳細はお問い合わせください。',
              },
            ].map(({ q, a }) => (
              <div key={q} className="card">
                <p className="font-medium text-sm text-deep mb-2">Q. {q}</p>
                <p className="text-sm text-muted leading-relaxed">A. {a}</p>
              </div>
            ))}
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-border py-8 px-6 text-center text-xs text-muted">
        <p className="mb-2">
          <Link href="/"       className="hover:text-deep mx-3">ホーム</Link>
          <Link href="/fortune" className="hover:text-deep mx-3">鑑定する</Link>
          <Link href="/about"  className="hover:text-deep mx-3">このサービスについて</Link>
        </p>
        <p>© 2024 星詠み占術エンジン　｜　本サービスはエンターテインメント目的です</p>
      </footer>
    </div>
  )
}
