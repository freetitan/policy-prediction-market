import Link from 'next/link'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { WELCOME_BONUS } from '@/lib/types'
import { TrendingUp, Mail, ArrowRight } from 'lucide-react'

export default function SignUpSuccessPage() {
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
        <Card className="max-w-md text-center">
          <CardHeader>
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-chart-2/10">
              <Mail className="h-8 w-8 text-chart-2" />
            </div>
            <CardTitle className="text-2xl">注册成功</CardTitle>
            <CardDescription className="text-base">
              我们已向您的邮箱发送了一封验证邮件
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="rounded-lg bg-secondary p-4 text-sm text-muted-foreground">
              <p>请检查您的邮箱并点击验证链接完成注册。</p>
              <p className="mt-2">              验证后您将获得 {WELCOME_BONUS.toLocaleString()} 积分奖励。</p>
            </div>
            <div className="flex flex-col gap-3">
              <Button asChild>
                <Link href="/auth/login">
                  前往登录
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/">返回首页</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
