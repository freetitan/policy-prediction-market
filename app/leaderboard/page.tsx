import { createClient } from '@/lib/supabase/server'
import { Navbar } from '@/components/navbar'
import { LeaderboardTable } from '@/components/leaderboard-table'
import type { LeaderboardEntry } from '@/lib/types'
import { Trophy } from 'lucide-react'

export const metadata = {
  title: '积分排行榜 | 政策预测市场',
  description: '查看政策预测市场的积分排行榜',
}

export default async function LeaderboardPage() {
  const supabase = await createClient()

  // 获取当前用户
  const { data: { user } } = await supabase.auth.getUser()

  // 获取排行榜数据
  const { data: profiles } = await supabase
    .from('profiles')
    .select('id, display_name, points')
    .order('points', { ascending: false })
    .limit(100)

  const leaderboard: LeaderboardEntry[] = (profiles || []).map((profile, index) => ({
    ...profile,
    rank: index + 1,
  }))

  // 查找当前用户排名
  let userRank = null
  if (user) {
    const userEntry = leaderboard.find(e => e.id === user.id)
    if (userEntry) {
      userRank = userEntry.rank
    } else {
      // 用户不在前100名，查询其排名
      const { count } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .gt('points', (profiles?.[profiles.length - 1]?.points || 0))
      
      if (count !== null) {
        userRank = count + 1
      }
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="mb-8 text-center">
          <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
            <Trophy className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-3xl font-bold text-foreground">积分排行榜</h1>
          <p className="mt-2 text-muted-foreground">
            预测达人榜，看看谁的预测最准确
          </p>
          {user && userRank && (
            <div className="mt-4 inline-flex items-center gap-2 rounded-full bg-secondary px-4 py-2">
              <span className="text-sm text-muted-foreground">你的排名：</span>
              <span className="font-semibold text-foreground">第 {userRank} 名</span>
            </div>
          )}
        </div>

        {leaderboard.length > 0 ? (
          <LeaderboardTable entries={leaderboard} currentUserId={user?.id} />
        ) : (
          <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-card/50 py-16">
            <Trophy className="h-12 w-12 text-muted-foreground/50" />
            <p className="mt-4 text-lg font-medium text-muted-foreground">
              暂无排行数据
            </p>
            <p className="mt-1 text-sm text-muted-foreground/70">
              注册并参与预测，登上排行榜
            </p>
          </div>
        )}
      </main>
    </div>
  )
}
