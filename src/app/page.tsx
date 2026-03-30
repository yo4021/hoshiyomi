import Link from 'next/link'

const MENUS = [
  { href:'/today',icon:'☀',title:'今日の運勢',desc:'毎日更新。金運・仕事・恋愛・健康の4運勢と時間帯別アドバイス',badge:'無料・毎日更新',badgeColor:'#1a5c3a',badgeBg:'#f2fbf5' },
  { href:'/tarot',icon:'🔮',title:'タロット悩み相談',desc:'スプレッドを選んでカードを引く。AIが共感しながら深層解読・行動指針を提示',badge:'¥300/回',badgeColor:'#534AB7',badgeBg:'#EEEDFE' },
  { href:'/fortune',icon:'✦',title:'AI統合深層鑑定',desc:'7占術を統合したAI鑑定。人生年表・金運・恋愛運・低迷期対策',badge:'¥500/回',badgeColor:'#2d1f5e',badgeBg:'#f8f7ff' },
  { href:'/compatibility',icon:'💑',title:'相性鑑定',desc:'2人の命式を統合解析。恋愛・仕事・友情・長期的な絆を鑑定',badge:'無料',badgeColor:'#7a1f52',badgeBg:'#fff0f7' },
  { href:'/dream',icon:'🌙',title:'夢占い',desc:'夢のキーワードを入力するとAIが潜在意識からのメッセージを読み解く',badge:'¥100/回',badgeColor:'#0d4f8a',badgeBg:'#f0f6ff' },
  { href:'/calendar',icon:'📅',title:'吉日カレンダー',desc:'六曜・開運テーマ別おすすめ日を月カレンダーで確認',badge:'無料',badgeColor:'#7a4d0a',badgeBg:'#fffbf0' },
]

export default function HomePage() {
  return (
    <main className="min-h-screen">
      <section className="relative overflow-hidden bg-deep text-white py-20 px-6 text-center">
        <div className="absolute inset-0 pointer-events-none" style={{background:'radial-gradient(ellipse 90% 70% at 50% -10%,rgba(201,168,76,.22),transparent)'}}/>
        <p className="font-display text-xs tracking-[.3em] text-gold mb-4 uppercase relative z-10">Integrated Divination System</p>
        <h1 className="font-display text-4xl md:text-5xl font-semibold tracking-widest mb-4 leading-tight relative z-10">星詠み<span className="text-gold2">占術</span>エンジン</h1>
        <p className="text-sm text-white/50 tracking-widest mb-10 max-w-lg mx-auto leading-loose relative z-10">西洋・東洋・姓名判断を統合し、歳差補正で現代に最適化。<br/>AIが金運・仕事運・恋愛運を含む深層鑑定を生成します。</p>
        <div className="flex flex-wrap gap-3 justify-center relative z-10">
          <Link href="/today" className="inline-block bg-gold text-deep font-medium text-sm px-8 py-3.5 rounded-full tracking-widest hover:bg-gold2 transition-all hover:-translate-y-0.5 shadow-lg">☀ 今日の運勢を見る（無料）</Link>
          <Link href="/fortune" className="inline-block border border-white/30 text-white font-medium text-sm px-8 py-3.5 rounded-full tracking-widest hover:bg-white/10 transition-all">✦ 深層鑑定を受ける</Link>
        </div>
      </section>

      <section className="max-w-2xl mx-auto px-5 py-14">
        <h2 className="font-serif text-xl font-medium text-center mb-2 tracking-wider">すべての機能</h2>
        <p className="text-xs text-muted text-center mb-8">無料から始められます</p>
        <div className="w-full h-16 bg-[#f0ede6] rounded-xl flex items-center justify-center mb-6 border border-border">
          <span className="text-xs text-muted">広告</span>
        </div>
        <div className="space-y-3">
          {MENUS.map(m=>(
            <Link key={m.href} href={m.href} className="flex items-center gap-4 card hover:shadow-md hover:-translate-y-0.5 transition-all group">
              <div className="w-12 h-12 rounded-2xl bg-[#f0ede6] flex items-center justify-center text-2xl flex-shrink-0 group-hover:bg-deep group-hover:text-gold2 transition-all">{m.icon}</div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <span className="font-serif text-sm font-medium text-deep">{m.title}</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full" style={{background:m.badgeBg,color:m.badgeColor}}>{m.badge}</span>
                </div>
                <p className="text-xs text-muted leading-relaxed">{m.desc}</p>
              </div>
              <span className="text-muted group-hover:text-deep transition text-sm">→</span>
            </Link>
          ))}
        </div>
      </section>

      {/* 差別化ポイント */}
      <section className="bg-deep/5 py-14 px-5">
        <div className="max-w-2xl mx-auto">
          <p className="font-display text-xs tracking-[.3em] text-gold text-center mb-2 uppercase">Why Hoshiyomi</p>
          <h2 className="font-serif text-xl font-medium text-center mb-2 tracking-wider">星詠みが選ばれる理由</h2>
          <p className="text-xs text-muted text-center mb-8 leading-relaxed">一般的な占いアプリとは、根本的に異なるアプローチをとっています</p>

          {/* メイン3特徴 */}
          <div className="grid sm:grid-cols-3 gap-4 mb-6">
            {[
              {icon:'✦',title:'7占術を同時統合',desc:'西洋・インド・九星気学・四柱推命・数秘術・姓名判断・タロット。複数が共鳴するテーマのみが「本当の傾向」です。'},
              {icon:'◈',title:'歳差補正で現代精度',desc:'約26,000年周期の地球の歳差運動による23°のズレを補正。昔のままの星座ではなく、今の実際の天体位置で鑑定します。'},
              {icon:'◉',title:'AIが毎回生成する鑑定文',desc:'固定テキストの使い回しではなく、あなたの命式専用にClaude AIが金運・仕事・恋愛・転機を動的に生成します。'},
            ].map(f=>(
              <div key={f.title} className="card text-center">
                <div className="font-display text-2xl text-gold mb-3">{f.icon}</div>
                <h3 className="font-serif text-sm font-medium text-deep mb-2">{f.title}</h3>
                <p className="text-xs text-muted leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>

          {/* サブ特徴 横並び */}
          <div className="grid sm:grid-cols-2 gap-3">
            {[
              {icon:'🌍',title:'気候・季節補正',desc:'生まれた季節・地域の気候エネルギーをスコアに反映。同じ星座でも生まれ季節で傾向は変わります。'},
              {icon:'📈',title:'人生年表グラフ',desc:'過去〜未来の運勢を年表グラフで可視化。低迷期・上昇期・転機のタイミングが一目でわかります。'},
              {icon:'⚡',title:'リアルタイム天体位置',desc:'鑑定時の実際の天体配置を加味したオプション補正。今この瞬間の宇宙エネルギーを反映します。'},
              {icon:'🔒',title:'APIキー不要・安全',desc:'AIとの通信はすべてサーバーサイドで処理。あなたの個人情報や入力データはブラウザ外に保存されません。'},
            ].map(f=>(
              <div key={f.title} className="card flex items-start gap-3 py-3">
                <span className="text-xl flex-shrink-0">{f.icon}</span>
                <div>
                  <h3 className="font-serif text-xs font-medium text-deep mb-1">{f.title}</h3>
                  <p className="text-xs text-muted leading-relaxed">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 他サービスとの違い */}
      <section className="py-12 px-5">
        <div className="max-w-2xl mx-auto">
          <h2 className="font-serif text-lg font-medium text-center mb-6 tracking-wider">一般的な占いとの違い</h2>
          <div className="card overflow-hidden p-0">
            <div className="grid grid-cols-3 text-xs font-medium bg-deep text-white">
              <div className="py-3 px-4">比較項目</div>
              <div className="py-3 px-4 text-center text-gold">星詠み</div>
              <div className="py-3 px-4 text-center text-white/50">一般の占いアプリ</div>
            </div>
            {[
              ['占術の数','7占術を統合','1〜2種類'],
              ['鑑定文','AIが毎回専用生成','固定テキスト'],
              ['天体補正','歳差・気候・リアルタイム','補正なし'],
              ['人生グラフ','年表で可視化','なし'],
              ['精度への姿勢','現代科学に基づく補正','伝統方式のまま'],
            ].map(([item, ours, theirs], i)=>(
              <div key={item} className={`grid grid-cols-3 text-xs ${i%2===0?'bg-white':'bg-[#faf8f3]'}`}>
                <div className="py-3 px-4 text-muted">{item}</div>
                <div className="py-3 px-4 text-center font-medium text-[#1a5c3a]">✓ {ours}</div>
                <div className="py-3 px-4 text-center text-muted/60">{theirs}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-deep text-white text-center py-16 px-6">
        <h2 className="font-display text-2xl font-semibold tracking-widest mb-3">今日の運勢を確認する</h2>
        <p className="text-sm text-white/50 mb-8">生年月日だけで始められます。無料。</p>
        <Link href="/today" className="inline-block bg-gold text-deep font-medium text-sm px-10 py-4 rounded-full tracking-widest hover:bg-gold2 transition-all">☀ 今日の運勢を見る</Link>
      </section>

      <footer className="border-t border-border py-8 px-6 text-center text-xs text-muted">
        <p className="mb-3 flex flex-wrap justify-center gap-x-4 gap-y-1">
          <Link href="/today" className="hover:text-deep transition">今日の運勢</Link>
          <Link href="/fortune" className="hover:text-deep transition">深層鑑定</Link>
          <Link href="/compatibility" className="hover:text-deep transition">相性鑑定</Link>
          <Link href="/dream" className="hover:text-deep transition">夢占い</Link>
          <Link href="/calendar" className="hover:text-deep transition">吉日カレンダー</Link>
          <Link href="/pricing" className="hover:text-deep transition">料金プラン</Link>
          <Link href="/about" className="hover:text-deep transition">サービスについて</Link>
        </p>
        <p>© 2026 星詠み占術エンジン　｜　本サービスはエンターテインメント目的です</p>
      </footer>
    </main>
  )
}
