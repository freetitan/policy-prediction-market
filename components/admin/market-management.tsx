'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { createClient } from '@/lib/supabase/client'
import { CATEGORIES } from '@/lib/types'
import type { Market } from '@/lib/types'
import {
  Plus,
  Edit,
  CheckCircle,
  XCircle,
  TrendingUp,
  TrendingDown,
  Calendar,
  AlertCircle,
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface MarketManagementProps {
  adminId: string
}

export function MarketManagement({ adminId }: MarketManagementProps) {
  const [markets, setMarkets] = useState<Market[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'active' | 'resolved'>('all')
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [editingMarket, setEditingMarket] = useState<Market | null>(null)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    fetchMarkets()
  }, [filter, supabase])

  const fetchMarkets = async () => {
    setLoading(true)
    try {
      let query = supabase.from('markets').select('*').order('created_at', { ascending: false })

      if (filter === 'active') {
        query = query.eq('resolved', false)
      } else if (filter === 'resolved') {
        query = query.eq('resolved', true)
      }

      const { data, error } = await query

      if (error) throw error
      setMarkets(data || [])
    } catch (error) {
      console.error('获取市场列表失败:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSettleMarket = async (marketId: string, outcome: boolean) => {
    try {
      const { error } = await supabase.rpc('settle_market', {
        p_market_id: marketId,
        p_outcome: outcome,
      })

      if (error) throw error

      // 记录日志
      await supabase.from('admin_logs').insert({
        admin_id: adminId,
        action: 'settle_market',
        details: { market_id: marketId, outcome },
      })

      await fetchMarkets()
      router.refresh()
    } catch (error) {
      console.error('结算市场失败:', error)
      alert('结算失败: ' + (error as Error).message)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button
            variant={filter === 'all' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter('all')}
          >
            全部 ({markets.length})
          </Button>
          <Button
            variant={filter === 'active' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter('active')}
          >
            活跃
          </Button>
          <Button
            variant={filter === 'resolved' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter('resolved')}
          >
            已结算
          </Button>
        </div>

        <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              创建市场
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <CreateMarketForm
              adminId={adminId}
              onSuccess={() => {
                setCreateDialogOpen(false)
                fetchMarkets()
              }}
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* Markets List */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="h-32 animate-pulse space-y-3">
                  <div className="h-4 w-3/4 bg-secondary rounded" />
                  <div className="h-4 w-1/2 bg-secondary rounded" />
                  <div className="h-4 w-2/3 bg-secondary rounded" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : markets.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center gap-4 py-16">
            <AlertCircle className="h-16 w-16 text-muted-foreground" />
            <p className="text-center text-muted-foreground">暂无市场</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {markets.map((market) => (
            <Card key={market.id}>
              <CardHeader>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="mb-2 flex items-center gap-2">
                      <Badge variant="secondary">{market.category}</Badge>
                      <Badge variant="outline" className="gap-1">
                        <Calendar className="h-3 w-3" />
                        {formatDate(market.end_date)}
                      </Badge>
                      {market.resolved && (
                        <Badge
                          variant={market.outcome ? 'default' : 'destructive'}
                          className="gap-1"
                        >
                          {market.outcome ? (
                            <>
                              <CheckCircle className="h-3 w-3" />是
                            </>
                          ) : (
                            <>
                              <XCircle className="h-3 w-3" />否
                            </>
                          )}
                        </Badge>
                      )}
                    </div>
                    <CardTitle className="text-lg">{market.title}</CardTitle>
                    <CardDescription className="mt-2">{market.description}</CardDescription>
                  </div>
                </div>

                <div className="mt-4 flex items-center gap-4 text-sm">
                  <div className="flex items-center gap-1.5">
                    <TrendingUp className="h-4 w-4 text-chart-2" />
                    <span className="text-muted-foreground">是:</span>
                    <span className="font-medium">{market.yes_pool.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <TrendingDown className="h-4 w-4 text-destructive" />
                    <span className="text-muted-foreground">否:</span>
                    <span className="font-medium">{market.no_pool.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center gap-1.5 ml-auto">
                    <span className="text-muted-foreground">总池:</span>
                    <span className="font-semibold">
                      {(market.yes_pool + market.no_pool).toLocaleString()} 积分
                    </span>
                  </div>
                </div>
              </CardHeader>

              {!market.resolved && (
                <CardContent className="flex gap-2 border-t border-border pt-4">
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="sm" className="gap-2">
                        <Edit className="h-4 w-4" />
                        编辑
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                      <EditMarketForm
                        market={market}
                        adminId={adminId}
                        onSuccess={() => {
                          fetchMarkets()
                        }}
                      />
                    </DialogContent>
                  </Dialog>

                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="outline" size="sm" className="gap-2 text-chart-2">
                        <CheckCircle className="h-4 w-4" />
                        结算为"是"
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>确认结算市场</AlertDialogTitle>
                        <AlertDialogDescription>
                          您将此市场结算为"是"。此操作不可撤销，将立即分配奖励给正确的投注者。
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>取消</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => handleSettleMarket(market.id, true)}
                          className="bg-chart-2 hover:bg-chart-2/90"
                        >
                          确认结算
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>

                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="outline" size="sm" className="gap-2 text-destructive">
                        <XCircle className="h-4 w-4" />
                        结算为"否"
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>确认结算市场</AlertDialogTitle>
                        <AlertDialogDescription>
                          您将此市场结算为"否"。此操作不可撤销，将立即分配奖励给正确的投注者。
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>取消</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => handleSettleMarket(market.id, false)}
                          className="bg-destructive hover:bg-destructive/90"
                        >
                          确认结算
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </CardContent>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

function CreateMarketForm({
  adminId,
  onSuccess,
}: {
  adminId: string
  onSuccess: () => void
}) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    end_date: '',
  })
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClient()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setError(null)

    try {
      // 获取当前用户
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) throw new Error('未登录')

      // 验证日期
      const endDate = new Date(formData.end_date)
      if (endDate <= new Date()) {
        throw new Error('结束日期必须在未来')
      }

      // 创建市场
      const { error: insertError } = await supabase.from('markets').insert({
        title: formData.title.trim(),
        description: formData.description.trim(),
        category: formData.category,
        end_date: formData.end_date,
        created_by: user.id,
      })

      if (insertError) throw insertError

      // 记录日志
      await supabase.from('admin_logs').insert({
        admin_id: adminId,
        action: 'create_market',
        details: formData,
      })

      onSuccess()
    } catch (err) {
      setError(err instanceof Error ? err.message : '创建失败')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <DialogHeader>
        <DialogTitle>创建新市场</DialogTitle>
        <DialogDescription>填写市场信息以创建新的预测市场</DialogDescription>
      </DialogHeader>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="title">
            市场标题 <span className="text-destructive">*</span>
          </Label>
          <Input
            id="title"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            placeholder="例如：2026年碳税税率是否会提高？"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">
            市场描述 <span className="text-destructive">*</span>
          </Label>
          <Textarea
            id="description"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="详细描述市场的判定标准..."
            rows={4}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="category">
            分类 <span className="text-destructive">*</span>
          </Label>
          <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
            <SelectTrigger>
              <SelectValue placeholder="选择分类" />
            </SelectTrigger>
            <SelectContent>
              {CATEGORIES.filter((cat) => cat !== '全部').map((category) => (
                <SelectItem key={category} value={category}>
                  {category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="end_date">
            结束日期 <span className="text-destructive">*</span>
          </Label>
          <Input
            id="end_date"
            type="date"
            value={formData.end_date}
            onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
            min={new Date().toISOString().split('T')[0]}
            required
          />
        </div>

        {error && (
          <div className="flex items-center gap-2 rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
            <AlertCircle className="h-4 w-4 shrink-0" />
            {error}
          </div>
        )}
      </div>

      <DialogFooter>
        <Button type="submit" disabled={submitting}>
          {submitting ? '创建中...' : '创建市场'}
        </Button>
      </DialogFooter>
    </form>
  )
}

function EditMarketForm({
  market,
  adminId,
  onSuccess,
}: {
  market: Market
  adminId: string
  onSuccess: () => void
}) {
  const [formData, setFormData] = useState({
    title: market.title,
    description: market.description,
    category: market.category,
    end_date: market.end_date.split('T')[0],
  })
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClient()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setError(null)

    try {
      const { error: updateError } = await supabase
        .from('markets')
        .update({
          title: formData.title.trim(),
          description: formData.description.trim(),
          category: formData.category,
          end_date: formData.end_date,
        })
        .eq('id', market.id)

      if (updateError) throw updateError

      // 记录日志
      await supabase.from('admin_logs').insert({
        admin_id: adminId,
        action: 'edit_market',
        details: { market_id: market.id, changes: formData },
      })

      onSuccess()
    } catch (err) {
      setError(err instanceof Error ? err.message : '更新失败')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <DialogHeader>
        <DialogTitle>编辑市场</DialogTitle>
        <DialogDescription>修改市场信息</DialogDescription>
      </DialogHeader>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="edit-title">市场标题</Label>
          <Input
            id="edit-title"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="edit-description">市场描述</Label>
          <Textarea
            id="edit-description"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            rows={4}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="edit-category">分类</Label>
          <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {CATEGORIES.filter((cat) => cat !== '全部').map((category) => (
                <SelectItem key={category} value={category}>
                  {category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="edit-end_date">结束日期</Label>
          <Input
            id="edit-end_date"
            type="date"
            value={formData.end_date}
            onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
            required
          />
        </div>

        {error && (
          <div className="flex items-center gap-2 rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
            <AlertCircle className="h-4 w-4 shrink-0" />
            {error}
          </div>
        )}
      </div>

      <DialogFooter>
        <Button type="submit" disabled={submitting}>
          {submitting ? '保存中...' : '保存更改'}
        </Button>
      </DialogFooter>
    </form>
  )
}
