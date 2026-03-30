# 星詠み — AI統合占術エンジン

西洋・東洋・姓名判断を統合した、歳差補正対応のAI深層鑑定Webサービス。

## 技術スタック

- **フロントエンド**: Next.js 14 (App Router) + TypeScript + Tailwind CSS
- **AI鑑定**: Anthropic Claude API（サーバーサイドで安全に呼び出し）
- **グラフ**: Recharts
- **PDF出力**: jsPDF（クライアントサイド）
- **決済**: Stripe（サブスクリプション）
- **デプロイ**: Vercel 推奨

## セットアップ

### 1. 環境変数を設定

```bash
cp .env.local.example .env.local
```

`.env.local` を編集して各APIキーを設定してください：

```
ANTHROPIC_API_KEY=sk-ant-...     # 必須: Claude APIキー
STRIPE_SECRET_KEY=sk_test_...   # 任意: Stripe決済
NEXTAUTH_SECRET=...              # 任意: 認証
```

### 2. 依存パッケージをインストール

```bash
npm install
```

### 3. 開発サーバーを起動

```bash
npm run dev
```

ブラウザで http://localhost:3000 を開いてください。

## ディレクトリ構成

```
src/
├── app/
│   ├── api/
│   │   ├── divination/route.ts   # ★ Claude API呼び出し（APIキー保護）
│   │   └── stripe/
│   │       ├── checkout/route.ts # Stripe チェックアウト
│   │       └── webhook/route.ts  # Stripe Webhook
│   ├── fortune/page.tsx          # メイン鑑定ページ
│   ├── pricing/page.tsx          # 料金プランページ
│   ├── about/page.tsx            # サービス説明
│   └── page.tsx                  # ランディングページ
├── components/
│   └── divination/
│       ├── FortuneForm.tsx       # 入力フォーム
│       ├── FortuneResults.tsx    # 結果表示
│       └── FortuneGraph.tsx      # 運勢グラフ（Recharts）
├── lib/
│   ├── divination.ts             # 占術計算エンジン（純粋関数）
│   └── stripe.ts                 # Stripe設定
└── types/index.ts                # TypeScript型定義
```

## 重要: APIキーのセキュリティ

`src/app/api/divination/route.ts` でClaude APIをサーバーサイドで呼び出しているため、
**APIキーはクライアント（ブラウザ）に露出しません**。

`.env.local` は `.gitignore` に含まれており、Gitにコミットされません。

## Vercelへのデプロイ

```bash
# Vercel CLIでデプロイ
npx vercel

# または GitHub連携で自動デプロイ
# Vercelダッシュボードで環境変数を設定すること
```

Vercelの環境変数設定で `.env.local.example` の各変数を設定してください。

## Stripe設定手順

1. https://dashboard.stripe.com でアカウント作成
2. 「製品」→「料金」で以下を作成：
   - スタンダード月額: ¥980/月（recurring）
   - プレミアム年額: ¥7,800/年（recurring）
3. 各Price IDを `.env.local` の `STRIPE_PRICE_*` に設定
4. Webhookエンドポイントを `https://yourdomain.com/api/stripe/webhook` に設定

## ロードマップ

- [x] 占術計算エンジン（歳差補正・統合スコア）
- [x] Claude API ストリーミング鑑定
- [x] 人生年表グラフ（Recharts）
- [x] 金運・仕事運・恋愛運
- [x] Stripe決済基盤
- [ ] Supabaseでユーザー管理・鑑定履歴保存
- [ ] NextAuth.js認証
- [ ] PDF鑑定書（@react-pdf/renderer でサーバーサイド生成）
- [ ] 相性鑑定（ペア占い）
- [ ] 年間運勢カレンダー
- [ ] スマホアプリ（React Native）

## ライセンス

MIT
