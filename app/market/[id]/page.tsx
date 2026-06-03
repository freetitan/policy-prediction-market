import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { Navbar } from '@/components/navbar'
import { BetForm } from '@/components/bet-form'
import { PredictionChart } from '@/components/prediction-chart'
import { CommentsSection } from '@/components/comments-section'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { Market, Profile, Bet } from '@/lib/types'
import { 
  ArrowLeft, 
  Calendar, 
  TrendingUp, 
  TrendingDown, 
  Users, 
  Coins,
  Clock,
  CheckCircle2
} from 'lucide-react'
import Link from 'next/link'

interface MarketPageProps {
  params: Promise<{ id: string }>
}

export default async function MarketPage({ params }: MarketPageProps) {
  const { id } = await params
  const supabase = await createClient()

  // 获取市场数据
  const { data: market } = await supabase
    .from('markets')
    .select('*')
    .eq('id', id)
    .single()

  if (!market) {
    notFound()
  }

  // 获取当前用户
  const { data: { user } } = await supabase.auth.getUser()
  
  let userProfile: Profile | null = null
  if (user) {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()
    userProfile = data
  }

  // 获取该市场的投注数据
  const { data: bets, count: betCount } = await supabase
    .from('bets')
    .select('*', { count: 'exact' })
    .eq('market_id', id)

  // 计算独立预测者数量
  const uniquePredictors = bets 
    ? new Set(bets.map(bet => bet.user_id)).size 
    : 0

  // 获取用户在该市场的投注
  let userBets: Bet[] = []
  if (user) {
    const { data } = await supabase
      .from('bets')
      .select('*')
      .eq('market_id', id)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
    userBets = data || []
  }

  const totalPool = market.yes_pool + market.no_pool
  const yesPercentage = totalPool > 0 ? (market.yes_pool / totalPool) * 100 : 50
  const noPercentage = 100 - yesPercentage

  const isExpired = new Date(market.end_date) < new Date()
  const daysLeft = Math.ceil(
    (new Date(market.end_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
  )

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <Link
          href="/"
          className="mb-6 inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          返回市场列表
        </Link>

        <div className="grid gap-8 lg:grid-cols-3">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Market Header */}
            <div>
              <div className="mb-4 flex flex-wrap items-center gap-2">
                <Badge variant="secondary">{market.category}</Badge>
                {market.resolved ? (
                  <Badge className="bg-chart-2 text-chart-2-foreground">
                    <CheckCircle2 className="mr-1 h-3 w-3" />
                    已结算
                  </Badge>
                ) : isExpired ? (
                  <Badge variant="outline" className="border-destructive/50 text-destructive">
                    已截止
                  </Badge>
                ) : daysLeft <= 7 ? (
                  <Badge variant="outline" className="border-chart-3/50 text-chart-3">
                    <Clock className="mr-1 h-3 w-3" />
                    {daysLeft}天后截止
                  </Badge>
                ) : (
                  <Badge variant="outline">
                    <Clock className="mr-1 h-3 w-3" />
                    进行中
                  </Badge>
                )}
              </div>
              <h1 className="text-2xl font-bold text-foreground sm:text-3xl">
                {market.title}
              </h1>
              <p className="mt-4 text-muted-foreground leading-relaxed">
                {market.description}
              </p>
            </div>

            {/* Market Stats */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">市场概率</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-chart-2/10">
                        <TrendingUp className="h-4 w-4 text-chart-2" />
                      </div>
                      <span className="font-medium">是</span>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-chart-2">
                        {yesPercentage.toFixed(1)}%
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {market.yes_pool.toLocaleString()} 积分
                      </p>
                    </div>
                  </div>
                  <Progress value={yesPercentage} className="h-3 bg-destructive/20" />
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-destructive/10">
                        <TrendingDown className="h-4 w-4 text-destructive" />
                      </div>
                      <span className="font-medium">否</span>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-destructive">
                        {noPercentage.toFixed(1)}%
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {market.no_pool.toLocaleString()} 积分
                      </p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4 rounded-lg bg-secondary/50 p-4">
                  <div className="text-center">
                    <Coins className="mx-auto h-5 w-5 text-muted-foreground" />
                    <p className="mt-1 text-lg font-semibold">{totalPool.toLocaleString()}</p>
                    <p className="text-xs text-muted-foreground">总积分池</p>
                  </div>
                  <div className="text-center">
                    <Users className="mx-auto h-5 w-5 text-muted-foreground" />
                    <p className="mt-1 text-lg font-semibold">{betCount || 0}</p>
                    <p className="text-xs text-muted-foreground">投注次数</p>
                  </div>
                  <div className="text-center">
                    <Calendar className="mx-auto h-5 w-5 text-muted-foreground" />
                    <p className="mt-1 text-lg font-semibold">
                      {isExpired ? '已截止' : `${daysLeft}天`}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {isExpired ? '' : '剩余时间'}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Prediction Chart */}
            <PredictionChart 
              marketId={id}
              currentProbability={yesPercentage / 100}
              totalVolume={totalPool}
              uniquePredictors={uniquePredictors}
            />

            {/* User's Bets */}
            {userBets.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">我的投注</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {userBets.map((bet) => (
                      <div
                        key={bet.id}
                        className="flex items-center justify-between rounded-lg border border-border bg-secondary/30 p-3"
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className={`flex h-8 w-8 items-center justify-center rounded-full ${
                              bet.position ? 'bg-chart-2/10' : 'bg-destructive/10'
                            }`}
                          >
                            {bet.position ? (
                              <TrendingUp className="h-4 w-4 text-chart-2" />
                            ) : (
                              <TrendingDown className="h-4 w-4 text-destructive" />
                            )}
                          </div>
                          <div>
                            <p className="font-medium">
                              预测: <span className={bet.position ? 'text-chart-2' : 'text-destructive'}>
                                {bet.position ? '是' : '否'}
                              </span>
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {formatDate(bet.created_at)}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-1 text-right">
                          <Coins className="h-4 w-4 text-chart-3" />
                          <span className="font-semibold">{bet.amount}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Market Info */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">市场信息</CardTitle>
              </CardHeader>
              <CardContent>
                <dl className="space-y-4">
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">创建时间</dt>
                    <dd className="font-medium">{formatDate(market.created_at)}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">截止时间</dt>
                    <dd className="font-medium">{formatDate(market.end_date)}</dd>
                  </div>
                  {market.resolved && (
                    <div className="flex justify-between">
                      <dt className="text-muted-foreground">结算结果</dt>
                      <dd className={`font-medium ${market.outcome ? 'text-chart-2' : 'text-destructive'}`}>
                        {market.outcome ? '是' : '否'}
                      </dd>
                    </div>
                  )}
                </dl>
              </CardContent>
            </Card>

            {/* Comments Section */}
            <CommentsSection marketId={id} userProfile={userProfile} />
          </div>

          {/* Sidebar - Bet Form */}
          <div className="lg:col-span-1">
            <div className="sticky top-24">
              <BetForm market={market} userProfile={userProfile} />
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
