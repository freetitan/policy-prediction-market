import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Navbar } from '@/components/navbar'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import type { BetWithMarket } from '@/lib/types'
import { 
  User, 
  Coins, 
  TrendingUp, 
  TrendingDown, 
  Calendar,
  BarChart3,
  Target,
  Clock
} from 'lucide-react'
import Link from 'next/link'

export const metadata = {
  title: '个人中心 | 政策预测市场',
  description: '查看您的预测记录和积分信息',
}

export default async function ProfilePage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login')
  }

  // 获取用户档案
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  // 获取用户的所有投注（包含市场信息）
  const { data: bets } = await supabase
    .from('bets')
    .select(`
      *,
      markets (*)
    `)
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  const userBets = (bets || []) as BetWithMarket[]

  // 计算统计数据
  const totalBets = userBets.length
  const totalInvested = userBets.reduce((sum, bet) => sum + bet.amount, 0)
  const resolvedBets = userBets.filter(b => b.markets.resolved)
  const correctBets = resolvedBets.filter(b => b.position === b.markets.outcome)
  const winRate = resolvedBets.length > 0 
    ? (correctBets.length / resolvedBets.length * 100).toFixed(1)
    : '0'

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
        {/* Profile Header */}
        <div className="mb-8 flex items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary text-primary-foreground">
            <User className="h-8 w-8" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              {profile?.display_name || '用户'}
            </h1>
            <p className="text-muted-foreground">{user.email}</p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardContent className="flex items-center gap-4 pt-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-chart-3/10">
                <Coins className="h-6 w-6 text-chart-3" />
              </div>
              <div>
                <p className="text-2xl font-bold">{profile?.points.toLocaleString() || 0}</p>
                <p className="text-sm text-muted-foreground">当前积分</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-center gap-4 pt-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                <BarChart3 className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{totalBets}</p>
                <p className="text-sm text-muted-foreground">参与预测</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-center gap-4 pt-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-chart-2/10">
                <Target className="h-6 w-6 text-chart-2" />
              </div>
              <div>
                <p className="text-2xl font-bold">{winRate}%</p>
                <p className="text-sm text-muted-foreground">胜率</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-center gap-4 pt-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-secondary">
                <TrendingUp className="h-6 w-6 text-foreground" />
              </div>
              <div>
                <p className="text-2xl font-bold">{totalInvested.toLocaleString()}</p>
                <p className="text-sm text-muted-foreground">累计投注</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Bet History */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              预测记录
            </CardTitle>
          </CardHeader>
          <CardContent>
            {userBets.length > 0 ? (
              <div className="space-y-4">
                {userBets.map((bet) => {
                  const isResolved = bet.markets.resolved
                  const isCorrect = isResolved && bet.position === bet.markets.outcome
                  const isExpired = new Date(bet.markets.end_date) < new Date()

                  return (
                    <Link
                      key={bet.id}
                      href={`/market/${bet.market_id}`}
                      className="block rounded-lg border border-border bg-card p-4 transition-colors hover:border-primary/50"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 space-y-2">
                          <div className="flex flex-wrap items-center gap-2">
                            <Badge variant="secondary" className="text-xs">
                              {bet.markets.category}
                            </Badge>
                            {isResolved ? (
                              <Badge className={isCorrect ? 'bg-chart-2' : 'bg-destructive'}>
                                {isCorrect ? '预测正确' : '预测错误'}
                              </Badge>
                            ) : isExpired ? (
                              <Badge variant="outline" className="border-chart-3/50 text-chart-3">
                                待结算
                              </Badge>
                            ) : (
                              <Badge variant="outline">进行中</Badge>
                            )}
                          </div>
                          <h3 className="font-medium text-foreground line-clamp-2">
                            {bet.markets.title}
                          </h3>
                          <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                            <div className="flex items-center gap-1">
                              {bet.position ? (
                                <TrendingUp className="h-4 w-4 text-chart-2" />
                              ) : (
                                <TrendingDown className="h-4 w-4 text-destructive" />
                              )}
                              <span>预测: {bet.position ? '是' : '否'}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Coins className="h-4 w-4" />
                              <span>{bet.amount} 积分</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Calendar className="h-4 w-4" />
                              <span>{formatDate(bet.created_at)}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </Link>
                  )
                })}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12">
                <BarChart3 className="h-12 w-12 text-muted-foreground/50" />
                <p className="mt-4 text-lg font-medium text-muted-foreground">
                  暂无预测记录
                </p>
                <p className="mt-1 text-sm text-muted-foreground/70">
                  去市场页面参与您的第一次预测吧
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
