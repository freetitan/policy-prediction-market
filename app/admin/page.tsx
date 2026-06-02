import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Navbar } from '@/components/navbar'
import { AdminStats } from '@/components/admin/admin-stats'
import { MarketManagement } from '@/components/admin/market-management'
import { UserManagement } from '@/components/admin/user-management'
import { VerifierManagement } from '@/components/admin/verifier-management'
import { Card, CardContent } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ShieldCheck, Users, TrendingUp, Shield } from 'lucide-react'

export default async function AdminPage() {
  const supabase = await createClient()

  // 检查用户是否登录
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/auth/login')
  }

  // 检查是否为管理员
  const { data: admin } = await supabase
    .from('admins')
    .select('*')
    .eq('user_id', user.id)
    .eq('active', true)
    .single()

  if (!admin) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <Card className="mx-auto max-w-2xl">
            <CardContent className="flex flex-col items-center gap-4 py-16">
              <Shield className="h-16 w-16 text-muted-foreground" />
              <h2 className="text-2xl font-bold">访问被拒绝</h2>
              <p className="text-center text-muted-foreground">
                此页面仅供管理员访问。
                <br />
                如需管理员权限，请联系系统管理员。
              </p>
            </CardContent>
          </Card>
        </main>
      </div>
    )
  }

  // 更新最后登录时间
  await supabase
    .from('admins')
    .update({ last_login: new Date().toISOString() })
    .eq('id', admin.id)

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Shield className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold text-foreground">管理员控制台</h1>
          </div>
          <p className="text-muted-foreground">
            欢迎，{admin.username}
            {admin.role === 'super_admin' && ' (超级管理员)'}
          </p>
        </div>

        {/* Stats */}
        <AdminStats />

        {/* Management Tabs */}
        <Tabs defaultValue="markets" className="mt-8">
          <TabsList className="grid w-full grid-cols-3 lg:w-auto lg:inline-grid">
            <TabsTrigger value="markets" className="gap-2">
              <TrendingUp className="h-4 w-4" />
              <span className="hidden sm:inline">市场管理</span>
              <span className="sm:hidden">市场</span>
            </TabsTrigger>
            <TabsTrigger value="verifiers" className="gap-2">
              <ShieldCheck className="h-4 w-4" />
              <span className="hidden sm:inline">验证者管理</span>
              <span className="sm:hidden">验证者</span>
            </TabsTrigger>
            <TabsTrigger value="users" className="gap-2">
              <Users className="h-4 w-4" />
              <span className="hidden sm:inline">用户管理</span>
              <span className="sm:hidden">用户</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="markets" className="mt-6">
            <MarketManagement adminId={admin.id} />
          </TabsContent>

          <TabsContent value="verifiers" className="mt-6">
            <VerifierManagement adminId={admin.id} />
          </TabsContent>

          <TabsContent value="users" className="mt-6">
            <UserManagement adminId={admin.id} />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
