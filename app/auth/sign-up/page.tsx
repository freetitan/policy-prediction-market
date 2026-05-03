'use client'

import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { WELCOME_BONUS } from '@/lib/types'
import { TrendingUp, ArrowLeft, Gift } from 'lucide-react'

export default function SignUpPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [repeatPassword, setRepeatPassword] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    const supabase = createClient()
    setIsLoading(true)
    setError(null)

    if (password !== repeatPassword) {
      setError('两次输入的密码不一致')
      setIsLoading(false)
      return
    }

    if (password.length < 6) {
      setError('密码长度至少为6位')
      setIsLoading(false)
      return
    }

    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo:
            process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL ??
            `${window.location.origin}/auth/callback`,
          data: {
            display_name: displayName || email.split('@')[0],
          },
        },
      })
      if (error) throw error
      router.push('/auth/sign-up-success')
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : '注册失败，请重试')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="border-b border-border bg-card">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link href="/" className="flex items-center gap-2 text-foreground">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
              <TrendingUp className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="text-lg font-semibold tracking-tight">政策预测</span>
          </Link>
        </div>
      </header>

      <main className="flex flex-1 items-center justify-center p-6">
        <div className="w-full max-w-md">
          <Link
            href="/"
            className="mb-6 inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            返回首页
          </Link>

          <Card>
            <CardHeader className="text-center">
              <CardTitle className="text-2xl">创建账户</CardTitle>
              <CardDescription>
                注册账户，开始您的政策预测之旅
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="mb-6 flex items-center justify-center gap-2 rounded-lg bg-chart-3/10 p-3 text-sm">
                <Gift className="h-5 w-5 text-chart-3" />
                <span className="text-foreground">
                   注册即送 <strong>{WELCOME_BONUS.toLocaleString()} 积分</strong>
                </span>
              </div>

              <form onSubmit={handleSignUp}>
                <div className="flex flex-col gap-5">
                  <div className="grid gap-2">
                    <Label htmlFor="displayName">昵称（选填）</Label>
                    <Input
                      id="displayName"
                      type="text"
                      placeholder="给自己起个名字"
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="email">邮箱</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="your@email.com"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="password">密码</Label>
                    <Input
                      id="password"
                      type="password"
                      placeholder="至少6位字符"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="repeat-password">确认密码</Label>
                    <Input
                      id="repeat-password"
                      type="password"
                      placeholder="再次输入密码"
                      required
                      value={repeatPassword}
                      onChange={(e) => setRepeatPassword(e.target.value)}
                    />
                  </div>
                  {error && (
                    <p className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
                      {error}
                    </p>
                  )}
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? '注册中...' : '注册'}
                  </Button>
                </div>
                <div className="mt-6 text-center text-sm">
                  已有账户？{' '}
                  <Link
                    href="/auth/login"
                    className="font-medium text-primary underline underline-offset-4"
                  >
                    立即登录
                  </Link>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
