/**
 * 相性鑑定計算ロジック
 * 2人の命式を統合して相性スコアを算出
 */

import { getTropicSign, getVedicSign, getKyusei, getShiju, getLifePath } from './divination'

export interface CompatibilityResult {
  person1: PersonData
  person2: PersonData
  overall: number
  love: number
  work: number
  friendship: number
  longterm: number
  chemistry: number
  compatibility: CompatLevel
  strengths: string[]
  challenges: string[]
  advice: string
  bestScene: string
  warningSign: string
  elementRelation: string
}

export type CompatLevel = '運命の相手' | '最高の相性' | '良い相性' | '普通' | '要努力' | '難しい相性'

interface PersonData {
  name?: string
  birthDate: string
  tropicSign: string
  vedicSign: string
  kyusei: string
  shiju: string
  lifePath: number
  element: string
}

function hash(s: string): number {
  let h = 0
  for (let i = 0; i < s.length; i++) h = Math.imul(31, h) + s.charCodeAt(i) | 0
  return Math.abs(h)
}
function rng(seed: string, min: number, max: number): number {
  return min + (hash(seed) % (max - min + 1))
}

// 五行
const ELEMENTS: Record<string, string> = {
  '甲': '木', '乙': '木', '丙': '火', '丁': '火', '戊': '土',
  '己': '土', '庚': '金', '辛': '金', '壬': '水', '癸': '水',
}
const ELEMENT_RELATIONS: Record<string, Record<string, string>> = {
  '木': { '木': '比和（同調）', '火': '相生（木生火）', '土': '相克（木克土）', '金': '被克（金克木）', '水': '被生（水生木）' },
  '火': { '木': '被生（木生火）', '火': '比和（同調）', '土': '相生（火生土）', '金': '相克（火克金）', '水': '被克（水克火）' },
  '土': { '木': '被克（木克土）', '火': '被生（火生土）', '土': '比和（同調）', '金': '相生（土生金）', '水': '相克（土克水）' },
  '金': { '木': '相克（金克木）', '火': '被克（火克金）', '土': '被生（土生金）', '金': '比和（同調）', '水': '相生（金生水）' },
  '水': { '木': '相生（水生木）', '火': '相克（水克火）', '土': '被克（土克水）', '金': '被生（金生水）', '水': '比和（同調）' },
}

const STRENGTHS_LIST = [
  'お互いの強みを引き出し合える関係です',
  '価値観の核心部分が一致しており安心感があります',
  '一緒にいると自然体でいられます',
  '困難な時ほど二人の絆が強まります',
  '知的な刺激を与え合える相手です',
  '感情面での共鳴が深く心が通じやすいです',
  '互いの夢や目標を応援し合えます',
  '笑いのセンスが似ており一緒にいると楽しいです',
]
const CHALLENGES_LIST = [
  '価値観の違いが表面化することがあります',
  'コミュニケーションスタイルの違いに慣れが必要です',
  'お互いのペースの違いを尊重することが鍵です',
  '感情表現の方法が異なるため誤解が生じやすいです',
  '独立心の強さゆえに衝突することがあります',
  '優先順位の違いを話し合う機会を作ることが重要です',
]
const ADVICE_LIST = [
  '定期的に二人だけの時間を作り、心の距離を保ちましょう。',
  '相手の「当たり前」があなたと違うことを理解することで関係が深まります。',
  '小さな感謝を言葉にする習慣が、長期的な絆を育てます。',
  '意見の違いを「どちらが正しいか」ではなく「どちらも正しい」で捉えて。',
  '二人の共通の目標を持つことで関係に方向性が生まれます。',
]
const BEST_SCENE_LIST = [
  '旅行やアウトドアなど非日常の体験をともにする時',
  '静かなカフェでお互いの夢を語り合う時間',
  '困難な状況を二人で力を合わせて乗り越える時',
  '何も言わなくても分かり合える、無言でも心地よい瞬間',
  '互いの得意なことで相手をサポートする場面',
]
const WARNING_LIST = [
  'どちらかが無理をして合わせ続けると疲弊しやすいので注意。',
  '競争心が刺激されると関係がギクシャクする可能性があります。',
  '秘密を持ちすぎると信頼関係にひびが入りやすくなります。',
  '感情を溜め込まず、定期的に本音を話す場を作りましょう。',
]

export function calcCompatibility(
  date1: string, name1: string | undefined,
  date2: string, name2: string | undefined,
): CompatibilityResult {
  const [y1, m1, d1] = date1.split('-').map(Number)
  const [y2, m2, d2] = date2.split('-').map(Number)
  const seed = date1 + date2

  const shiju1 = getShiju(y1)
  const shiju2 = getShiju(y2)
  const elem1 = ELEMENTS[shiju1[0]] ?? '木'
  const elem2 = ELEMENTS[shiju2[0]] ?? '木'
  const elemRelation = ELEMENT_RELATIONS[elem1]?.[elem2] ?? '比和（同調）'

  // 五行相性ボーナス
  const elemBonus = elem1 === elem2 ? 5 :
    elemRelation.includes('相生') ? 8 :
    elemRelation.includes('被生') ? 6 :
    elemRelation.includes('相克') ? -5 :
    elemRelation.includes('被克') ? -3 : 0

  // ライフパス相性
  const lp1 = getLifePath(date1)
  const lp2 = getLifePath(date2)
  const lpBonus = lp1 === lp2 ? 6 : Math.abs(lp1 - lp2) <= 2 ? 4 : 0

  const base = rng(seed, 45, 90)
  const overall   = Math.min(99, Math.max(20, base + elemBonus + lpBonus))
  const love      = Math.min(99, Math.max(20, rng(seed + 'lv', 40, 92) + elemBonus))
  const work      = Math.min(99, Math.max(20, rng(seed + 'wk', 38, 90) + lpBonus))
  const friendship= Math.min(99, Math.max(20, rng(seed + 'fr', 45, 95)))
  const longterm  = Math.min(99, Math.max(20, rng(seed + 'lt', 40, 92) + elemBonus + lpBonus))
  const chemistry = Math.min(99, Math.max(20, rng(seed + 'ch', 35, 95)))

  const compat: CompatLevel =
    overall >= 90 ? '運命の相手' :
    overall >= 80 ? '最高の相性' :
    overall >= 68 ? '良い相性' :
    overall >= 55 ? '普通' :
    overall >= 42 ? '要努力' : '難しい相性'

  const pick = <T>(arr: T[], salt: string): T => arr[hash(seed + salt) % arr.length]

  return {
    person1: {
      name: name1, birthDate: date1,
      tropicSign: getTropicSign(m1, d1), vedicSign: getVedicSign(m1, d1),
      kyusei: getKyusei(y1), shiju: shiju1, lifePath: lp1, element: elem1,
    },
    person2: {
      name: name2, birthDate: date2,
      tropicSign: getTropicSign(m2, d2), vedicSign: getVedicSign(m2, d2),
      kyusei: getKyusei(y2), shiju: shiju2, lifePath: lp2, element: elem2,
    },
    overall, love, work, friendship, longterm, chemistry,
    compatibility: compat,
    strengths:  [pick(STRENGTHS_LIST, 's1'),  pick(STRENGTHS_LIST,  's2')],
    challenges: [pick(CHALLENGES_LIST, 'c1'), pick(CHALLENGES_LIST, 'c2')],
    advice:      pick(ADVICE_LIST,       'adv'),
    bestScene:   pick(BEST_SCENE_LIST,   'bs'),
    warningSign: pick(WARNING_LIST,      'ws'),
    elementRelation: elemRelation,
  }
}
