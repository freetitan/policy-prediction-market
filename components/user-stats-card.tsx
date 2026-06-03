'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { ReputationBadge } from '@/components/ui/reputation-badge'
import { Target, TrendingUp, Award, BarChart3 } from 'lucide-react'
import type { Profile } from '@/lib/types'

interface UserStatsCardProps {
  profile: Profile
}

export function UserStatsCard({ profile }: UserStatsCardProps) {
  const predictionScore = profile.prediction_score || 0
  const totalPredictions = profile.total_predictions || 0
  const correctPredictions = profile.correct_predictions || 0
  const accuracyRate = profile.accuracy_rate || 0
  const rankTier = profile.rank_tier || 'novice'

  // 计算下一等级所需的分数
  const getNextTierTarget = () => {
    switch (rankTier) {
      case 'novice': return { score: 45, predictions: 10, tier: '进阶' }
      case 'intermediate': return { score: 60, predictions: 20, tier: '高级' }
      case 'advanced': return { score: 75, predictions: 50, tier: '专家' }
      case 'expert': return { score: 90, predictions: 100, tier: '超级预测者' }
      case 'super_forecaster': return null
      default: return { score: 45, predictions: 10, tier: '进阶' }
    }
  }

  const nextTier = getNextTierTarget()

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>预测统计</span>
          <ReputationBadge
            rankTier={rankTier}
            predictionScore={predictionScore}
            totalPredictions={totalPredictions}
            accuracyRate={accuracyRate}
            showDetails
          />
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* 核心指标 */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Target className="h-4 w-4" />
              <span>预测分数</span>
            </div>
            <div className="text-2xl font-bold text-foreground">
              {predictionScore.toFixed(1)}
            </div>
            <div className="text-xs text-muted-foreground">满分 100</div>
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <TrendingUp className="h-4 w-4" />
              <span>准确率</span>
            </div>
            <div className="text-2xl font-bold text-foreground">
              {(accuracyRate * 100).toFixed(1)}%
            </div>
            <div className="text-xs text-muted-foreground">
              {correctPredictions}/{totalPredictions} 正确
            </div>
          </div>
        </div>

        {/* 详细统计 */}
        <div className="space-y-3 border-t border-border pt-4">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2 text-muted-foreground">
              <BarChart3 className="h-4 w-4" />
              <span>总预测数</span>
            </div>
            <span className="font-medium text-foreground">{totalPredictions}</span>
          </div>

          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Award className="h-4 w-4" />
              <span>正确预测</span>
            </div>
            <span className="font-medium text-success">{correctPredictions}</span>
          </div>
        </div>

        {/* 升级进度 */}
        {nextTier && (
          <div className="space-y-2 border-t border-border pt-4">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">升级至 {nextTier.tier}</span>
              <span className="text-xs text-muted-foreground">
                {predictionScore.toFixed(0)}/{nextTier.score}
              </span>
            </div>
            <Progress 
              value={(predictionScore / nextTier.score) * 100} 
              className="h-2"
            />
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>
                还需 {Math.max(0, nextTier.predictions - totalPredictions)} 次预测
              </span>
              <span>
                还需 {Math.max(0, nextTier.score - predictionScore).toFixed(0)} 分
              </span>
            </div>
          </div>
        )}

        {/* 超级预测者特殊显示 */}
        {rankTier === 'super_forecaster' && (
          <div className="rounded-lg border border-amber-500/20 bg-gradient-to-r from-amber-500/10 to-pink-500/10 p-3 text-center">
            <div className="text-sm font-medium text-foreground">
              🎉 你已达到最高等级！
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              继续保持卓越的预测能力
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
