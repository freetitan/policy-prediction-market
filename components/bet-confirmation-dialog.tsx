'use client'

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { TrendingUp, TrendingDown, AlertTriangle } from 'lucide-react'

interface BetConfirmationDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  amount: number
  direction: boolean // true = 是, false = 否
  currentOdds: number
  userBalance: number
  marketTitle: string
  expectedReturn: number
  currentProbability: number
  onConfirm: () => void
  isLoading?: boolean
}

export function BetConfirmationDialog({
  open,
  onOpenChange,
  amount,
  direction,
  currentOdds,
  userBalance,
  marketTitle,
  expectedReturn,
  currentProbability,
  onConfirm,
  isLoading = false,
}: BetConfirmationDialogProps) {
  const percentageOfBalance = ((amount / userBalance) * 100).toFixed(1)
  const profit = expectedReturn - amount
  const returnRate = ((profit / amount) * 100).toFixed(1)

  // 风险等级评估
  const getRiskLevel = () => {
    const percentage = parseFloat(percentageOfBalance)
    if (percentage > 50) return { level: 'high', text: '高风险', color: 'text-destructive' }
    if (percentage > 20) return { level: 'medium', text: '中等风险', color: 'text-amber-600' }
    return { level: 'low', text: '低风险', color: 'text-chart-2' }
  }

  const risk = getRiskLevel()

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="max-w-md">
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            {direction ? (
              <TrendingUp className="h-5 w-5 text-chart-2" />
            ) : (
              <TrendingDown className="h-5 w-5 text-destructive" />
            )}
            确认投注
          </AlertDialogTitle>
          <AlertDialogDescription asChild>
            <div className="space-y-4">
              {/* 市场信息 */}
              <div className="rounded-lg bg-muted/50 p-3">
                <p className="text-sm font-medium text-foreground line-clamp-2">
                  {marketTitle}
                </p>
              </div>

              {/* 投注详情 */}
              <div className="space-y-3 rounded-lg bg-muted p-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">预测方向</span>
                  <span className="flex items-center gap-1.5 font-semibold">
                    {direction ? (
                      <>
                        <TrendingUp className="h-4 w-4 text-chart-2" />
                        <span className="text-chart-2">会发生</span>
                      </>
                    ) : (
                      <>
                        <TrendingDown className="h-4 w-4 text-destructive" />
                        <span className="text-destructive">不会发生</span>
                      </>
                    )}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">投注金额</span>
                  <span className="font-semibold text-foreground">
                    {amount.toLocaleString()} 积分
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">当前概率</span>
                  <span className="font-semibold text-foreground">
                    {currentProbability.toFixed(1)}%
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">预期赔率</span>
                  <span className="font-semibold text-foreground">
                    {currentOdds.toFixed(2)}x
                  </span>
                </div>

                <div className="border-t border-border pt-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-muted-foreground">
                      预期收益
                    </span>
                    <div className="text-right">
                      <div className="font-semibold text-chart-2">
                        {expectedReturn.toLocaleString()} 积分
                      </div>
                      <div className="text-xs text-muted-foreground">
                        +{profit.toLocaleString()} ({returnRate}%)
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* 风险提示 */}
              <div className={`rounded-lg border-2 p-3 ${
                risk.level === 'high' 
                  ? 'border-destructive/50 bg-destructive/5' 
                  : risk.level === 'medium'
                  ? 'border-amber-600/50 bg-amber-600/5'
                  : 'border-chart-2/50 bg-chart-2/5'
              }`}>
                <div className="flex items-start gap-2">
                  <AlertTriangle className={`h-5 w-5 shrink-0 ${risk.color}`} />
                  <div className="flex-1 space-y-1.5 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">风险评估</span>
                      <span className={`font-semibold ${risk.color}`}>
                        {risk.text}
                      </span>
                    </div>
                    <p className="text-muted-foreground">
                      此投注将占用你 <strong className="text-foreground">{percentageOfBalance}%</strong> 的积分余额
                    </p>
                  </div>
                </div>
              </div>

              {/* 重要提示 */}
              <div className="space-y-2 rounded-lg bg-secondary/50 p-3 text-xs text-muted-foreground">
                <p className="font-medium text-foreground">⚠️ 重要提示</p>
                <ul className="space-y-1 pl-4">
                  <li>• 投注后无法撤回或修改</li>
                  <li>• 市场结算前积分将被锁定</li>
                  <li>• 预测错误将损失全部投注金额</li>
                  <li>• 最终收益取决于结算时的赔率</li>
                </ul>
              </div>
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isLoading}>
            取消
          </AlertDialogCancel>
          <AlertDialogAction 
            onClick={onConfirm}
            disabled={isLoading}
            className="min-w-[100px]"
          >
            {isLoading ? '处理中...' : '确认投注'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
