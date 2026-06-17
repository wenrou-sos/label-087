'use client'

import { Flame } from 'lucide-react'
import type { FireLevel } from '@/lib/types'
import { cn } from '@/lib/utils'

interface FireLevelSelectorProps {
  value: FireLevel
  onChange: (level: FireLevel) => void
}

const levels: { key: FireLevel; label: string; color: string; bgSelected: string; glow: string; iconSize: number }[] = [
  { key: 'small', label: '小火', color: 'text-green-400', bgSelected: 'bg-green-500/20 border-green-500', glow: 'shadow-[0_0_12px_rgba(16,185,129,0.4)]', iconSize: 14 },
  { key: 'medium', label: '中火', color: 'text-yellow-400', bgSelected: 'bg-yellow-500/20 border-yellow-500', glow: 'shadow-[0_0_12px_rgba(250,173,20,0.4)]', iconSize: 17 },
  { key: 'large', label: '大火', color: 'text-orange-400', bgSelected: 'bg-orange-500/20 border-orange-500', glow: 'shadow-[0_0_12px_rgba(250,84,28,0.4)]', iconSize: 20 },
  { key: 'fierce', label: '猛烈燃烧', color: 'text-red-400', bgSelected: 'bg-red-500/20 border-red-500', glow: 'shadow-[0_0_12px_rgba(245,34,45,0.4)]', iconSize: 23 },
]

export default function FireLevelSelector({ value, onChange }: FireLevelSelectorProps) {
  return (
    <div className="flex gap-3">
      {levels.map((level) => {
        const isSelected = value === level.key
        return (
          <button
            key={level.key}
            type="button"
            onClick={() => onChange(level.key)}
            className={cn(
              'flex items-center gap-2 rounded-lg border px-4 py-2.5 transition-all duration-200',
              isSelected
                ? `${level.bgSelected} ${level.glow} ${level.color}`
                : 'border-border bg-bg-tertiary text-text-muted hover:border-bg-hover hover:text-text-secondary'
            )}
          >
            <Flame size={level.iconSize} />
            <span className="text-sm font-medium">{level.label}</span>
          </button>
        )
      })}
    </div>
  )
}
