'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { createClient } from '@/lib/supabase/client'
import { Users, Coins, Edit, AlertCircle, TrendingUp, TrendingDown } from 'lucide-react'
import type { Profile } from '@/lib/types'

interface UserWithBets extends Profile {
  total_bets: number
  total_wagered: number
}

interface UserManagementProps {
  adminId: string
}

export function UserManagement({ adminId }: UserManagementProps) {
  const [users, setUsers] = useState<UserWithBets[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [sortBy, setSortBy] = useState<'points' | 'created_at'>('points')
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    fetchUsers()
  }, [sortBy, supabase])

  const fetchUsers = async () => {
    setLoading(true)
    try {
      // 获取用户列表
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .order(sortBy, { ascending: sortBy === 'created_at' })

      if (profilesError) throw profilesError

      // 获取每个用户的投注统计
      const usersWithStats = await Promise.all(
        (profiles || []).map(async (profile) => {
          const { data: bets } = await supabase
            .from('bets')
            .select('amount')
            .eq('user_id', profile.id)

          const total_bets = bets?.length || 0
          const total_wagered = bets?.reduce((sum, bet) => sum + bet.amount, 0) || 0

          return {
            ...profile,
            total_bets,
            total_wagered,
          }
        })
      )

      setUsers(usersWithStats)
    } catch (error) {
      console.error('获取用户列表失败:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  const filteredUsers = users.filter(
    (user) =>
      user.display_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex-1">
          <Input
            placeholder="搜索用户（昵称或邮箱）..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-md"
          />
        </div>
        <Select value={sortBy} onValueChange={(value: 'points' | 'created_at') => setSortBy(value)}>
          <SelectTrigger className="w-[180px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="points">按积分排序</SelectItem>
            <SelectItem value="created_at">按注册时间</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Users List */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="h-24 animate-pulse space-y-3">
                  <div className="h-4 w-1/3 bg-secondary rounded" />
                  <div className="h-4 w-1/2 bg-secondary rounded" />
                  <div className="h-4 w-2/3 bg-secondary rounded" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : filteredUsers.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center gap-4 py-16">
            <Users className="h-16 w-16 text-muted-foreground" />
            <p className="text-center text-muted-foreground">
              {searchTerm ? '未找到匹配的用户' : '暂无用户'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredUsers.map((user, index) => (
            <Card key={user.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      {sortBy === 'points' && (
                        <Badge variant="outline">#{index + 1}</Badge>
                      )}
                      <Badge className="gap-1">
                        <Coins className="h-3 w-3" />
                        {user.points.toLocaleString()} 积分
                      </Badge>
                    </div>
                    <CardTitle className="text-lg">
                      {user.display_name || '未设置昵称'}
                    </CardTitle>
                    <CardDescription className="mt-1">{user.email}</CardDescription>
                  </div>
                </div>

                <div className="mt-3 grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">注册时间</p>
                    <p className="font-medium">{formatDate(user.created_at)}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">总投注次数</p>
                    <p className="font-medium">{user.total_bets} 次</p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-muted-foreground">累计投注金额</p>
                    <p className="font-medium">{user.total_wagered.toLocaleString()} 积分</p>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="flex gap-2 border-t border-border pt-4">
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm" className="gap-2">
                      <Edit className="h-4 w-4" />
                      调整积分
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <AdjustPointsForm
                      user={user}
                      adminId={adminId}
                      onSuccess={() => {
                        fetchUsers()
                        router.refresh()
                      }}
                    />
                  </DialogContent>
                </Dialog>

                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm" className="gap-2">
                      <TrendingUp className="h-4 w-4" />
                      查看投注
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                    <UserBetsView userId={user.id} userName={user.display_name || '用户'} />
                  </DialogContent>
                </Dialog>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

function AdjustPointsForm({
  user,
  adminId,
  onSuccess,
}: {
  user: Profile
  adminId: string
  onSuccess: () => void
}) {
  const [operation, setOperation] = useState<'add' | 'subtract' | 'set'>('add')
  const [amount, setAmount] = useState('')
  const [reason, setReason] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClient()

  const calculateNewPoints = () => {
    const numAmount = parseInt(amount) || 0
    switch (operation) {
      case 'add':
        return user.points + numAmount
      case 'subtract':
        return Math.max(0, user.points - numAmount)
      case 'set':
        return Math.max(0, numAmount)
      default:
        return user.points
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setError(null)

    try {
      const newPoints = calculateNewPoints()

      const { error: updateError } = await supabase
        .from('profiles')
        .update({ points: newPoints })
        .eq('id', user.id)

      if (updateError) throw updateError

      // 记录日志
      await supabase.from('admin_logs').insert({
        admin_id: adminId,
        action: 'adjust_points',
        details: {
          user_id: user.id,
          operation,
          amount: parseInt(amount),
          old_points: user.points,
          new_points: newPoints,
          reason: reason.trim(),
        },
      })

      onSuccess()
    } catch (err) {
      setError(err instanceof Error ? err.message : '操作失败')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <DialogHeader>
        <DialogTitle>调整用户积分</DialogTitle>
        <DialogDescription>
          当前用户: {user.display_name || '未设置昵称'} | 当前积分: {user.points.toLocaleString()}
        </DialogDescription>
      </DialogHeader>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="operation">操作类型</Label>
          <Select value={operation} onValueChange={(value: 'add' | 'subtract' | 'set') => setOperation(value)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="add">增加积分</SelectItem>
              <SelectItem value="subtract">减少积分</SelectItem>
              <SelectItem value="set">设置为指定值</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="amount">
            {operation === 'set' ? '新积分值' : '积分数量'}{' '}
            <span className="text-destructive">*</span>
          </Label>
          <Input
            id="amount"
            type="number"
            min="0"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="输入数字"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="reason">原因（可选）</Label>
          <Input
            id="reason"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="说明调整原因..."
          />
        </div>

        {amount && (
          <Card className="border-blue-500/50 bg-blue-500/5">
            <CardContent className="p-4">
              <p className="text-sm">
                <strong>预览:</strong> {user.points.toLocaleString()} →{' '}
                <span className="text-blue-500 font-bold">
                  {calculateNewPoints().toLocaleString()}
                </span>
              </p>
            </CardContent>
          </Card>
        )}

        {error && (
          <div className="flex items-center gap-2 rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
            <AlertCircle className="h-4 w-4 shrink-0" />
            {error}
          </div>
        )}
      </div>

      <DialogFooter>
        <Button type="submit" disabled={!amount || submitting}>
          {submitting ? '处理中...' : '确认调整'}
        </Button>
      </DialogFooter>
    </form>
  )
}

function UserBetsView({ userId, userName }: { userId: string; userName: string }) {
  const [bets, setBets] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    const fetchBets = async () => {
      try {
        const { data, error } = await supabase
          .from('bets')
          .select(`
            *,
            markets (
              title,
              resolved,
              outcome
            )
          `)
          .eq('user_id', userId)
          .order('created_at', { ascending: false })

        if (error) throw error
        setBets(data || [])
      } catch (error) {
        console.error('获取投注记录失败:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchBets()
  }, [userId, supabase])

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  return (
    <div className="space-y-4">
      <DialogHeader>
        <DialogTitle>{userName} 的投注记录</DialogTitle>
        <DialogDescription>共 {bets.length} 次投注</DialogDescription>
      </DialogHeader>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-20 animate-pulse bg-secondary rounded" />
          ))}
        </div>
      ) : bets.length === 0 ? (
        <div className="flex flex-col items-center gap-4 py-8">
          <TrendingDown className="h-12 w-12 text-muted-foreground" />
          <p className="text-muted-foreground">暂无投注记录</p>
        </div>
      ) : (
        <div className="space-y-3 max-h-[400px] overflow-y-auto">
          {bets.map((bet) => (
            <Card key={bet.id}>
              <CardContent className="p-4">
                <div className="space-y-2">
                  <div className="flex items-start justify-between gap-4">
                    <p className="font-medium text-sm flex-1">
                      {bet.markets?.title || '市场已删除'}
                    </p>
                    <Badge variant={bet.position ? 'default' : 'destructive'} className="shrink-0">
                      {bet.position ? '是' : '否'}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">投注金额</span>
                    <span className="font-semibold">{bet.amount.toLocaleString()} 积分</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">投注时间</span>
                    <span>{formatDate(bet.created_at)}</span>
                  </div>
                  {bet.markets?.resolved && (
                    <div className="pt-2 border-t border-border">
                      <Badge
                        variant={
                          bet.markets.outcome === bet.position ? 'default' : 'secondary'
                        }
                        className="gap-1"
                      >
                        {bet.markets.outcome === bet.position ? (
                          <>
                            <TrendingUp className="h-3 w-3" />
                            胜利
                          </>
                        ) : (
                          <>
                            <TrendingDown className="h-3 w-3" />
                            失败
                          </>
                        )}
                      </Badge>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
