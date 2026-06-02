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
import {
  Plus,
  ShieldCheck,
  ShieldOff,
  Star,
  AlertCircle,
  Search,
} from 'lucide-react'

interface Verifier {
  id: string
  user_id: string
  reputation: number
  active: boolean
  created_at: string
  user: {
    email: string
  }
  profiles: {
    display_name: string | null
  }
}

interface VerifierManagementProps {
  adminId: string
}

export function VerifierManagement({ adminId }: VerifierManagementProps) {
  const [verifiers, setVerifiers] = useState<Verifier[]>([])
  const [loading, setLoading] = useState(true)
  const [addDialogOpen, setAddDialogOpen] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    fetchVerifiers()
  }, [supabase])

  const fetchVerifiers = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('verifiers')
        .select(`
          *,
          user:user_id!inner (
            email
          ),
          profiles:user_id (
            display_name
          )
        `)
        .order('created_at', { ascending: false })

      if (error) throw error
      setVerifiers(data || [])
    } catch (error) {
      console.error('获取验证者列表失败:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleToggleStatus = async (verifierId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('verifiers')
        .update({ active: !currentStatus })
        .eq('id', verifierId)

      if (error) throw error

      // 记录日志
      await supabase.from('admin_logs').insert({
        admin_id: adminId,
        action: currentStatus ? 'deactivate_verifier' : 'activate_verifier',
        details: { verifier_id: verifierId },
      })

      await fetchVerifiers()
      router.refresh()
    } catch (error) {
      console.error('更新验证者状态失败:', error)
      alert('操作失败: ' + (error as Error).message)
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
        <p className="text-sm text-muted-foreground">
          当前验证者: {verifiers.filter((v) => v.active).length} 人
        </p>

        <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              添加验证者
            </Button>
          </DialogTrigger>
          <DialogContent>
            <AddVerifierForm
              adminId={adminId}
              onSuccess={() => {
                setAddDialogOpen(false)
                fetchVerifiers()
              }}
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* Verifiers List */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="h-20 animate-pulse space-y-3">
                  <div className="h-4 w-1/3 bg-secondary rounded" />
                  <div className="h-4 w-1/2 bg-secondary rounded" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : verifiers.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center gap-4 py-16">
            <ShieldCheck className="h-16 w-16 text-muted-foreground" />
            <p className="text-center text-muted-foreground">暂无验证者</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {verifiers.map((verifier) => (
            <Card key={verifier.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      {verifier.active ? (
                        <Badge className="gap-1 bg-chart-2">
                          <ShieldCheck className="h-3 w-3" />
                          活跃
                        </Badge>
                      ) : (
                        <Badge variant="secondary" className="gap-1">
                          <ShieldOff className="h-3 w-3" />
                          已停用
                        </Badge>
                      )}
                      <Badge variant="outline" className="gap-1">
                        <Star className="h-3 w-3 text-yellow-500" />
                        声誉: {verifier.reputation}
                      </Badge>
                    </div>
                    <CardTitle className="text-lg">
                      {verifier.profiles?.display_name || '未设置昵称'}
                    </CardTitle>
                    <CardDescription className="mt-1">
                      {verifier.user?.email}
                    </CardDescription>
                    <p className="text-sm text-muted-foreground mt-2">
                      加入时间: {formatDate(verifier.created_at)}
                    </p>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="flex gap-2 border-t border-border pt-4">
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      className={verifier.active ? 'text-destructive' : 'text-chart-2'}
                    >
                      {verifier.active ? '停用' : '激活'}
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>
                        {verifier.active ? '停用验证者' : '激活验证者'}
                      </AlertDialogTitle>
                      <AlertDialogDescription>
                        {verifier.active
                          ? '停用后，此用户将无法参与市场验证。'
                          : '激活后，此用户将能够参与市场验证。'}
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>取消</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => handleToggleStatus(verifier.id, verifier.active)}
                      >
                        确认
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

function AddVerifierForm({
  adminId,
  onSuccess,
}: {
  adminId: string
  onSuccess: () => void
}) {
  const [email, setEmail] = useState('')
  const [searching, setSearching] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [foundUser, setFoundUser] = useState<{ id: string; email: string; display_name: string | null } | null>(null)
  const supabase = createClient()

  const handleSearch = async () => {
    if (!email.trim()) {
      setError('请输入邮箱地址')
      return
    }

    setSearching(true)
    setError(null)
    setFoundUser(null)

    try {
      // 通过邮箱查找用户（从 auth.users 表）
      const { data: users, error: searchError } = await supabase.rpc('get_user_by_email', {
        user_email: email.trim().toLowerCase()
      })

      if (searchError) {
        // 如果 RPC 不存在，尝试直接查询（需要合适的权限）
        const { data: { users: authUsers }, error: authError } = await supabase.auth.admin.listUsers()
        
        if (authError) {
          throw new Error('无法搜索用户，请确保您有足够的权限')
        }

        const foundAuthUser = authUsers?.find(u => u.email === email.trim().toLowerCase())
        if (!foundAuthUser) {
          throw new Error('未找到该用户')
        }

        // 获取 profile 信息
        const { data: profile } = await supabase
          .from('profiles')
          .select('display_name')
          .eq('id', foundAuthUser.id)
          .single()

        setFoundUser({
          id: foundAuthUser.id,
          email: foundAuthUser.email || '',
          display_name: profile?.display_name || null
        })
        return
      }

      if (!users || users.length === 0) {
        throw new Error('未找到该用户')
      }

      setFoundUser(users[0])

      // 检查是否已经是验证者
      const { data: existingVerifier } = await supabase
        .from('verifiers')
        .select('id')
        .eq('user_id', users[0].id)
        .single()

      if (existingVerifier) {
        throw new Error('该用户已经是验证者')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '搜索失败')
    } finally {
      setSearching(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!foundUser) return

    setSubmitting(true)
    setError(null)

    try {
      const { error: insertError } = await supabase.from('verifiers').insert({
        user_id: foundUser.id,
      })

      if (insertError) throw insertError

      // 记录日志
      await supabase.from('admin_logs').insert({
        admin_id: adminId,
        action: 'add_verifier',
        details: { user_id: foundUser.id, email: foundUser.email },
      })

      onSuccess()
    } catch (err) {
      setError(err instanceof Error ? err.message : '添加失败')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <DialogHeader>
        <DialogTitle>添加验证者</DialogTitle>
        <DialogDescription>通过邮箱地址搜索并添加新的验证者</DialogDescription>
      </DialogHeader>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">
            用户邮箱 <span className="text-destructive">*</span>
          </Label>
          <div className="flex gap-2">
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value)
                setFoundUser(null)
                setError(null)
              }}
              placeholder="user@example.com"
              className="flex-1"
            />
            <Button type="button" onClick={handleSearch} disabled={searching} className="gap-2">
              <Search className="h-4 w-4" />
              {searching ? '搜索中...' : '搜索'}
            </Button>
          </div>
        </div>

        {foundUser && (
          <Card className="border-chart-2/50 bg-chart-2/5">
            <CardContent className="p-4 space-y-2">
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-chart-2" />
                <span className="font-medium text-chart-2">找到用户</span>
              </div>
              <p className="text-sm">
                <strong>昵称:</strong> {foundUser.display_name || '未设置'}
              </p>
              <p className="text-sm">
                <strong>邮箱:</strong> {foundUser.email}
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
        <Button type="submit" disabled={!foundUser || submitting}>
          {submitting ? '添加中...' : '添加为验证者'}
        </Button>
      </DialogFooter>
    </form>
  )
}
