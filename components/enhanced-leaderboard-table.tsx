'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { ReputationBadge } from './reputation-badge'
import { Trophy, Medal, Award, TrendingUp, Target, Coins, User } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { UserStatistics } from '@/lib/types'

interface EnhancedLeaderboardTableProps {
  currentUserId?: string
}

export function EnhancedLeaderboardTable({ currentUserId }: EnhancedLeaderboardTableProps) {
  const [leaders, setLeaders] = useState<UserStatistics[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    const fetchLeaders = async () => {
      const { data } = await supabase
        .from('user_statistics')
        .select('*')
        .order('prediction_score', { ascending: false })
        .limit(50)

      if (data) {
        setLeaders(data)
      }
      setLoading(false)
    }

    fetchLeaders()
  }, [supabase])

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Trophy className="h-5 w-5 text-amber-500" />
      case 2:
        return <Medal className="h-5 w-5 text-slate-400" />
      case 3:
        return <Award className="h-5 w-5 text-amber-700" />
      default:
        return <span className="w-5 text-center text-sm font-medium text-muted-foreground">{rank}</span>
    }
  }

  const getRankBg = (rank: number) => {
    switch (rank) {
      case 1:
        return 'bg-amber-500/10'
      case 2:
        return 'bg-slate-400/10'
      case 3:
        return 'bg-amber-700/10'
      default:
        return ''
    }
  }

  if (loading) {
    return (
      <div className="rounded-lg border border-border bg-card">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="w-16 text-center">排名</TableHead>
              <TableHead>用户</TableHead>
              <TableHead className="text-center">等级</TableHead>
              <TableHead className="text-right">预测分数</TableHead>
              <TableHead className="text-right">准确率</TableHead>
              <TableHead className="text-right">积分</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {[...Array(10)].map((_, i) => (
              <TableRow key={i}>
                <TableCell><Skeleton className="h-8 w-8 mx-auto" /></TableCell>
                <TableCell><Skeleton className="h-8 w-32" /></TableCell>
                <TableCell><Skeleton className="h-6 w-20 mx-auto" /></TableCell>
                <TableCell><Skeleton className="h-8 w-16 ml-auto" /></TableCell>
                <TableCell><Skeleton className="h-8 w-16 ml-auto" /></TableCell>
                <TableCell><Skeleton className="h-8 w-20 ml-auto" /></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    )
  }

  return (
    <div className="rounded-lg border border-border bg-card">
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            <TableHead className="w-16 text-center">排名</TableHead>
            <TableHead>用户</TableHead>
            <TableHead className="text-center">等级</TableHead>
            <TableHead className="text-right">预测分数</TableHead>
            <TableHead className="text-right">准确率</TableHead>
            <TableHead className="text-right">积分</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {leaders.map((user) => (
            <TableRow
              key={user.id}
              className={cn(
                getRankBg(user.leaderboard_rank),
                currentUserId === user.id && 'bg-primary/5 font-medium'
              )}
            >
              <TableCell className="text-center">
                <div className="flex items-center justify-center">
                  {getRankIcon(user.leaderboard_rank)}
                </div>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-secondary">
                    <User className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div className="flex flex-col">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{user.display_name || '匿名用户'}</span>
                      {currentUserId === user.id && (
                        <Badge variant="secondary" className="text-xs">
                          我
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Target className="h-3 w-3" />
                        {user.total_predictions}
                      </span>
                      <span>预测</span>
                    </div>
                  </div>
                </div>
              </TableCell>
              <TableCell className="text-center">
                <ReputationBadge
                  rankTier={user.rank_tier as any}
                  predictionScore={user.prediction_score}
                  totalPredictions={user.total_predictions}
                  accuracyRate={user.accuracy_rate}
                  showDetails
                  size="sm"
                />
              </TableCell>
              <TableCell className="text-right">
                <div className="flex flex-col items-end">
                  <span className="font-bold text-lg text-foreground">
                    {user.prediction_score.toFixed(1)}
                  </span>
                  <span className="text-xs text-muted-foreground">满分 100</span>
                </div>
              </TableCell>
              <TableCell className="text-right">
                <div className="flex items-center justify-end gap-1">
                  <TrendingUp className="h-4 w-4 text-success" />
                  <span className="font-semibold">
                    {(user.accuracy_rate * 100).toFixed(1)}%
                  </span>
                </div>
              </TableCell>
              <TableCell className="text-right">
                <div className="flex items-center justify-end gap-1.5">
                  <Coins className="h-4 w-4 text-chart-3" />
                  <span className="font-semibold tabular-nums">
                    {user.points.toLocaleString()}
                  </span>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      {leaders.length === 0 && (
        <div className="py-12 text-center text-muted-foreground">
          <Trophy className="mx-auto h-12 w-12 opacity-50" />
          <p className="mt-4">暂无排名数据</p>
          <p className="text-sm">开始预测以登上排行榜</p>
        </div>
      )}
    </div>
  )
}
