import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Navbar } from '@/components/navbar'
import { VerifyMarketCard } from '@/components/verify-market-card'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { CheckCircle2, Clock, ShieldCheck, TrendingUp } from 'lucide-react'

export default async function VerifyPage() {
  const supabase = await createClient()

  // 检查用户是否登录
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/auth/login')
  }

  // 检查是否为验证者
  const { data: verifier } = await supabase
    .from('verifiers')
    .select('*')
    .eq('user_id', user.id)
    .eq('active', true)
    .single()

  if (!verifier) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <Card className="mx-auto max-w-2xl">
            <CardContent className="flex flex-col items-center gap-4 py-16">
              <ShieldCheck className="h-16 w-16 text-muted-foreground" />
              <h2 className="text-2xl font-bold">您不是验证者</h2>
              <p className="text-center text-muted-foreground">
                此页面仅供经过认证的验证者访问。
                <br />
                如需成为验证者，请联系管理员。
              </p>
            </CardContent>
          </Card>
        </main>
      </div>
    )
  }

  // 获取待验证的市场
  const { data: pendingMarkets } = await supabase
    .from('pending_verification_markets')
    .select('*')
    .order('end_date', { ascending: true })

  // 获取验证者排行榜
  const { data: leaderboard } = await supabase
    .from('verifier_leaderboard')
    .select('*')
    .limit(10)

  // 获取已验证的市场
  const { data: verifiedMarkets } = await supabase
    .from('markets')
    .select('*')
    .eq('resolved', true)
    .order('updated_at', { ascending: false })
    .limit(5)

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <ShieldCheck className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold text-foreground">验证者控制台</h1>
          </div>
          <p className="text-muted-foreground">
            欢迎回来，{verifier.name}！您的声誉值：{verifier.reputation}
          </p>
        </div>

        {/* Stats */}
        <div className="mb-8 grid gap-4 md:grid-cols-4">
          <Card>
            <CardContent className="flex items-center gap-4 p-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                <ShieldCheck className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{verifier.reputation}</p>
                <p className="text-sm text-muted-foreground">声誉值</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="flex items-center gap-4 p-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-chart-2/10">
                <CheckCircle2 className="h-6 w-6 text-chart-2" />
              </div>
              <div>
                <p className="text-2xl font-bold">{verifier.total_votes}</p>
                <p className="text-sm text-muted-foreground">总验证数</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="flex items-center gap-4 p-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-chart-3/10">
                <TrendingUp className="h-6 w-6 text-chart-3" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {verifier.total_votes > 0 
                    ? Math.round((verifier.correct_votes / verifier.total_votes) * 100)
                    : 0}%
                </p>
                <p className="text-sm text-muted-foreground">准确率</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="flex items-center gap-4 p-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-chart-4/10">
                <Clock className="h-6 w-6 text-chart-4" />
              </div>
              <div>
                <p className="text-2xl font-bold">{pendingMarkets?.length || 0}</p>
                <p className="text-sm text-muted-foreground">待验证</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-8 lg:grid-cols-3">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            <div>
              <h2 className="mb-4 text-2xl font-bold text-foreground">待验证市场</h2>
              {pendingMarkets && pendingMarkets.length > 0 ? (
                <div className="space-y-4">
                  {pendingMarkets.map((market: any) => (
                    <VerifyMarketCard 
                      key={market.id} 
                      market={market}
                      verifierId={verifier.id}
                    />
                  ))}
                </div>
              ) : (
                <Card>
                  <CardContent className="flex flex-col items-center gap-4 py-16">
                    <CheckCircle2 className="h-12 w-12 text-muted-foreground/50" />
                    <p className="text-lg font-medium text-muted-foreground">
                      暂无待验证市场
                    </p>
                    <p className="text-sm text-muted-foreground/70">
                      所有市场都已完成验证
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Recently Verified */}
            {verifiedMarkets && verifiedMarkets.length > 0 && (
              <div>
                <h2 className="mb-4 text-xl font-bold text-foreground">最近已验证</h2>
                <div className="space-y-2">
                  {verifiedMarkets.map((market: any) => (
                    <Card key={market.id} className="overflow-hidden">
                      <CardContent className="flex items-center justify-between p-4">
                        <div className="flex-1">
                          <p className="font-medium text-foreground line-clamp-1">
                            {market.title}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {market.category}
                          </p>
                        </div>
                        <Badge className={market.outcome ? "bg-chart-2" : "bg-destructive"}>
                          {market.outcome ? "是" : "否"}
                        </Badge>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  验证者排行榜
                </CardTitle>
              </CardHeader>
              <CardContent>
                {leaderboard && leaderboard.length > 0 ? (
                  <div className="space-y-4">
                    {leaderboard.map((v: any, index: number) => (
                      <div key={v.id} className="flex items-center gap-3">
                        <div className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold ${
                          index === 0 ? 'bg-yellow-500/20 text-yellow-600 dark:text-yellow-400' :
                          index === 1 ? 'bg-gray-400/20 text-gray-600 dark:text-gray-400' :
                          index === 2 ? 'bg-orange-500/20 text-orange-600 dark:text-orange-400' :
                          'bg-secondary text-muted-foreground'
                        }`}>
                          {index + 1}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className={`truncate font-medium ${
                            v.id === verifier.id ? 'text-primary' : 'text-foreground'
                          }`}>
                            {v.name}
                            {v.id === verifier.id && ' (你)'}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {v.total_votes} 次验证 · {v.accuracy_rate}% 准确
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-primary">{v.reputation}</p>
                          <p className="text-xs text-muted-foreground">声誉</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-center text-sm text-muted-foreground py-8">
                    暂无数据
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Instructions */}
            <Card className="mt-6">
              <CardHeader>
                <CardTitle className="text-base">验证指南</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground space-y-3">
                <div>
                  <p className="font-medium text-foreground mb-1">1. 调查核实</p>
                  <p>查找官方公告、新闻报道等可靠来源</p>
                </div>
                <div>
                  <p className="font-medium text-foreground mb-1">2. 提交投票</p>
                  <p>根据事实选择"是"或"否"，并提供证据链接</p>
                </div>
                <div>
                  <p className="font-medium text-foreground mb-1">3. 达成共识</p>
                  <p>当 3 个验证者中有 2 个投票一致时自动结算</p>
                </div>
                <div>
                  <p className="font-medium text-foreground mb-1">4. 声誉奖励</p>
                  <p>正确验证 +10 声誉，错误验证 -5 声誉</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}
