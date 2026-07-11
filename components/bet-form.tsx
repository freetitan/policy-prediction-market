'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { createClient } from '@/lib/supabase/client'
import { MIN_BET_AMOUNT } from '@/lib/types'
import type { Market, Profile } from '@/lib/types'
import { TrendingUp, TrendingDown, AlertCircle, Coins } from 'lucide-react'
import { cn } from '@/lib/utils'
import { BetConfirmationDialog } from '@/components/bet-confirmation-dialog'
import { toast } from 'sonner'

interface BetFormProps {
  market: Market
  userProfile: Profile | null
  onBetPlaced?: () => void
}

export function BetForm({ market, userProfile, onBetPlaced }: BetFormProps) {
  const [position, setPosition] = useState<boolean | null>(null)
  const [amount, setAmount] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showConfirmDialog, setShowConfirmDialog] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const isExpired = new Date(market.end_date) < new Date()
  const canBet = userProfile && !market.resolved && !isExpired

  const totalPool = market.yes_pool + market.no_pool
  const yesPercentage = totalPool > 0 ? (market.yes_pool / totalPool) * 100 : 50

  const calculatePotentialReturn = () => {
    if (!amount || position === null) return 0
    const betAmount = parseInt(amount)
    if (isNaN(betAmount) || betAmount <= 0) return 0

    const currentPool = position ? market.yes_pool : market.no_pool
    const oppositePool = position ? market.no_pool : market.yes_pool
    const newPool = currentPool + betAmount
    if (newPool === 0) return betAmount
    const share = betAmount / newPool
    const potentialWin = oppositePool * share

    return Math.floor(betAmount + potentialWin)
  }

  const calculateOdds = () => {
    const betAmount = parseInt(amount)
    if (isNaN(betAmount) || betAmount <= 0) return 1

    const currentPool = position ? market.yes_pool : market.no_pool
    const oppositePool = position ? market.no_pool : market.yes_pool
    const totalPool = currentPool + oppositePool + betAmount
    
    if (totalPool === 0) return 1
    return totalPool / (currentPool + betAmount)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!userProfile || position === null) return

    const betAmount = parseInt(amount)
    if (isNaN(betAmount) || betAmount <= 0) {
      setError('请输入有效的积分数量')
      return
    }

    if (betAmount > userProfile.points) {
      setError('积分不足')
      return
    }

    if (betAmount < MIN_BET_AMOUNT) {
      setError(`最少投注${MIN_BET_AMOUNT}积分`)
      return
    }

    setError(null)
    setShowConfirmDialog(true)
  }

  const handleConfirmBet = async () => {
    if (!userProfile || position === null) return

    const betAmount = parseInt(amount)
    setIsLoading(true)

    try {
      const { error: rpcError } = await supabase.rpc('place_bet', {
        p_user_id: userProfile.id,
        p_market_id: market.id,
        p_amount: betAmount,
        p_position: position,
      })

      if (rpcError) throw rpcError

      toast.success('投注成功！', {
        description: `已投注 ${betAmount} 积分到"${position ? '是' : '否'}"`,
      })

      setAmount('')
      setPosition(null)
      setShowConfirmDialog(false)
      onBetPlaced?.()
      router.refresh()
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '投注失败，请重试'
      setError(errorMessage)
      toast.error('投注失败', { description: errorMessage })
      setShowConfirmDialog(false)
    } finally {
      setIsLoading(false)
    }
  }

  if (!userProfile) {
    return (
      <Card className="border-dashed">
        <CardContent className="flex flex-col items-center gap-4 py-8">
          <AlertCircle className="h-10 w-10 text-muted-foreground" />
          <p className="text-center text-muted-foreground">
            请先登录后参与预测
          </p>
          <Button asChild>
            <a href="/auth/login">登录</a>
          </Button>
        </CardContent>
      </Card>
    )
  }

  if (market.resolved) {
    return (
      <Card className="border-chart-2/50 bg-chart-2/5">
        <CardContent className="py-6 text-center">
          <p className="font-medium text-chart-2">
            该市场已结算，结果为：{market.outcome ? '是' : '否'}
          </p>
        </CardContent>
      </Card>
    )
  }

  if (isExpired) {
    return (
      <Card className="border-destructive/50 bg-destructive/5">
        <CardContent className="py-6 text-center">
          <p className="font-medium text-destructive">该市场已截止，等待结算</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">参与预测</CardTitle>
        <CardDescription className="flex items-center gap-2">
          <Coins className="h-4 w-4" />
          可用积分: {userProfile.points.toLocaleString()}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-3">
            <Label>选择预测方向</Label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setPosition(true)}
                className={cn(
                  'flex flex-col items-center gap-2 rounded-lg border-2 p-4 transition-all',
                  position === true
                    ? 'border-chart-2 bg-chart-2/10 text-chart-2'
                    : 'border-border hover:border-chart-2/50 hover:bg-chart-2/5'
                )}
              >
                <TrendingUp className="h-6 w-6" />
                <span className="font-semibold">是</span>
                <span className="text-xs text-muted-foreground">
                  {yesPercentage.toFixed(0)}% 概率
                </span>
              </button>
              <button
                type="button"
                onClick={() => setPosition(false)}
                className={cn(
                  'flex flex-col items-center gap-2 rounded-lg border-2 p-4 transition-all',
                  position === false
                    ? 'border-destructive bg-destructive/10 text-destructive'
                    : 'border-border hover:border-destructive/50 hover:bg-destructive/5'
                )}
              >
                <TrendingDown className="h-6 w-6" />
                <span className="font-semibold">否</span>
                <span className="text-xs text-muted-foreground">
                  {(100 - yesPercentage).toFixed(0)}% 概率
                </span>
              </button>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="amount">投注积分</Label>
            <Input
              id="amount"
              type="number"
              min="10"
              max={userProfile.points}
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder={`输入积分数量（最少${MIN_BET_AMOUNT}）`}
            />
            <div className="flex gap-2">
              {[50, 100, 200, 500].map((preset) => (
                <Button
                  key={preset}
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setAmount(String(Math.min(preset, userProfile.points)))}
                  disabled={userProfile.points < preset}
                  className="flex-1 text-xs"
                >
                  {preset}
                </Button>
              ))}
            </div>
          </div>

          {amount && position !== null && (
            <div className="rounded-lg bg-secondary p-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">预计回报</span>
                <span className="font-semibold text-chart-2">
                  {calculatePotentialReturn().toFixed(0)} 积分
                </span>
              </div>
            </div>
          )}

          {error && (
            <div className="flex items-center gap-2 rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
              <AlertCircle className="h-4 w-4 shrink-0" />
              {error}
            </div>
          )}

          <Button
            type="submit"
            className="w-full"
            disabled={!canBet || position === null || !amount || isLoading}
          >
            {isLoading ? '处理中...' : '确认投注'}
          </Button>
        </form>

        {/* 确认对话框 */}
        {userProfile && position !== null && amount && (
          <BetConfirmationDialog
            open={showConfirmDialog}
            onOpenChange={setShowConfirmDialog}
            amount={parseInt(amount)}
            direction={position}
            currentOdds={calculateOdds()}
            userBalance={userProfile.points}
            marketTitle={market.title}
            expectedReturn={calculatePotentialReturn()}
            currentProbability={position ? yesPercentage : 100 - yesPercentage}
            onConfirm={handleConfirmBet}
            isLoading={isLoading}
          />
        )}
      </CardContent>
    </Card>
  )
}
