'use client'

import { useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { AlertCircle, RefreshCw } from 'lucide-react'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('Application error:', error)
  }, [error])

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10">
        <AlertCircle className="h-8 w-8 text-destructive" />
      </div>
      <h1 className="mt-6 text-2xl font-bold text-foreground">出错了</h1>
      <p className="mt-2 max-w-md text-center text-muted-foreground">
        抱歉，页面加载时发生了意外错误。请刷新页面或稍后再试。
      </p>
      <div className="mt-6 flex gap-3">
        <Button onClick={() => reset()} className="gap-2">
          <RefreshCw className="h-4 w-4" />
          重新加载
        </Button>
        <Button variant="outline" onClick={() => (window.location.href = '/')}>
          返回首页
        </Button>
      </div>
    </div>
  )
}
