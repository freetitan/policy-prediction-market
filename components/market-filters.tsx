'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { CATEGORIES, type MarketCategory } from '@/lib/types'
import { cn } from '@/lib/utils'

interface MarketFiltersProps {
  selectedCategory: MarketCategory
}

export function MarketFilters({ selectedCategory }: MarketFiltersProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const handleCategoryChange = (category: MarketCategory) => {
    const params = new URLSearchParams(searchParams.toString())
    if (category === '全部') {
      params.delete('category')
    } else {
      params.set('category', category)
    }
    router.push(`/?${params.toString()}`)
  }

  return (
    <div className="flex flex-wrap gap-2">
      {CATEGORIES.map((category) => (
        <Button
          key={category}
          variant={selectedCategory === category ? 'default' : 'outline'}
          size="sm"
          onClick={() => handleCategoryChange(category)}
          className={cn(
            'transition-all',
            selectedCategory === category && 'shadow-md'
          )}
        >
          {category}
        </Button>
      ))}
    </div>
  )
}
