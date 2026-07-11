'use client'

import { useState, useEffect } from 'react'
import { Search, SlidersHorizontal, X } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'

export type SortOption = 'newest' | 'ending' | 'volume' | 'participants'
export type StatusFilter = 'all' | 'active' | 'closing' | 'closed' | 'resolved'

export interface SearchFilters {
  query: string
  sortBy: SortOption
  status: StatusFilter
}

interface MarketSearchProps {
  onFiltersChange: (filters: SearchFilters) => void
  initialFilters?: Partial<SearchFilters>
}

const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: 'newest', label: '最新发布' },
  { value: 'ending', label: '即将截止' },
  { value: 'volume', label: '投注量最高' },
  { value: 'participants', label: '参与人数最多' },
]

const STATUS_OPTIONS: { value: StatusFilter; label: string; description: string }[] = [
  { value: 'all', label: '全部', description: '显示所有市场' },
  { value: 'active', label: '进行中', description: '可以投注' },
  { value: 'closing', label: '即将截止', description: '剩余不足7天' },
  { value: 'closed', label: '已截止', description: '等待结算' },
  { value: 'resolved', label: '已结算', description: '显示结果' },
]

export function MarketSearch({ onFiltersChange, initialFilters }: MarketSearchProps) {
  const [query, setQuery] = useState(initialFilters?.query || '')
  const [sortBy, setSortBy] = useState<SortOption>(initialFilters?.sortBy || 'newest')
  const [status, setStatus] = useState<StatusFilter>(initialFilters?.status || 'all')
  const [isOpen, setIsOpen] = useState(false)

  // 实时更新过滤器
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      onFiltersChange({ query, sortBy, status })
    }, 300) // 防抖

    return () => clearTimeout(timeoutId)
  }, [query, sortBy, status, onFiltersChange])

  const hasActiveFilters = query !== '' || sortBy !== 'newest' || status !== 'all'
  const activeFilterCount = [
    query !== '',
    sortBy !== 'newest',
    status !== 'all'
  ].filter(Boolean).length

  const handleReset = () => {
    setQuery('')
    setSortBy('newest')
    setStatus('all')
    setIsOpen(false)
  }

  return (
    <div className="flex flex-col gap-3 sm:flex-row">
      {/* 搜索框 */}
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="搜索市场标题或描述..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="pl-9 pr-9"
        />
        {query && (
          <button
            onClick={() => setQuery('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* 高级筛选按钮 */}
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button variant="outline" className="relative gap-2">
            <SlidersHorizontal className="h-4 w-4" />
            <span className="hidden sm:inline">高级筛选</span>
            {activeFilterCount > 0 && (
              <Badge variant="default" className="ml-1 h-5 w-5 p-0 text-xs">
                {activeFilterCount}
              </Badge>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-80" align="end">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-semibold text-sm">筛选和排序</h4>
              {hasActiveFilters && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleReset}
                  className="h-auto p-0 text-xs text-muted-foreground hover:text-foreground"
                >
                  重置
                </Button>
              )}
            </div>

            {/* 排序选项 */}
            <div className="space-y-2">
              <Label htmlFor="sort-by" className="text-xs font-medium">
                排序方式
              </Label>
              <Select value={sortBy} onValueChange={(v) => setSortBy(v as SortOption)}>
                <SelectTrigger id="sort-by">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {SORT_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* 状态筛选 */}
            <div className="space-y-2">
              <Label htmlFor="status-filter" className="text-xs font-medium">
                市场状态
              </Label>
              <Select value={status} onValueChange={(v) => setStatus(v as StatusFilter)}>
                <SelectTrigger id="status-filter">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {STATUS_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      <div className="flex flex-col items-start">
                        <span>{option.label}</span>
                        <span className="text-xs text-muted-foreground">
                          {option.description}
                        </span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* 活跃筛选器显示 */}
            {hasActiveFilters && (
              <div className="space-y-2 border-t pt-3">
                <Label className="text-xs font-medium text-muted-foreground">
                  当前筛选条件
                </Label>
                <div className="flex flex-wrap gap-2">
                  {query && (
                    <Badge variant="secondary" className="gap-1">
                      搜索: {query.slice(0, 20)}
                      {query.length > 20 && '...'}
                      <button
                        onClick={() => setQuery('')}
                        className="ml-1 hover:text-foreground"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  )}
                  {sortBy !== 'newest' && (
                    <Badge variant="secondary" className="gap-1">
                      {SORT_OPTIONS.find(o => o.value === sortBy)?.label}
                      <button
                        onClick={() => setSortBy('newest')}
                        className="ml-1 hover:text-foreground"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  )}
                  {status !== 'all' && (
                    <Badge variant="secondary" className="gap-1">
                      {STATUS_OPTIONS.find(o => o.value === status)?.label}
                      <button
                        onClick={() => setStatus('all')}
                        className="ml-1 hover:text-foreground"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  )}
                </div>
              </div>
            )}
          </div>
        </PopoverContent>
      </Popover>
    </div>
  )
}
