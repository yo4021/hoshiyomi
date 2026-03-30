// ─── 占術データ型 ───────────────────────────────────────────

export type DivinationType = 'western' | 'vedic' | 'kyusei' | 'shiju' | 'numerology' | 'name' | 'tarot'
export type CorrectionOption = 'precession' | 'climate' | 'realtime'

export interface DivinationInput {
  birthDate: string       // YYYY-MM-DD
  birthTime?: string      // HH:MM (任意)
  birthCity?: string      // 出生地 (任意)
  nameSei?: string        // 姓（漢字）
  nameMei?: string        // 名（漢字）
  activeTypes: DivinationType[]
  activeOptions: CorrectionOption[]
}

export interface NameDivinationResult {
  tenkaku: number; tenkakuLuck: '吉' | '凶'; tenkakuMeaning: string
  jinkaku: number; jinkakuLuck: '吉' | '凶'; jinkakuMeaning: string
  chikaku: number; chikakuLuck: '吉' | '凶'; chikakuMeaning: string
  gaikaku: number; gaikakuLuck: '吉' | '凶'; gaikakuMeaning: string
  sokaku:  number; sokakuLuck:  '吉' | '凶'; sokakuMeaning:  string
}

export interface DivinationScores {
  bySystem: Partial<Record<DivinationType, number>>
  unified: number
  moneyScore: number
  workScore: number
  loveScore: number
  climateCorrection: number
}

export interface AstroData {
  tropicSign: string
  vedicSign: string
  kyusei: string
  shiju: string
  lifePathNumber: number
  currentAge: number
  birthYear: number
  birthMonth: number
  birthDay: number
}

export interface TimelinePhase {
  age: number
  year: number
  title: string
  subtitle: string
  detail: string
  score: number
  isPast: boolean
  isCurrent: boolean
  isFuture: boolean
  isPeak: boolean
  isLow: boolean
}

export interface NowForecast {
  currentPhase: TimelinePhase
  nextPhase: TimelinePhase
  trend: string
  goodEvents: string[]
  badEvents: string[]
  preparations: string[]
}

export interface DivinationResult {
  input: DivinationInput
  scores: DivinationScores
  astro: AstroData
  nameResult?: NameDivinationResult
  timeline: TimelinePhase[]
  nowForecast: NowForecast
  // AIが生成するテキスト（ストリーミング後に埋まる）
  readings: {
    general?: string
    traits?: string
    money?: string
    love?: string
    currentFortune?: string
    hardTimes?: string
  }
}

// ─── ユーザー・課金型 ────────────────────────────────────────

export type PlanType = 'free' | 'standard' | 'premium' | 'business'

export interface UserPlan {
  userId: string
  plan: PlanType
  stripeCustomerId?: string
  stripeSubscriptionId?: string
  currentPeriodEnd?: Date
  divinationsThisMonth: number
  maxDivinationsPerMonth: number
}

// ─── API レスポンス型 ─────────────────────────────────────────

export interface ApiError {
  error: string
  code?: string
}

export type ReadingSection =
  | 'general'
  | 'traits'
  | 'money'
  | 'love'
  | 'currentFortune'
  | 'hardTimes'

export interface StreamChunk {
  section: ReadingSection
  delta: string
  done: boolean
}
