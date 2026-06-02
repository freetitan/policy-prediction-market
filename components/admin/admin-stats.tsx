'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { createClient } from '@/lib/supabase/client'
import { TrendingUp, Users, Coins, CheckCircle } from 'lucide-react'

interface Stats {
  totalMarkets: number
  activeMarkets: number
  totalUsers: number
  totalPoints: number
}

export function AdminStats() {
  const [stats, setStats] = useState<Stats>({
    totalMarkets: 0,
    activeMarkets: 0,
    totalUsers: 0,
    totalPoints: 0,
  })
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // 获取市场统计
        const { count: totalMarkets } = await supabase
          .from('markets')
          .select('*', { count: 'exact', head: true })

        const { count: activeMarkets } = await supabase
          .from('markets')
          .select('*', { count: 'exact', head: true })
          .eq('resolved', false)

        // 获取用户统计
        const { count: totalUsers } = await supabase
          .from('profiles')
          .select('*', { count: 'exact', head: true })

        // 获取积分池总量
        const { data: pointsData } = await supabase
          .from('profiles')
          .select('points')

        const totalPoints = pointsData?.reduce((sum, profile) => sum + profile.points, 0) || 0

        setStats({
          totalMarkets: totalMarkets || 0,
          activeMarkets: activeMarkets || 0,
          totalUsers: totalUsers || 0,
          totalPoints,
        })
      } catch (error) {
        console.error('获取统计数据失败:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [supabase])

  const statCards = [
    {
      title: '总市场数',
      value: stats.totalMarkets,
      icon: TrendingUp,
      color: 'text-blue-500',
      bgColor: 'bg-blue-500/10',
    },
    {
      title: '活跃市场',
      value: stats.activeMarkets,
      icon: CheckCircle,
      color: 'text-green-500',
      bgColor: 'bg-green-500/10',
    },
    {
      title: '总用户数',
      value: stats.totalUsers,
      icon: Users,
      color: 'text-purple-500',
      bgColor: 'bg-purple-500/10',
    },
    {
      title: '总积分池',
      value: stats.totalPoints.toLocaleString(),
      icon: Coins,
      color: 'text-yellow-500',
      bgColor: 'bg-yellow-500/10',
    },
  ]

  if (loading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <div className="h-20 animate-pulse space-y-3">
                <div className="h-4 w-20 bg-secondary rounded" />
                <div className="h-8 w-24 bg-secondary rounded" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {statCards.map((stat) => {
        const Icon = stat.icon
        return (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                <Icon className={`h-4 w-4 ${stat.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
