'use client'

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import type { LeaderboardEntry } from '@/lib/types'
import { Trophy, Medal, Award, Coins, User } from 'lucide-react'
import { cn } from '@/lib/utils'

interface LeaderboardTableProps {
  entries: LeaderboardEntry[]
  currentUserId?: string
}

export function LeaderboardTable({ entries, currentUserId }: LeaderboardTableProps) {
  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Trophy className="h-5 w-5 text-yellow-500" />
      case 2:
        return <Medal className="h-5 w-5 text-gray-400" />
      case 3:
        return <Award className="h-5 w-5 text-amber-600" />
      default:
        return <span className="w-5 text-center text-sm font-medium text-muted-foreground">{rank}</span>
    }
  }

  const getRankBg = (rank: number) => {
    switch (rank) {
      case 1:
        return 'bg-yellow-500/10'
      case 2:
        return 'bg-gray-400/10'
      case 3:
        return 'bg-amber-600/10'
      default:
        return ''
    }
  }

  return (
    <div className="rounded-lg border border-border bg-card">
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            <TableHead className="w-16 text-center">排名</TableHead>
            <TableHead>用户</TableHead>
            <TableHead className="text-right">积分</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {entries.map((entry) => (
            <TableRow
              key={entry.id}
              className={cn(
                getRankBg(entry.rank),
                currentUserId === entry.id && 'bg-primary/5 font-medium'
              )}
            >
              <TableCell className="text-center">
                <div className="flex items-center justify-center">
                  {getRankIcon(entry.rank)}
                </div>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-secondary">
                    <User className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div className="flex items-center gap-2">
                    <span>{entry.display_name || '匿名用户'}</span>
                    {currentUserId === entry.id && (
                      <Badge variant="secondary" className="text-xs">
                        我
                      </Badge>
                    )}
                  </div>
                </div>
              </TableCell>
              <TableCell className="text-right">
                <div className="flex items-center justify-end gap-1.5">
                  <Coins className="h-4 w-4 text-chart-3" />
                  <span className="font-semibold tabular-nums">
                    {entry.points.toLocaleString()}
                  </span>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
