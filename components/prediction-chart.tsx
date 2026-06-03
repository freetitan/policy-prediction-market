'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts'
import { TrendingUp, TrendingDown, Minus, Users, Activity } from 'lucide-react'
import type { PredictionSnapshot } from '@/lib/types'
import { format } from 'date-fns'
import { zhCN } from 'date-fns/locale'

interface PredictionChartProps {
  marketId: string
  currentProbability: number
  totalVolume: number
  uniquePredictors: number
}

export function PredictionChart({ marketId, currentProbability, totalVolume, uniquePredictors }: PredictionChartProps) {
  const [snapshots, setSnapshots] = useState<PredictionSnapshot[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    const fetchSnapshots = async () => {
      const { data } = await supabase
        .from('prediction_snapshots')
        .select('*')
        .eq('market_id', marketId)
        .order('created_at', { ascending: true })
        .limit(100)

      if (data) {
        setSnapshots(data)
      }
      setLoading(false)
    }

    fetchSnapshots()

    // 订阅实时更新
    const channel = supabase
      .channel(`snapshots:${marketId}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'prediction_snapshots',
        filter: `market_id=eq.${marketId}`
      }, (payload) => {
        setSnapshots(prev => [...prev, payload.new as PredictionSnapshot])
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [marketId, supabase])

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>预测趋势</CardTitle>
          <CardDescription>加载中...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-64 animate-pulse bg-muted rounded-md" />
        </CardContent>
      </Card>
    )
  }

  const chartData = snapshots.map(s => ({
    time: new Date(s.created_at).getTime(),
    probability: Number(s.yes_probability) * 100,
    volume: s.total_volume,
    predictors: s.unique_predictors
  }))

  // 计算趋势
  const getTrend = () => {
    if (snapshots.length < 2) return 'neutral'
    const recent = Number(snapshots[snapshots.length - 1].yes_probability)
    const previous = Number(snapshots[Math.max(0, snapshots.length - 10)].yes_probability)
    const diff = recent - previous
    if (diff > 0.02) return 'up'
    if (diff < -0.02) return 'down'
    return 'neutral'
  }

  const trend = getTrend()
  const probabilityPercent = (currentProbability * 100).toFixed(1)

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>社区预测</CardTitle>
            <CardDescription>基于 {uniquePredictors} 位预测者的观点</CardDescription>
          </div>
          <div className="flex items-center gap-2">
            {trend === 'up' && <TrendingUp className="h-5 w-5 text-success" />}
            {trend === 'down' && <TrendingDown className="h-5 w-5 text-destructive" />}
            {trend === 'neutral' && <Minus className="h-5 w-5 text-muted-foreground" />}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* 当前概率显示 */}
        <div className="flex items-center justify-between rounded-lg border border-border bg-secondary/50 p-4">
          <div>
            <div className="text-sm text-muted-foreground">发生概率</div>
            <div className="text-3xl font-bold text-foreground">{probabilityPercent}%</div>
          </div>
          <div className="text-right">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Activity className="h-4 w-4" />
              <span>总投注: {totalVolume.toLocaleString()}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
              <Users className="h-4 w-4" />
              <span>{uniquePredictors} 位预测者</span>
            </div>
          </div>
        </div>

        {/* 历史趋势图表 */}
        {chartData.length > 0 ? (
          <div className="space-y-2">
            <div className="text-sm font-medium text-foreground">历史趋势</div>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis
                  dataKey="time"
                  type="number"
                  domain={['dataMin', 'dataMax']}
                  tickFormatter={(time) => format(new Date(time), 'MM/dd', { locale: zhCN })}
                  className="text-xs text-muted-foreground"
                />
                <YAxis
                  domain={[0, 100]}
                  tickFormatter={(value) => `${value}%`}
                  className="text-xs text-muted-foreground"
                />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload
                      return (
                        <div className="rounded-lg border border-border bg-card p-3 shadow-lg">
                          <div className="text-xs text-muted-foreground">
                            {format(new Date(data.time), 'yyyy-MM-dd HH:mm', { locale: zhCN })}
                          </div>
                          <div className="mt-1 text-sm font-semibold text-foreground">
                            概率: {data.probability.toFixed(1)}%
                          </div>
                          <div className="text-xs text-muted-foreground mt-1">
                            投注量: {data.volume.toLocaleString()}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            预测者: {data.predictors}
                          </div>
                        </div>
                      )
                    }
                    return null
                  }}
                />
                <ReferenceLine y={50} stroke="hsl(var(--muted-foreground))" strokeDasharray="3 3" />
                <Line
                  type="monotone"
                  dataKey="probability"
                  stroke="hsl(var(--primary))"
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="flex h-64 items-center justify-center text-muted-foreground">
            <div className="text-center">
              <Activity className="mx-auto h-12 w-12 opacity-50" />
              <p className="mt-2 text-sm">暂无历史数据</p>
              <p className="text-xs">开始投注后将显示趋势图表</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
