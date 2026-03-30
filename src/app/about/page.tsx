import Link from 'next/link'

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-paper">
      <header className="bg-deep text-white py-14 px-6 text-center relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none"
          style={{ background: 'radial-gradient(ellipse 80% 60% at 50% 0%,rgba(201,168,76,.2),transparent)' }} />
        <p className="font-display text-xs tracking-[.3em] text-gold mb-3 uppercase">About</p>
        <h1 className="font-display text-3xl font-semibold tracking-widest mb-3">
          このサービスについて
        </h1>
        <p className="text-sm text-white/50 tracking-wide">星詠み占術エンジンの仕組みと思想</p>
      </header>

      <main className="max-w-2xl mx-auto px-5 py-16 space-y-8">

        <div className="card">
          <h2 className="font-serif text-base font-medium text-deep mb-3">なぜ「統合占術」なのか</h2>
          <p className="text-sm text-muted leading-relaxed">
            西洋占星術・インド占星術・九星気学・四柱推命・数秘術・姓名判断——それぞれの占術は異なる文化と視点から人間の本質を照らします。単一の占術が見落とすものを、別の占術が捉えることがあります。複数の占術が共鳴するテーマこそ、その人の人生において真に重要なテーマである可能性が高い——これが「統合占術」の思想です。
          </p>
        </div>

        <div className="card">
          <h2 className="font-serif text-base font-medium text-deep mb-3">歳差補正とは</h2>
          <p className="text-sm text-muted leading-relaxed">
            地球の自転軸は約26,000年かけてゆっくりと首を振る「歳差運動」をしています。この影響で、西洋占星術が基準とする「春分点」の位置は、実際の星座（恒星黄道）と約23°ずれています。2000年前に体系化された西洋占星術の星座分類は、現代の実際の天体位置とは一致しません。
            <br /><br />
            インド占星術（ジョーティッシュ）はこの歳差を考慮した「恒星黄道」を使用します。星詠みでは両者を統合する際にこの補正を適用し、西洋占星術スコアを×0.96・インド占星術スコアを×1.04で調整しています。
          </p>
        </div>

        <div className="card">
          <h2 className="font-serif text-base font-medium text-deep mb-3">AIはどのように鑑定文を生成するか</h2>
          <p className="text-sm text-muted leading-relaxed">
            生年月日・出生地・お名前などの入力情報から、各占術の理論に基づいた命式データ（星座・九星・干支・ライフパス数・姓名画数など）を計算します。このデータをAnthropic社のClaude AIに渡し、各占術の解釈を統合した鑑定文をリアルタイムで生成します。
            <br /><br />
            AIは各セクションごとに異なる視点（総合・特性・金運・恋愛・現在の流れ・低迷期対処）から鑑定文を作成するため、単純なテンプレートでは表現できない深みのある内容を提供します。
          </p>
        </div>

        <div className="card bg-[#fffbf0] border-gold/30">
          <h2 className="font-serif text-base font-medium text-[#7a4d0a] mb-3">⚠ 免責事項</h2>
          <p className="text-sm text-[#7a4d0a]/70 leading-relaxed">
            本サービスはエンターテインメント目的で提供されています。占術は科学的に証明された技術ではなく、鑑定結果は参考情報に過ぎません。人生の重要な決断（医療・法律・投資・進路など）においては、必ず専門家のアドバイスを受けてください。本サービスの鑑定結果によって生じた損害について、当サービスは責任を負いません。
          </p>
        </div>

        <div className="text-center pt-4">
          <Link href="/fortune"
            className="inline-block bg-deep text-white text-sm font-medium px-8 py-3.5 rounded-full
                       tracking-widest hover:bg-[#1e1446] transition">
            ✦ 鑑定を始める
          </Link>
        </div>
      </main>

      <footer className="border-t border-border py-8 px-6 text-center text-xs text-muted">
        <p>© 2026 星詠み占術エンジン　｜　本サービスはエンターテインメント目的です</p>
      </footer>
    </div>
  )
}
