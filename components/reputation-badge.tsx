import { Badge } from '@/components/ui/badge'
import { Trophy, Award, Star, Zap, Sparkles } from 'lucide-react'
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from '@/components/ui/tooltip'

interface ReputationBadgeProps {
  rankTier: 'novice' | 'intermediate' | 'advanced' | 'expert' | 'super_forecaster'
  predictionScore?: number
  totalPredictions?: number
  accuracyRate?: number
  showDetails?: boolean
  size?: 'sm' | 'md' | 'lg'
}

const tierConfig = {
  novice: {
    label: '新手',
    icon: Star,
    color: 'bg-muted text-muted-foreground',
    description: '开始你的预测之旅'
  },
  intermediate: {
    label: '进阶',
    icon: Zap,
    color: 'bg-blue-500/10 text-blue-600 dark:text-blue-400',
    description: '已有一定预测经验'
  },
  advanced: {
    label: '高级',
    icon: Award,
    color: 'bg-purple-500/10 text-purple-600 dark:text-purple-400',
    description: '预测能力出众'
  },
  expert: {
    label: '专家',
    icon: Trophy,
    color: 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
    description: '顶尖预测高手'
  },
  super_forecaster: {
    label: '超级预测者',
    icon: Sparkles,
    color: 'bg-gradient-to-r from-amber-500 to-pink-500 text-white',
    description: '预测界的传奇'
  }
}

export function ReputationBadge({
  rankTier,
  predictionScore,
  totalPredictions,
  accuracyRate,
  showDetails = false,
  size = 'md'
}: ReputationBadgeProps) {
  const config = tierConfig[rankTier]
  const Icon = config.icon

  const sizeClasses = {
    sm: 'text-xs h-5',
    md: 'text-sm h-6',
    lg: 'text-base h-7'
  }

  const iconSizes = {
    sm: 'h-3 w-3',
    md: 'h-3.5 w-3.5',
    lg: 'h-4 w-4'
  }

  const badge = (
    <Badge 
      className={`${config.color} ${sizeClasses[size]} gap-1 font-medium`}
      variant="secondary"
    >
      <Icon className={iconSizes[size]} />
      {config.label}
    </Badge>
  )

  if (!showDetails) {
    return badge
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          {badge}
        </TooltipTrigger>
        <TooltipContent side="bottom" className="max-w-xs">
          <div className="space-y-2">
            <div className="font-semibold text-foreground">{config.label}</div>
            <div className="text-xs text-muted-foreground">{config.description}</div>
            {predictionScore !== undefined && (
              <div className="space-y-1 border-t border-border pt-2">
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">预测分数</span>
                  <span className="font-medium text-foreground">{predictionScore.toFixed(1)}</span>
                </div>
                {totalPredictions !== undefined && (
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">总预测数</span>
                    <span className="font-medium text-foreground">{totalPredictions}</span>
                  </div>
                )}
                {accuracyRate !== undefined && (
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">准确率</span>
                    <span className="font-medium text-foreground">
                      {(accuracyRate * 100).toFixed(1)}%
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}

// 小尺寸简化版本，只显示图标
export function ReputationIcon({ rankTier, className }: { rankTier: string; className?: string }) {
  const config = tierConfig[rankTier as keyof typeof tierConfig] || tierConfig.novice
  const Icon = config.icon
  
  return (
    <div className={`inline-flex items-center justify-center ${className}`}>
      <Icon className="h-4 w-4" />
    </div>
  )
}
