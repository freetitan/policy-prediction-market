'use client'

import Link from 'next/link'
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import type { Market } from '@/lib/types'
import { Calendar, TrendingUp, TrendingDown, CheckCircle2 } from 'lucide-react'
import { cn } from '@/lib/utils'

interface MarketCardProps {
  market: Market
}

export function MarketCard({ market }: MarketCardProps) {
  const totalPool = market.yes_pool + market.no_pool
  const yesPercentage = totalPool > 0 ? (market.yes_pool / totalPool) * 100 : 50
  const noPercentage = totalPool > 0 ? (market.no_pool / totalPool) * 100 : 50
  
  const isExpired = new Date(market.end_date) < new Date()
  const daysLeft = Math.ceil((new Date(market.end_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
  
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  return (
    <Link href={`/market/${market.id}`}>
      <Card className="group h-full transition-all duration-200 hover:border-primary/50 hover:shadow-lg">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-2">
            <Badge 
              variant="secondary" 
              className="shrink-0 text-xs font-medium"
            >
              {market.category}
            </Badge>
            {market.resolved ? (
              <Badge className="shrink-0 bg-chart-2 text-chart-2-foreground">
                <CheckCircle2 className="mr-1 h-3 w-3" />
                已结算
              </Badge>
            ) : isExpired ? (
              <Badge variant="outline" className="shrink-0 border-destructive/50 text-destructive">
                已截止
              </Badge>
            ) : daysLeft <= 7 ? (
              <Badge variant="outline" className="shrink-0 border-chart-3/50 text-chart-3">
                {daysLeft}天后截止
              </Badge>
            ) : null}
          </div>
          <h3 className="line-clamp-2 text-base font-semibold leading-snug text-foreground group-hover:text-primary">
            {market.title}
          </h3>
        </CardHeader>
        
        <CardContent className="pb-3">
          <p className="mb-4 line-clamp-2 text-sm text-muted-foreground">
            {market.description}
          </p>
          
          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-1.5">
                <TrendingUp className="h-4 w-4 text-chart-2" />
                <span className="font-medium text-chart-2">是</span>
              </div>
              <span className="font-semibold">{yesPercentage.toFixed(0)}%</span>
            </div>
            <Progress 
              value={yesPercentage} 
              className="h-2 bg-destructive/20"
            />
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-1.5">
                <TrendingDown className="h-4 w-4 text-destructive" />
                <span className="font-medium text-destructive">否</span>
              </div>
              <span className="font-semibold">{noPercentage.toFixed(0)}%</span>
            </div>
          </div>
        </CardContent>
        
        <CardFooter className="flex items-center justify-between border-t border-border pt-3 text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <Calendar className="h-3.5 w-3.5" />
            <span>截止: {formatDate(market.end_date)}</span>
          </div>
          <div className={cn(
            "rounded-full px-2 py-0.5 font-medium",
            totalPool > 10000 
              ? "bg-chart-2/10 text-chart-2" 
              : "bg-secondary text-secondary-foreground"
          )}>
            {totalPool.toLocaleString()} 积分
          </div>
        </CardFooter>
      </Card>
    </Link>
  )
}
