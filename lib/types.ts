export const WELCOME_BONUS = 1000
export const MIN_BET_AMOUNT = 10

export interface Profile {
  id: string
  display_name: string | null
  points: number
  created_at: string
  prediction_score?: number
  total_predictions?: number
  correct_predictions?: number
  accuracy_rate?: number
  rank_tier?: 'novice' | 'intermediate' | 'advanced' | 'expert' | 'super_forecaster'
}

export interface PredictionSnapshot {
  id: string
  market_id: string
  yes_probability: number
  total_volume: number
  unique_predictors: number
  created_at: string
}

export interface PredictionRecord {
  id: string
  user_id: string
  market_id: string
  predicted_outcome: boolean
  confidence: number
  points_wagered: number
  points_won: number
  is_correct: boolean | null
  brier_score: number | null
  created_at: string
  resolved_at: string | null
}

export interface MarketStatistics {
  id: string
  title: string
  category: string
  end_date: string
  resolved: boolean
  yes_pool: number
  no_pool: number
  total_volume: number
  yes_probability: number
  unique_predictors: number
  total_bets: number
}

export interface UserStatistics {
  id: string
  display_name: string | null
  points: number
  prediction_score: number
  total_predictions: number
  correct_predictions: number
  accuracy_rate: number
  rank_tier: string
  markets_participated: number
  total_wagered: number
  leaderboard_rank: number
}

export interface Market {
  id: string
  title: string
  description: string
  category: string
  end_date: string
  resolved: boolean
  outcome: boolean | null
  yes_pool: number
  no_pool: number
  created_by: string | null
  created_at: string
  updated_at: string
}

export interface Bet {
  id: string
  user_id: string
  market_id: string
  amount: number
  position: boolean // true = YES, false = NO
  created_at: string
}

export interface BetWithMarket extends Bet {
  markets: Market
}

export interface LeaderboardEntry {
  id: string
  display_name: string | null
  points: number
  rank: number
}

export type MarketCategory = 
  | '全部'
  | '环境政策'
  | '能源政策'
  | '劳动政策'
  | '金融政策'
  | '科技政策'
  | '税收政策'
  | '医疗政策'
  | '教育政策'

export const CATEGORIES: MarketCategory[] = [
  '全部',
  '环境政策',
  '能源政策',
  '劳动政策',
  '金融政策',
  '科技政策',
  '税收政策',
  '医疗政策',
  '教育政策',
]
