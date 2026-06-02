'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Progress } from '@/components/ui/progress'
import { createClient } from '@/lib/supabase/client'
import { 
  CheckCircle2, 
  XCircle, 
  Calendar, 
  TrendingUp, 
  TrendingDown,
  AlertCircle,
  ExternalLink
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface VerifyMarketCardProps {
  market: any
  verifierId: string
}

export function VerifyMarketCard({ market, verifierId }: VerifyMarketCardProps) {
  const [vote, setVote] = useState<boolean | null>(null)
  const [evidence, setEvidence] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [hasVoted, setHasVoted] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const totalPool = market.yes_pool + market.no_pool
  const progress = (market.current_votes / 3) * 100

  const handleSubmit = async () => {
    if (vote === null) {
      setError('请选择验证结果')
      return
    }

    if (!evidence.trim()) {
      setError('请提供证据或理由')
      return
    }

    setIsSubmitting(true)
    setError(null)

    try {
      const { error: insertError } = await supabase
        .from('verification_votes')
        .insert({
          market_id: market.id,
          verifier_id: verifierId,
          vote: vote,
          evidence: evidence.trim(),
          confidence: 3
        })

      if (insertError) {
        if (insertError.code === '23505') {
          throw new Error('您已经对此市场投过票了')
        }
        throw insertError
      }

      setHasVoted(true)
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : '提交失败，请重试')
    } finally {
      setIsSubmitting(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  if (hasVoted) {
    return (
      <Card className="border-chart-2/50 bg-chart-2/5">
        <CardContent className="flex items-center gap-3 py-6">
          <CheckCircle2 className="h-6 w-6 text-chart-2" />
          <div>
            <p className="font-medium text-chart-2">验证已提交</p>
            <p className="text-sm text-muted-foreground">
              您的投票已记录，等待其他验证者确认
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <div className="mb-2 flex items-center gap-2">
              <Badge variant="secondary">{market.category}</Badge>
              <Badge variant="outline" className="gap-1">
                <Calendar className="h-3 w-3" />
                截止: {formatDate(market.end_date)}
              </Badge>
            </div>
            <h3 className="text-lg font-semibold text-foreground leading-snug">
              {market.title}
            </h3>
          </div>
        </div>

        {/* Voting Progress */}
        <div className="mt-4 space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">验证进度</span>
            <span className="font-medium">
              {market.current_votes} / 3 票
              {market.yes_votes > 0 && ` (${market.yes_votes} 是, ${market.no_votes} 否)`}
            </span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* Market Stats */}
        <div className="mt-3 flex items-center gap-4 text-sm">
          <div className="flex items-center gap-1.5">
            <TrendingUp className="h-4 w-4 text-chart-2" />
            <span className="text-muted-foreground">是:</span>
            <span className="font-medium">{market.yes_pool.toLocaleString()}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <TrendingDown className="h-4 w-4 text-destructive" />
            <span className="text-muted-foreground">否:</span>
            <span className="font-medium">{market.no_pool.toLocaleString()}</span>
          </div>
          <div className="flex items-center gap-1.5 ml-auto">
            <span className="text-muted-foreground">总池:</span>
            <span className="font-semibold">{totalPool.toLocaleString()} 积分</span>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4 border-t border-border pt-4">
        {/* Vote Selection */}
        <div className="space-y-2">
          <Label>验证结果</Label>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setVote(true)}
              className={cn(
                'flex flex-col items-center gap-2 rounded-lg border-2 p-4 transition-all',
                vote === true
                  ? 'border-chart-2 bg-chart-2/10 text-chart-2'
                  : 'border-border hover:border-chart-2/50 hover:bg-chart-2/5'
              )}
            >
              <CheckCircle2 className="h-6 w-6" />
              <span className="font-semibold">是</span>
              <span className="text-xs text-muted-foreground">事件已发生</span>
            </button>
            <button
              type="button"
              onClick={() => setVote(false)}
              className={cn(
                'flex flex-col items-center gap-2 rounded-lg border-2 p-4 transition-all',
                vote === false
                  ? 'border-destructive bg-destructive/10 text-destructive'
                  : 'border-border hover:border-destructive/50 hover:bg-destructive/5'
              )}
            >
              <XCircle className="h-6 w-6" />
              <span className="font-semibold">否</span>
              <span className="text-xs text-muted-foreground">事件未发生</span>
            </button>
          </div>
        </div>

        {/* Evidence */}
        <div className="space-y-2">
          <Label htmlFor={`evidence-${market.id}`}>
            证据或理由 <span className="text-destructive">*</span>
          </Label>
          <Textarea
            id={`evidence-${market.id}`}
            placeholder="请提供可靠的证据链接（如官方公告、新闻报道）或详细说明..."
            value={evidence}
            onChange={(e) => setEvidence(e.target.value)}
            rows={3}
            className="resize-none"
          />
          <p className="text-xs text-muted-foreground flex items-center gap-1">
            <ExternalLink className="h-3 w-3" />
            建议提供官方来源或权威媒体的链接
          </p>
        </div>

        {error && (
          <div className="flex items-center gap-2 rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
            <AlertCircle className="h-4 w-4 shrink-0" />
            {error}
          </div>
        )}

        {/* Submit Button */}
        <Button
          onClick={handleSubmit}
          disabled={vote === null || !evidence.trim() || isSubmitting}
          className="w-full"
        >
          {isSubmitting ? '提交中...' : '提交验证'}
        </Button>

        <p className="text-xs text-center text-muted-foreground">
          正确验证 +10 声誉 · 错误验证 -5 声誉
        </p>
      </CardContent>
    </Card>
  )
}
