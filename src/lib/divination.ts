/**
 * 占術計算エンジン
 * サーバー・クライアント両方で使用可能な純粋関数群
 */

import type {
  DivinationInput,
  DivinationScores,
  AstroData,
  NameDivinationResult,
  TimelinePhase,
  NowForecast,
  DivinationResult,
} from '@/types'

// ─── 定数 ────────────────────────────────────────────────────

const SIGNS_JP = ['牡羊座','牡牛座','双子座','蟹座','獅子座','乙女座',
                  '天秤座','蠍座','射手座','山羊座','水瓶座','魚座']
const KYUSEI   = ['一白水星','二黒土星','三碧木星','四緑木星','五黄土星',
                  '六白金星','七赤金星','八白土星','九紫火星']
const STEMS    = ['甲','乙','丙','丁','戊','己','庚','辛','壬','癸']
const BRANCHES = ['子','丑','寅','卯','辰','巳','午','未','申','酉','戌','亥']

const CLIM_CORR = [.95,.90,1.00,1.05,1.08,1.10,1.08,1.06,1.02,.98,.92,.93]

const STROKE_MAP: Record<string, number> = {
  '一':1,'二':2,'三':3,'四':5,'五':4,'六':4,'七':2,'八':2,'九':2,'十':2,
  '山':3,'川':3,'田':5,'木':4,'水':4,'火':4,'土':3,'金':8,'花':7,
  '子':3,'女':3,'男':7,'大':3,'小':3,'中':4,'上':3,'下':3,'天':4,'地':6,
  '愛':13,'心':4,'美':9,'光':6,'太':4,'幸':8,'和':8,'春':9,'夏':10,
  '秋':9,'冬':5,'星':9,'月':4,'日':4,'年':6,'生':5,'人':2,'名':6,
  '風':9,'空':8,'海':9,'夢':13,'希':7,'望':11,'佳':8,'奈':8,'香':9,
  '純':10,'由':5,'恵':10,'里':7,'来':7,'明':8,'朗':10,'健':11,'雄':12,
  '誠':13,'晴':12,'直':8,'正':5,'清':11,'信':9,'高':10,'宮':10,
  '鈴':13,'村':7,'岡':8,'林':8,'本':5,'渡':12,'辺':5,'橋':16,'近':7,
  '藤':18,'加':5,'佐':7,'石':5,'吉':6,'坂':7,'井':4,'長':8,'松':8,
  '岩':8,'浜':10,'野':11,'口':3,'原':10,'島':10,'西':6,'東':8,'北':5,
  '南':9,'新':13,'古':5,'竹':6,'草':9,'雨':8,'雪':11,
}

// 吉数
const LUCKY_NUMS = new Set([1,3,5,6,7,8,11,13,15,16,17,18,21,23,24,25,29,31,32,33,35,37,39,41,45,47,48])

// ─── ユーティリティ ───────────────────────────────────────────

/** シード付き疑似乱数 */
function hash(s: string): number {
  let h = 0
  for (let i = 0; i < s.length; i++) h = Math.imul(31, h) + s.charCodeAt(i) | 0
  return Math.abs(h)
}
function rng(seed: string, min: number, max: number): number {
  return min + (hash(seed) % (max - min + 1))
}
function clamp(v: number, min = 30, max = 99): number {
  return Math.min(max, Math.max(min, v))
}

// ─── 星座・命式 ───────────────────────────────────────────────

function tropicIdx(month: number, day: number): number {
  const cuts = [21,20,21,21,23,23,23,24,23,22,20,19]
  for (let i = 0; i < 12; i++) {
    const sm = ((i + 2) % 12) + 1
    const nm = ((i + 3) % 12) + 1
    if (month === sm && day >= cuts[i]) return i
    if (month === nm && day < cuts[(i + 1) % 12]) return i
  }
  return 9
}

export function getTropicSign(month: number, day: number): string {
  return SIGNS_JP[tropicIdx(month, day)]
}

export function getVedicSign(month: number, day: number): string {
  return SIGNS_JP[((tropicIdx(month, day) - Math.round(23 / 30)) + 12) % 12]
}

export function getKyusei(year: number): string {
  return KYUSEI[(9 - (year - 1) % 9 - 1 + 9) % 9]
}

export function getShiju(year: number): string {
  return STEMS[(year + 6) % 10] + '・' + BRANCHES[(year + 8) % 12]
}

export function getLifePath(dateStr: string): number {
  let n = dateStr.replace(/-/g, '').split('').reduce((a, c) => a + parseInt(c), 0)
  while (n > 9 && n !== 11 && n !== 22) {
    n = String(n).split('').reduce((a, c) => a + parseInt(c), 0)
  }
  return n
}

// ─── 姓名判断 ─────────────────────────────────────────────────

function strokeCount(char: string): number {
  return STROKE_MAP[char] ?? (Math.floor(char.charCodeAt(0) % 15) + 2)
}

function totalStrokes(str: string): number {
  return str.split('').reduce((a, c) => a + strokeCount(c), 0)
}

function isLucky(n: number): '吉' | '凶' {
  return LUCKY_NUMS.has(n % 50) ? '吉' : '凶'
}

export function calcNameDivination(
  sei: string,
  mei: string
): NameDivinationResult | undefined {
  if (!sei && !mei) return undefined
  const t  = totalStrokes(sei)
  const j  = totalStrokes(sei + mei)
  const ch = totalStrokes(mei)
  const g  = Math.abs(t + ch - j)
  const so = t + ch

  return {
    tenkaku: t,  tenkakuLuck: isLucky(t),  tenkakuMeaning: '先祖・家系から受け継いだ運。家の土台となる運格。',
    jinkaku: j,  jinkakuLuck: isLucky(j),  jinkakuMeaning: '性格・才能・対人運を司る最重要の運格。',
    chikaku: ch, chikakuLuck: isLucky(ch), chikakuMeaning: '努力・晩年運・名誉運を示す運格。',
    gaikaku: g,  gaikakuLuck: isLucky(g),  gaikakuMeaning: '社会・職場・外の世界での運勢。',
    sokaku:  so, sokakuLuck:  isLucky(so), sokakuMeaning:  '総合的な人生全体の運勢を示す。',
  }
}

// ─── スコア計算 ───────────────────────────────────────────────

export function calcScores(input: DivinationInput): DivinationScores {
  const { birthDate, birthTime, birthCity, nameSei, nameMei, activeTypes, activeOptions } = input
  const [y, m] = birthDate.split('-').map(Number)
  const seed = birthDate + (birthTime ?? '') + (birthCity ?? '')
  const now = new Date()
  const cc = CLIM_CORR[m - 1]

  const BASE: Partial<Record<string, number>> = {
    western:   rng(seed + 'W', 55, 90),
    vedic:     rng(seed + 'V', 52, 90),
    kyusei:    rng(seed + 'K', 48, 88),
    shiju:     rng(seed + 'S', 50, 90),
    numerology:rng(seed + 'N', 50, 88),
    tarot:     rng(seed + 'T', 42, 82),
  }

  const bySystem: Partial<Record<string, number>> = {}

  activeTypes.forEach(t => {
    if (t === 'name') return
    let s = BASE[t] ?? 60
    if (activeOptions.includes('climate'))   s = Math.round(s * cc)
    if (activeOptions.includes('precession') && t === 'western') s = Math.round(s * 0.96)
    if (activeOptions.includes('precession') && t === 'vedic')   s = Math.round(s * 1.04)
    if (activeOptions.includes('realtime'))  s = Math.round(s * (0.97 + (hash(seed + t + now.getMonth()) % 7) * 0.01))
    bySystem[t] = clamp(s)
  })

  // 姓名スコア
  if (activeTypes.includes('name') && (nameSei || nameMei)) {
    const nd = calcNameDivination(nameSei ?? '', nameMei ?? '')
    if (nd) {
      const ns = clamp(Math.round(50 + (nd.jinkakuLuck === '吉' ? 22 : -8) + (nd.sokakuLuck === '吉' ? 12 : -5)))
      bySystem['name'] = ns
    }
  }

  const vals = Object.values(bySystem) as number[]
  const unified = vals.length ? Math.round(vals.reduce((a, b) => a + b, 0) / vals.length) : 0

  const moneyScore = clamp(activeOptions.includes('climate')
    ? Math.round(rng(seed + 'money', 45, 90) * cc)
    : rng(seed + 'money', 45, 90))
  const workScore = clamp(activeOptions.includes('climate')
    ? Math.round(rng(seed + 'work', 48, 92) * cc)
    : rng(seed + 'work', 48, 92))
  const loveScore = clamp(activeOptions.includes('climate')
    ? Math.round(rng(seed + 'love', 42, 88) * cc)
    : rng(seed + 'love', 42, 88))

  return { bySystem, unified, moneyScore, workScore, loveScore, climateCorrection: cc }
}

// ─── 天文データ ───────────────────────────────────────────────

export function calcAstroData(birthDate: string): AstroData {
  const [y, m, d] = birthDate.split('-').map(Number)
  const today = new Date()
  const currentAge = today.getFullYear() - y -
    (today.getMonth() + 1 < m || (today.getMonth() + 1 === m && today.getDate() < d) ? 1 : 0)
  return {
    tropicSign:    getTropicSign(m, d),
    vedicSign:     getVedicSign(m, d),
    kyusei:        getKyusei(y),
    shiju:         getShiju(y),
    lifePathNumber:getLifePath(birthDate),
    currentAge,
    birthYear: y, birthMonth: m, birthDay: d,
  }
}

// ─── 人生年表 ─────────────────────────────────────────────────

const TL_PHASES: Array<[number, string, string, string, number]> = [
  [0,  '誕生・幼少期',   '魂の目覚めと基盤形成',   '両親・家族・生まれ育った環境が人格の根幹を形成。この時期の体験が生涯の強みと思い込みの源泉になります。',           88],
  [10, '成長・探索期',   '自己発見と可能性の拡大',  '学校・友人・趣味を通じて自分の才能と限界を探る時代。好奇心を大切にすることが将来の方向性を決める鍵です。',       94],
  [20, '青年・飛躍期',   '社会への第一歩と方向確立', '進路・就職・恋愛など重要な選択が集中する時期。失敗を恐れず挑戦することが長期的な成長をもたらします。',         108],
  [30, '確立・深化期',   '真の価値観が試される時代', 'キャリア・家族・アイデンティティが本格的に形成される。「本当に大切なもの」を見極める内省が重要な時期です。',     102],
  [40, '充実・円熟期',   '本来の力が開花する黄金期', '蓄積した経験・人脈・スキルが結実し、最もパフォーマンスが高まる時代。リーダーシップを発揮しやすい時期です。',     97],
  [50, '転換・収穫期',   '新たな意味を見出す折り返し','人生の折り返し地点。これまでの蓄積を棚卸しし、残りの人生の真の目的を問い直す深い転換期です。',              106],
  [60, '知恵・解放期',   'しがらみを超えた自由の時代','社会的役割から解放され、真に自分らしい生き方を探求できる時期。培った知恵が最も輝くフェーズです。',           93],
  [70, '円成・伝達期',   '次世代へ受け渡す使命',     '人生で得た知恵・愛・洞察を次世代に伝える時期。自分の存在意義が最も深く問われる豊かな時代です。',              88],
  [80, '統合・完成期',   'すべての経験が統合される章','人生のすべての喜びも苦しみも大きな意味の中に統合されていく時期。穏やかな充足と深い感謝の境地へ。',            83],
  [90, '超越・永続期',   '時間を超えた視点から',     '時間の制約を超えた広大な視点から存在の本質に触れる最終章。',                                                    78],
]

export function buildTimeline(
  birthYear: number,
  unified: number,
  seed: string
): TimelinePhase[] {
  const nowYear = new Date().getFullYear()
  return TL_PHASES.map(([age, title, subtitle, detail, wave100]) => {
    const year  = birthYear + age
    const wave  = wave100 / 100
    let s = Math.round(unified * wave * (0.90 + hash(seed + age) % 20 * 0.01))
    s = clamp(s, 30, 98)
    const diff = year - nowYear
    return {
      age, year, title, subtitle, detail, score: s,
      isPast:    diff < -5,
      isCurrent: Math.abs(diff) <= 5,
      isFuture:  diff > 5,
      isPeak:    s >= 76,
      isLow:     s < 52,
    }
  })
}

// ─── 今・近未来の予測 ─────────────────────────────────────────

const GOODS = [
  '新しい縁・出会いが結ばれやすい','創造的プロジェクトが実を結ぶ時',
  '情報・学びの吸収が加速する時期','財運が上向き、投資・貯蓄の好機',
  '人脈が広がり新展開が生まれる','直感力が鋭く重要な判断に最適',
  '趣味や芸術で才能が開花しやすい','健康運好調、体力強化に好機',
]
const BADS = [
  '人間関係のトラブルに注意が必要','体力・エネルギーの消耗期',
  '衝動的な判断が後悔を招きやすい','予期せぬ出費・金銭的な注意',
  '孤立感・孤独を感じやすい周期','健康サインを見逃さないこと',
  '大きな変化・変動が訪れやすい','過去の問題が再浮上する可能性',
]
const PREPS = [
  '日頃からの信頼関係の積み重ね','感情の波を日記・メモで管理する',
  '財政バッファを今から確保する','心身メンテナンス（睡眠・食事）を整える',
  '信頼できる相談相手を持つ','新スキル・学びへの投資を始める',
  '不要な執着・物を手放す断捨離','柔軟思考と変化を歓迎する姿勢を持つ',
]

export function buildNowForecast(
  timeline: TimelinePhase[],
  currentAge: number,
  seed: string
): NowForecast {
  const pi       = Math.min(Math.floor(currentAge / 10), timeline.length - 1)
  const current  = timeline[pi]
  const next     = timeline[Math.min(pi + 1, timeline.length - 1)]
  const prevScore = pi > 0 ? timeline[pi - 1].score : current.score
  const diff      = current.score - prevScore
  const trend     = diff > 5 ? '📈 上昇傾向' : diff < -5 ? '📉 下降傾向' : '➡ 安定期'

  const pick = <T>(arr: T[], saltKey: string): T => arr[hash(seed + saltKey) % arr.length]

  return {
    currentPhase: current,
    nextPhase:    next,
    trend,
    goodEvents:   [pick(GOODS, 'g1'), pick(GOODS, 'g2')],
    badEvents:    [pick(BADS, 'b1'),  pick(BADS, 'b2')],
    preparations: [pick(PREPS,'p1'), pick(PREPS,'p2')],
  }
}

// ─── フルリザルト構築 ─────────────────────────────────────────

export function buildDivinationResult(input: DivinationInput): DivinationResult {
  const scores    = calcScores(input)
  const astro     = calcAstroData(input.birthDate)
  const nameResult = input.nameSei || input.nameMei
    ? calcNameDivination(input.nameSei ?? '', input.nameMei ?? '')
    : undefined
  const timeline  = buildTimeline(astro.birthYear, scores.unified,
    input.birthDate + (input.birthTime ?? '') + (input.birthCity ?? ''))
  const nowForecast = buildNowForecast(timeline, astro.currentAge,
    input.birthDate + (input.birthTime ?? '') + (input.birthCity ?? ''))

  return { input, scores, astro, nameResult, timeline, nowForecast, readings: {} }
}

// ─── AI プロンプト生成 ────────────────────────────────────────

export function buildBasePrompt(result: DivinationResult): string {
  const { astro, scores, input } = result
  const [, m] = input.birthDate.split('-').map(Number)
  const season = m >= 3 && m <= 5 ? '春' : m >= 6 && m <= 8 ? '夏' : m >= 9 && m <= 11 ? '秋' : '冬'
  const nameInfo = input.nameSei || input.nameMei
    ? `・姓名：${input.nameSei ?? ''}${input.nameMei ?? ''}`
    : ''
  const locationInfo = input.birthCity ? `・出生地：${input.birthCity}` : ''
  const timeInfo = input.birthTime ? `・出生時刻：${input.birthTime}` : ''

  return `あなたは統合占術師です。以下の命式をもとに日本語で深く洞察した鑑定文を書いてください。読者に寄り添う温かみがあり、具体的で実用的な内容にしてください。

【命式データ】
- 生年月日：${input.birthDate}（${season}生まれ・現在${astro.currentAge}歳）${timeInfo}${locationInfo}${nameInfo}
- 西洋星座（熱帯黄道）：${astro.tropicSign}
- インド占星術（恒星黄道・歳差補正後）：${astro.vedicSign}
- 九星気学 本命星：${astro.kyusei}
- 四柱推命 干支：${astro.shiju}
- 数秘ライフパス：${astro.lifePathNumber}
- 統合スコア：${scores.unified}/100
- 金運スコア：${scores.moneyScore} ／ 仕事運：${scores.workScore} ／ 恋愛運：${scores.loveScore}`
}

export function buildSectionPrompt(section: string, base: string, result: DivinationResult): string {
  const { astro, scores } = result
  const prompts: Record<string, string> = {
    general: base + `\n\n【指示】総合鑑定文を350字程度で。①熱帯星座と恒星星座（歳差補正後）のズレが示す「外から見える顔と魂の本質の違い」 ②複数占術が共通して指す人生の大テーマ ③この命式が持つ固有の強みと使命 ④今のあなたへの温かいメッセージ、を含めること。`,
    traits:  base + `\n\n【指示】「特性・才能・人間関係の傾向」を350字で。①向いている分野・職業を3〜4つ具体的に ②気をつけるべきクセ・陥りやすいパターン ③恋愛・友人・職場での人間関係の傾向 ④この命式ならではのユニークな才能・魅力、を書くこと。`,
    money:   base + `\n\n【指示】「金運・仕事運の詳細鑑定」を350字で。金運${scores.moneyScore}・仕事運${scores.workScore}を踏まえて①お金との関係性・稼ぎ方のパターン ②向いている職業・仕事スタイル ③金運を高める具体的行動3つ ④今後1〜3年の仕事・お金の流れ、を書くこと。`,
    love:    base + `\n\n【指示】「恋愛運・結婚運の詳細鑑定」を350字で。恋愛運${scores.loveScore}を踏まえて①この命式の恋愛パターン・好きなタイプ ②相性の良いタイプと悪いパターン ③恋愛で気をつけるべきクセ ④結婚運のタイミング ⑤恋愛運を高める具体的アドバイス3つ、を書くこと。`,
    currentFortune: base + `\n\n【指示】「今の運勢・これからの流れ・備え」を350字で。①現在（${astro.currentAge}歳）の運気の詳細な状態 ②1〜2年以内に訪れる好機2〜3つ ③1〜2年以内に来る試練・注意2〜3つ ④今すぐ取るべき準備行動3つ ⑤3〜5年後に向けての大局的なメッセージ、を書くこと。`,
    hardTimes: base + `\n\n【指示】「低迷期・試練の乗り越え方」を350字で。①この命式特有の低迷サイン・パターン ②九星気学と四柱推命それぞれの視点からの対処法 ③具体的な回復行動（食事・環境・人間関係・習慣から各1つ）④心が折れそうな時に読み返したい言葉・マインドセット ⑤低迷を飛躍の種に変える思考法、を書くこと。`,
  }
  return prompts[section] ?? base
}
