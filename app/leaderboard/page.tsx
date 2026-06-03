import { createClient } from '@/lib/supabase/server'
import { Navbar } from '@/components/navbar'
import { EnhancedLeaderboardTable } from '@/components/enhanced-leaderboard-table'
import { Trophy } from 'lucide-react'

export const metadata = {
  title: '排行榜 | 政策预测市场',
  description: '查看顶尖预测者排行榜',
}

export default async function LeaderboardPage() {
  const supabase = await createClient()

  // 获取当前用户
  const { data: { user } } = await supabase.auth.getUser()

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="mb-8 text-center">
          <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
            <Trophy className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-3xl font-bold text-foreground">预测者排行榜</h1>
          <p className="mt-2 text-muted-foreground">
            基于预测分数和准确率的综合排名
          </p>
        </div>

        <EnhancedLeaderboardTable currentUserId={user?.id} />
      </main>
    </div>
  )
}
