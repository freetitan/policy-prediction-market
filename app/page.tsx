import { createClient } from '@/lib/supabase/server'
import { Navbar } from '@/components/navbar'
import { MarketFilters } from '@/components/market-filters'
import { MarketsGrid } from '@/components/markets-grid'
import { WELCOME_BONUS } from '@/lib/types'
import type { Market, MarketCategory } from '@/lib/types'
import { TrendingUp, Users, Coins, BarChart3 } from 'lucide-react'

interface HomeProps {
  searchParams: Promise<{ category?: string }>
}

export default async function Home({ searchParams }: HomeProps) {
  const { category } = await searchParams
  const supabase = await createClient()

  let query = supabase
    .from('markets')
    .select('*')
    .order('created_at', { ascending: false })

  if (category && category !== '全部') {
    query = query.eq('category', category)
  }

  const { data: markets } = await query

  // 获取统计数据
  const { count: marketCount } = await supabase
    .from('markets')
    .select('*', { count: 'exact', head: true })

  const { count: userCount } = await supabase
    .from('profiles')
    .select('*', { count: 'exact', head: true })

  const { data: poolData } = await supabase
    .from('markets')
    .select('yes_pool, no_pool')

  const totalPool = poolData?.reduce(
    (sum, m) => sum + (m.yes_pool || 0) + (m.no_pool || 0),
    0
  ) || 0

  const selectedCategory = (category as MarketCategory) || '全部'

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      {/* Hero Section */}
      <section className="border-b border-border bg-gradient-to-br from-primary/5 via-background to-accent/5">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <h1 className="text-balance text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
              用集体智慧
              <span className="text-primary">预测政策走向</span>
            </h1>
            <p className="mt-4 text-pretty text-lg text-muted-foreground">
              基于积分制的公共政策预测市场，汇聚众人智慧，探索政策未来。
              参与预测，赢取积分奖励。
            </p>
          </div>
          
          {/* Stats */}
          <div className="mx-auto mt-12 grid max-w-4xl grid-cols-2 gap-4 sm:grid-cols-4">
            <div className="rounded-xl bg-card p-4 text-center shadow-sm">
              <BarChart3 className="mx-auto h-6 w-6 text-primary" />
              <p className="mt-2 text-2xl font-bold text-foreground">{marketCount || 0}</p>
              <p className="text-sm text-muted-foreground">预测市场</p>
            </div>
            <div className="rounded-xl bg-card p-4 text-center shadow-sm">
              <Users className="mx-auto h-6 w-6 text-chart-2" />
              <p className="mt-2 text-2xl font-bold text-foreground">{userCount || 0}</p>
              <p className="text-sm text-muted-foreground">活跃用户</p>
            </div>
            <div className="rounded-xl bg-card p-4 text-center shadow-sm">
              <Coins className="mx-auto h-6 w-6 text-chart-3" />
              <p className="mt-2 text-2xl font-bold text-foreground">{totalPool.toLocaleString()}</p>
              <p className="text-sm text-muted-foreground">总积分池</p>
            </div>
            <div className="rounded-xl bg-card p-4 text-center shadow-sm">
              <TrendingUp className="mx-auto h-6 w-6 text-chart-4" />
              <p className="mt-2 text-2xl font-bold text-foreground">{WELCOME_BONUS.toLocaleString()}</p>
              <p className="text-sm text-muted-foreground">注册送积分</p>
            </div>
          </div>
        </div>
      </section>

      {/* Markets Section */}
      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-2xl font-bold text-foreground">预测市场</h2>
            <p className="mt-1 text-muted-foreground">
              选择你感兴趣的政策领域，参与预测
            </p>
          </div>
        </div>

        <div className="mb-6">
          <MarketFilters selectedCategory={selectedCategory} />
        </div>

        {markets && markets.length > 0 ? (
          <MarketsGrid markets={markets} />
        ) : (
          <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-card/50 py-16">
            <BarChart3 className="h-12 w-12 text-muted-foreground/50" />
            <p className="mt-4 text-lg font-medium text-muted-foreground">
              暂无相关预测市场
            </p>
            <p className="mt-1 text-sm text-muted-foreground/70">
              请选择其他分类或稍后再来
            </p>
          </div>
        )}
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-card">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
                <TrendingUp className="h-4 w-4 text-primary-foreground" />
              </div>
              <span className="font-semibold text-foreground">政策预测</span>
            </div>
            <p className="text-sm text-muted-foreground">
              本平台仅供学习研究使用，不构成任何投资建议
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
