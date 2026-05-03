import Link from 'next/link'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { TrendingUp, AlertCircle, ArrowLeft } from 'lucide-react'

export default function AuthErrorPage() {
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
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10">
              <AlertCircle className="h-8 w-8 text-destructive" />
            </div>
            <CardTitle className="text-2xl">认证失败</CardTitle>
            <CardDescription className="text-base">
              在处理您的请求时出现了问题
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="rounded-lg bg-secondary p-4 text-sm text-muted-foreground">
              <p>可能的原因：</p>
              <ul className="mt-2 list-inside list-disc text-left">
                <li>验证链接已过期</li>
                <li>链接已被使用过</li>
                <li>网络连接问题</li>
              </ul>
            </div>
            <div className="flex flex-col gap-3">
              <Button asChild>
                <Link href="/auth/login">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  返回登录
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
