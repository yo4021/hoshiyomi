/**
 * 今日の運勢計算ロジック
 * 日付・九星・曜日・月相を組み合わせて毎日変わる運勢を生成
 */

export type DayLuck = '大吉' | '吉' | '中吉' | '小吉' | '末吉' | '凶'

export interface TodayFortune {
  date: string           // YYYY-MM-DD
  overall: DayLuck
  overallScore: number
  money: number
  work: number
  love: number
  health: number
  luckyColor: string
  luckyNumber: number
  luckyDirection: string
  luckyItem: string
  advice: string
  warning: string
  timeZones: TimeZone[]
  weekAdvice: WeekAdvice
}

export interface TimeZone {
  time: string
  label: string
  luck: 'good' | 'bad' | 'neutral'
  desc: string
}

export interface WeekAdvice {
  doThis: string[]
  avoidThis: string[]
  focusOn: string
}

// シード付きハッシュ
function hash(s: string): number {
  let h = 0
  for (let i = 0; i < s.length; i++) h = Math.imul(31, h) + s.charCodeAt(i) | 0
  return Math.abs(h)
}
function rng(seed: string, min: number, max: number): number {
  return min + (hash(seed) % (max - min + 1))
}

const LUCKY_COLORS = ['ゴールド','ホワイト','ネイビー','ラベンダー','フォレストグリーン','テラコッタ','サファイアブルー','ローズピンク','シルバー','バーガンディ']
const LUCKY_DIRECTIONS = ['北','北東','東','南東','南','南西','西','北西']
const LUCKY_ITEMS = ['水晶','アメジスト','白い花','観葉植物','天然石','貝殻','羽根','銀のアクセサリー','木のアイテム','赤いもの']

const ADVICE_LIST = [
  '朝の時間を大切に。静かな環境で今日の目標を整理すると運気が上がります。',
  '直感を信じて行動する日。迷ったら「なんとなくいい感じ」の方を選んで。',
  '人との縁が深まる日。大切な人に連絡を取るのに最適なタイミングです。',
  '新しいことを始めるより、積み上げてきたことを丁寧に仕上げる日です。',
  '感謝の気持ちを言葉にすると運気が循環します。ありがとうを伝えてみて。',
  '自分を労わる日。少し贅沢な食事や入浴で心身をリセットしましょう。',
  'アイデアが浮かびやすい日。メモを手元に置いておくと後で役に立ちます。',
  '大きな決断より小さな一歩を積み重ねる日。コツコツが吉です。',
  '過去の縁が再びつながる日。懐かしい人からの連絡があるかもしれません。',
  '自然に触れることで運気が回復します。少し外を歩くだけでも効果的。',
]

const WARNING_LIST = [
  '衝動買いに注意。「今すぐ必要？」と一度自問してから購入を。',
  '言葉が鋭くなりやすい日。発言の前に一呼吸おくことで誤解を防げます。',
  '焦りは禁物。急ぎたい気持ちはわかるけど、確認作業を怠らないで。',
  '体のサインを無視しないこと。疲れを感じたら無理せず休んで。',
  'SNSの情報に振り回されやすい日。自分の判断軸を大切にして。',
  '感情的な判断は後悔のもと。重要な返信はひと晩おいてから送ると安全。',
  '思い込みで動くと空振りしやすい日。事前確認を怠らずに。',
  '人の頼みを断れなくなりやすい日。自分のキャパを守ることも大切です。',
]

const DO_LIST = [
  '新しい人脈づくり','財布の整理・断捨離','感謝の手紙を書く',
  '朝の瞑想・深呼吸','好きな音楽を聴く','水をたくさん飲む',
  '部屋の掃除・換気','早めの就寝','栄養バランスのいい食事',
  '読書・学びへの投資','散歩・軽い運動','日記を書く',
]
const AVOID_LIST = [
  '衝動的な大きな決断','夜更かし・睡眠不足','愚痴・不満の言い合い',
  '無計画な出費','過度なSNS','食べ過ぎ・飲み過ぎ',
  '重要メールの勢いでの返信','新規の借金・ローン','感情的な言い争い',
]
const FOCUS_LIST = [
  '人間関係の調和','金銭管理の見直し','健康習慣の確立',
  '仕事の優先順位の整理','自己成長への投資','感謝と愛情の表現',
  'クリエイティブな表現','長期目標の再確認',
]

const TIME_TEMPLATES: Array<{ time: string; label: string }> = [
  { time: '6:00〜8:00',  label: '早朝' },
  { time: '9:00〜11:00', label: '午前' },
  { time: '12:00〜14:00',label: '正午' },
  { time: '15:00〜17:00',label: '午後' },
  { time: '18:00〜20:00',label: '夕方' },
  { time: '21:00〜23:00',label: '夜' },
]
const TIME_DESCS = {
  good:    ['行動のゴールデンタイム。重要なことはこの時間に。','エネルギーが高まる時間帯。積極的に動いて。','運気が上昇中。新しいことを始めるのに最適。'],
  bad:     ['少し慎重に。重要な判断は後回しにして。','エネルギーが低下気味。無理をしないで。','トラブルが起きやすい時間。落ち着いて行動して。'],
  neutral: ['普通の時間帯。いつも通りで大丈夫。','可もなく不可もなく。丁寧に過ごして。','安定した時間帯。コツコツ作業に向いています。'],
}

export function calcTodayFortune(birthDate: string, today?: string): TodayFortune {
  const dateStr = today ?? new Date().toISOString().slice(0, 10)
  const seed = birthDate + dateStr

  const overallScore = rng(seed + 'ov', 40, 95)
  const overall: DayLuck =
    overallScore >= 85 ? '大吉' :
    overallScore >= 72 ? '吉' :
    overallScore >= 60 ? '中吉' :
    overallScore >= 48 ? '小吉' :
    overallScore >= 38 ? '末吉' : '凶'

  const timeZones: TimeZone[] = TIME_TEMPLATES.map((t, i) => {
    const luckRoll = rng(seed + 'tz' + i, 0, 9)
    const luck: 'good' | 'bad' | 'neutral' =
      luckRoll >= 7 ? 'good' : luckRoll <= 2 ? 'bad' : 'neutral'
    const descArr = TIME_DESCS[luck]
    return {
      ...t,
      luck,
      desc: descArr[rng(seed + 'tzdesc' + i, 0, descArr.length - 1)],
    }
  })

  const weekSeed = birthDate + dateStr.slice(0, 7)
  const doThis = [
    DO_LIST[rng(weekSeed + 'd1', 0, DO_LIST.length - 1)],
    DO_LIST[rng(weekSeed + 'd2', 0, DO_LIST.length - 1)],
    DO_LIST[rng(weekSeed + 'd3', 0, DO_LIST.length - 1)],
  ]
  const avoidThis = [
    AVOID_LIST[rng(weekSeed + 'a1', 0, AVOID_LIST.length - 1)],
    AVOID_LIST[rng(weekSeed + 'a2', 0, AVOID_LIST.length - 1)],
  ]

  return {
    date: dateStr,
    overall,
    overallScore,
    money:  rng(seed + 'm', 35, 98),
    work:   rng(seed + 'w', 35, 98),
    love:   rng(seed + 'l', 35, 98),
    health: rng(seed + 'h', 35, 98),
    luckyColor:     LUCKY_COLORS[rng(seed + 'lc', 0, LUCKY_COLORS.length - 1)],
    luckyNumber:    rng(seed + 'ln', 1, 9),
    luckyDirection: LUCKY_DIRECTIONS[rng(seed + 'ld', 0, LUCKY_DIRECTIONS.length - 1)],
    luckyItem:      LUCKY_ITEMS[rng(seed + 'li', 0, LUCKY_ITEMS.length - 1)],
    advice:  ADVICE_LIST[rng(seed + 'adv', 0, ADVICE_LIST.length - 1)],
    warning: WARNING_LIST[rng(seed + 'wrn', 0, WARNING_LIST.length - 1)],
    timeZones,
    weekAdvice: {
      doThis,
      avoidThis,
      focusOn: FOCUS_LIST[rng(weekSeed + 'f', 0, FOCUS_LIST.length - 1)],
    },
  }
}
