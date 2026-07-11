'use client'

import { useState, useMemo } from 'react'
import { MarketCard } from '@/components/market-card'
import { MarketSearch, type SearchFilters } from '@/components/market-search'
import type { Market } from '@/lib/types'
import { BarChart3 } from 'lucide-react'

interface MarketsGridProps {
  markets: Market[]
}

export function MarketsGrid({ markets }: MarketsGridProps) {
  const [filters, setFilters] = useState<SearchFilters>({
    query: '',
    sortBy: 'newest',
    status: 'all'
  })

  // 过滤和排序市场
  const filteredAndSortedMarkets = useMemo(() => {
    let result = [...markets]

    // 搜索过滤
    if (filters.query) {
      const query = filters.query.toLowerCase()
      result = result.filter(market => 
        market.title.toLowerCase().includes(query) ||
        market.description.toLowerCase().includes(query)
      )
    }

    // 状态过滤
    if (filters.status !== 'all') {
      const now = new Date()
      
      result = result.filter(market => {
        const endDate = new Date(market.end_date)
        const daysUntilEnd = Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))

        switch (filters.status) {
          case 'active':
            return !market.resolved && endDate > now && daysUntilEnd > 7
          case 'closing':
            return !market.resolved && endDate > now && daysUntilEnd <= 7
          case 'closed':
            return !market.resolved && endDate <= now
          case 'resolved':
            return market.resolved
          default:
            return true
        }
      })
    }

    // 排序
    switch (filters.sortBy) {
      case 'ending':
        result.sort((a, b) => 
          new Date(a.end_date).getTime() - new Date(b.end_date).getTime()
        )
        break
      case 'volume':
        result.sort((a, b) => {
          const volumeA = (a.yes_pool || 0) + (a.no_pool || 0)
          const volumeB = (b.yes_pool || 0) + (b.no_pool || 0)
          return volumeB - volumeA
        })
        break
      case 'participants':
        // 按参与人数排序（使用积分池作为代理指标）
        result.sort((a, b) => {
          const volumeA = (a.yes_pool || 0) + (a.no_pool || 0)
          const volumeB = (b.yes_pool || 0) + (b.no_pool || 0)
          return volumeB - volumeA
        })
        break
      case 'newest':
      default:
        result.sort((a, b) => 
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        )
        break
    }

    return result
  }, [markets, filters])

  return (
    <div className="space-y-6">
      {/* 搜索和筛选 */}
      <MarketSearch 
        onFiltersChange={setFilters}
        initialFilters={filters}
      />

      {/* 结果统计 */}
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <span>找到 <strong className="text-foreground">{filteredAndSortedMarkets.length}</strong> 个市场</span>
        {filters.query && (
          <span>• 搜索关键词: <strong className="text-foreground">{filters.query}</strong></span>
        )}
      </div>

      {/* 市场网格 */}
      {filteredAndSortedMarkets.length > 0 ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filteredAndSortedMarkets.map((market) => (
            <MarketCard key={market.id} market={market} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-card/50 py-16">
          <BarChart3 className="h-12 w-12 text-muted-foreground/50" />
          <p className="mt-4 text-lg font-medium text-muted-foreground">
            {filters.query ? '未找到匹配的市场' : '暂无相关预测市场'}
          </p>
          <p className="mt-1 text-sm text-muted-foreground/70">
            {filters.query 
              ? '尝试使用不同的关键词或调整筛选条件' 
              : '请选择其他分类或稍后再来'
            }
          </p>
        </div>
      )}
    </div>
  )
}
