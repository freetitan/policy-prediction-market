'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { createClient } from '@/lib/supabase/client'
import { useEffect, useRef, useState } from 'react'
import type { User } from '@supabase/supabase-js'
import type { Profile } from '@/lib/types'
import { cn } from '@/lib/utils'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { TrendingUp, User as UserIcon, LogOut, Menu, X, Coins, ShieldCheck, Shield } from 'lucide-react'

export function Navbar() {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const pathname = usePathname()
  const router = useRouter()
  const supabase = useRef(createClient()).current

  useEffect(() => {
    let ignore = false

    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (ignore) return
      setUser(user)

      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single()
        if (!ignore) setProfile(profile)
      }
      if (!ignore) setLoading(false)
    }

    getUser()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (ignore) return
      setUser(session?.user ?? null)
      if (session?.user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single()
        setProfile(profile)
      } else {
        setProfile(null)
      }
    })

    return () => {
      ignore = true
      subscription.unsubscribe()
    }
  }, [supabase])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/')
    router.refresh()
  }

  const [isVerifier, setIsVerifier] = useState(false)
  const [isAdmin, setIsAdmin] = useState(false)

  useEffect(() => {
    if (!user) {
      setIsVerifier(false)
      setIsAdmin(false)
      return
    }
    
    const checkRoles = async () => {
      // 检查是否为验证者
      const { data: verifierData } = await supabase
        .from('verifiers')
        .select('id')
        .eq('user_id', user.id)
        .eq('active', true)
        .single()
      setIsVerifier(!!verifierData)

      // 检查是否为管理员
      const { data: adminData } = await supabase
        .from('admins')
        .select('id')
        .eq('user_id', user.id)
        .eq('active', true)
        .single()
      setIsAdmin(!!adminData)
    }
    
    checkRoles()
  }, [user, supabase])

  const navLinks = [
    { href: '/', label: '市场' },
    { href: '/leaderboard', label: '排行榜' },
    ...(isVerifier ? [{ href: '/verify', label: '验证', icon: ShieldCheck }] : []),
    ...(isAdmin ? [{ href: '/admin', label: '管理', icon: Shield }] : []),
  ]

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80">
      <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center gap-2 text-foreground">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
              <TrendingUp className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="text-lg font-semibold tracking-tight">政策预测</span>
          </Link>
          
          <div className="hidden items-center gap-1 md:flex">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  'rounded-md px-3 py-2 text-sm font-medium transition-colors flex items-center gap-1.5',
                  pathname === link.href
                    ? 'bg-secondary text-foreground'
                    : 'text-muted-foreground hover:bg-secondary/50 hover:text-foreground'
                )}
              >
                {link.icon && <link.icon className="h-4 w-4" />}
                {link.label}
              </Link>
            ))}
          </div>
        </div>

        <div className="hidden items-center gap-4 md:flex">
          {loading ? (
            <div className="h-9 w-24 animate-pulse rounded-md bg-secondary" />
          ) : user && profile ? (
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 rounded-full bg-secondary px-3 py-1.5">
                <Coins className="h-4 w-4 text-chart-3" />
                <span className="text-sm font-medium text-foreground">
                  {profile.points.toLocaleString()}
                </span>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="gap-2">
                    <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary text-primary-foreground">
                      <UserIcon className="h-4 w-4" />
                    </div>
                    <span className="max-w-[100px] truncate">
                      {profile.display_name || '用户'}
                    </span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem asChild>
                    <Link href="/profile" className="flex cursor-pointer items-center gap-2">
                      <UserIcon className="h-4 w-4" />
                      个人中心
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={handleSignOut}
                    className="flex cursor-pointer items-center gap-2 text-destructive focus:text-destructive"
                  >
                    <LogOut className="h-4 w-4" />
                    退出登录
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" asChild>
                <Link href="/auth/login">登录</Link>
              </Button>
              <Button size="sm" asChild>
                <Link href="/auth/sign-up">注册</Link>
              </Button>
            </div>
          )}
        </div>

        <button
          className="flex h-10 w-10 items-center justify-center rounded-md text-muted-foreground hover:bg-secondary md:hidden"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </nav>

      {mobileMenuOpen && (
        <div className="border-t border-border bg-card px-4 py-4 md:hidden">
          <div className="flex flex-col gap-2">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className={cn(
                  'rounded-md px-3 py-2 text-sm font-medium transition-colors',
                  pathname === link.href
                    ? 'bg-secondary text-foreground'
                    : 'text-muted-foreground hover:bg-secondary/50 hover:text-foreground'
                )}
              >
                {link.label}
              </Link>
            ))}
            <hr className="my-2 border-border" />
            {user && profile ? (
              <>
                <div className="flex items-center justify-between px-3 py-2">
                  <span className="text-sm text-muted-foreground">积分</span>
                  <div className="flex items-center gap-1">
                    <Coins className="h-4 w-4 text-chart-3" />
                    <span className="font-medium">{profile.points.toLocaleString()}</span>
                  </div>
                </div>
                <Link
                  href="/profile"
                  onClick={() => setMobileMenuOpen(false)}
                  className="rounded-md px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-secondary/50 hover:text-foreground"
                >
                  个人中心
                </Link>
                <button
                  onClick={() => {
                    handleSignOut()
                    setMobileMenuOpen(false)
                  }}
                  className="rounded-md px-3 py-2 text-left text-sm font-medium text-destructive hover:bg-secondary/50"
                >
                  退出登录
                </button>
              </>
            ) : (
              <div className="flex flex-col gap-2 pt-2">
                <Button variant="outline" size="sm" asChild className="w-full">
                  <Link href="/auth/login" onClick={() => setMobileMenuOpen(false)}>
                    登录
                  </Link>
                </Button>
                <Button size="sm" asChild className="w-full">
                  <Link href="/auth/sign-up" onClick={() => setMobileMenuOpen(false)}>
                    注册
                  </Link>
                </Button>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  )
}
