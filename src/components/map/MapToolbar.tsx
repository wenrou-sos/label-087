'use client'

import { useState } from 'react'
import { Flame, Droplets, Shield, Route, Ruler } from 'lucide-react'

interface MapToolbarProps {
  selectedTool: string | null
  onToolSelect: (tool: string | null) => void
}

const tools = [
  { key: 'fire', label: '标注火点', icon: Flame, tip: '点击地图标注火点位置' },
  { key: 'water', label: '标注水源', icon: Droplets, tip: '点击地图标注水源位置' },
  { key: 'alert', label: '划定警戒', icon: Shield, tip: '点击地图设置警戒范围' },
  { key: 'route', label: '规划路线', icon: Route, tip: '依次点击起点和终点规划路线' },
  { key: 'measure', label: '测量距离', icon: Ruler, tip: '依次点击两点测量距离' },
] as const

export default function MapToolbar({ selectedTool, onToolSelect }: MapToolbarProps) {
  const [hoveredTool, setHoveredTool] = useState<string | null>(null)

  const handleToolClick = (key: string) => {
    onToolSelect(selectedTool === key ? null : key)
  }

  return (
    <div className="absolute left-4 top-4 z-[1000] flex flex-col gap-1.5">
      {tools.map((tool) => {
        const Icon = tool.icon
        const isActive = selectedTool === tool.key
        const isHovered = hoveredTool === tool.key

        return (
          <div key={tool.key} className="relative">
            <button
              onClick={() => handleToolClick(tool.key)}
              onMouseEnter={() => setHoveredTool(tool.key)}
              onMouseLeave={() => setHoveredTool(null)}
              className={`flex h-10 w-10 items-center justify-center rounded-lg border backdrop-blur-sm transition-all ${
                isActive
                  ? 'border-accent-blue bg-accent-blue/20 text-accent-blue shadow-[0_0_12px_rgba(59,130,246,0.4)]'
                  : 'border-border bg-bg-secondary/90 text-text-secondary hover:bg-bg-hover hover:text-text-primary'
              }`}
              title={tool.label}
            >
              <Icon size={18} />
            </button>

            {(isHovered || isActive) && (
              <div className="absolute left-12 top-1/2 -translate-y-1/2 whitespace-nowrap rounded bg-bg-secondary/95 border border-border px-2.5 py-1 text-xs text-text-primary shadow-lg backdrop-blur-sm">
                {tool.tip}
                <div className="absolute -left-1 top-1/2 -translate-y-1/2 h-2 w-2 rotate-45 border-b border-l border-border bg-bg-secondary/95" />
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
