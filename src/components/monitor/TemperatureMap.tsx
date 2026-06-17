'use client'

import { useRef, useEffect } from 'react'

interface TemperatureMapProps {
  centerLocation: { lat: number; lng: number }
  radius: number
}

const COLOR_STOPS = [
  { pos: 0, r: 0, g: 0, b: 255 },
  { pos: 0.25, r: 0, g: 200, b: 100 },
  { pos: 0.5, r: 255, g: 255, b: 0 },
  { pos: 0.75, r: 255, g: 140, b: 0 },
  { pos: 1, r: 255, g: 0, b: 0 },
]

function tempToColor(temp: number, minTemp: number, maxTemp: number): { r: number; g: number; b: number } {
  const t = Math.min(Math.max((temp - minTemp) / (maxTemp - minTemp), 0), 1)
  for (let i = 0; i < COLOR_STOPS.length - 1; i++) {
    if (t <= COLOR_STOPS[i + 1].pos) {
      const local = (t - COLOR_STOPS[i].pos) / (COLOR_STOPS[i + 1].pos - COLOR_STOPS[i].pos)
      return {
        r: Math.round(COLOR_STOPS[i].r + (COLOR_STOPS[i + 1].r - COLOR_STOPS[i].r) * local),
        g: Math.round(COLOR_STOPS[i].g + (COLOR_STOPS[i + 1].g - COLOR_STOPS[i].g) * local),
        b: Math.round(COLOR_STOPS[i].b + (COLOR_STOPS[i + 1].b - COLOR_STOPS[i].b) * local),
      }
    }
  }
  return COLOR_STOPS[COLOR_STOPS.length - 1]
}

interface HeatPoint {
  x: number
  y: number
  temp: number
  radius: number
}

function generateHeatPoints(w: number, h: number): HeatPoint[] {
  const points: HeatPoint[] = []
  const cx = w * 0.5
  const cy = h * 0.5
  const baseRadius = Math.min(w, h) * 0.35

  points.push({ x: cx, y: cy, temp: 1200, radius: baseRadius * 0.25 })
  points.push({ x: cx - w * 0.1, y: cy - h * 0.05, temp: 900, radius: baseRadius * 0.2 })
  points.push({ x: cx + w * 0.08, y: cy + h * 0.06, temp: 800, radius: baseRadius * 0.22 })
  points.push({ x: cx - w * 0.15, y: cy + h * 0.1, temp: 600, radius: baseRadius * 0.3 })
  points.push({ x: cx + w * 0.12, y: cy - h * 0.1, temp: 700, radius: baseRadius * 0.18 })
  points.push({ x: cx + w * 0.05, y: cy - h * 0.2, temp: 400, radius: baseRadius * 0.35 })
  points.push({ x: cx - w * 0.08, y: cy + h * 0.18, temp: 350, radius: baseRadius * 0.28 })
  points.push({ x: cx + w * 0.2, y: cy + h * 0.15, temp: 300, radius: baseRadius * 0.3 })
  points.push({ x: cx - w * 0.2, y: cy - h * 0.15, temp: 250, radius: baseRadius * 0.35 })
  points.push({ x: cx, y: cy - h * 0.3, temp: 150, radius: baseRadius * 0.4 })

  for (let i = 0; i < 15; i++) {
    const angle = Math.random() * Math.PI * 2
    const dist = 0.2 + Math.random() * 0.25
    points.push({
      x: cx + Math.cos(angle) * w * dist,
      y: cy + Math.sin(angle) * h * dist,
      temp: 50 + Math.random() * 500,
      radius: baseRadius * (0.15 + Math.random() * 0.25),
    })
  }

  return points
}

export default function TemperatureMap({ centerLocation, radius }: TemperatureMapProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const container = containerRef.current
    const canvas = canvasRef.current
    if (!container || !canvas) return

    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect
        canvas.width = width * window.devicePixelRatio
        canvas.height = height * window.devicePixelRatio
        canvas.style.width = `${width}px`
        canvas.style.height = `${height}px`
        drawHeatmap(canvas, width, height)
      }
    })
    observer.observe(container)
    return () => observer.disconnect()
  }, [centerLocation, radius])

  function drawHeatmap(canvas: HTMLCanvasElement, w: number, h: number) {
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const dpr = window.devicePixelRatio
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)

    ctx.fillStyle = '#0a0a0f'
    ctx.fillRect(0, 0, w, h)

    const points = generateHeatPoints(w, h)
    const minTemp = 20
    const maxTemp = 1200

    ctx.globalCompositeOperation = 'lighter'

    for (const point of points) {
      const color = tempToColor(point.temp, minTemp, maxTemp)
      const gradient = ctx.createRadialGradient(point.x, point.y, 0, point.x, point.y, point.radius)
      gradient.addColorStop(0, `rgba(${color.r},${color.g},${color.b},0.6)`)
      gradient.addColorStop(0.4, `rgba(${color.r},${color.g},${color.b},0.3)`)
      gradient.addColorStop(1, `rgba(${color.r},${color.g},${color.b},0)`)
      ctx.fillStyle = gradient
      ctx.fillRect(0, 0, w, h)
    }

    ctx.globalCompositeOperation = 'source-over'

    ctx.fillStyle = 'rgba(255,255,255,0.7)'
    ctx.font = '10px monospace'
    ctx.textAlign = 'center'
    ctx.fillText(`${centerLocation.lat.toFixed(4)}, ${centerLocation.lng.toFixed(4)}`, w / 2, h - 8)
  }

  const legendItems = [
    { label: '1200°C', color: '#ff0000' },
    { label: '900°C', color: '#ff8c00' },
    { label: '600°C', color: '#ffff00' },
    { label: '300°C', color: '#00c864' },
    { label: '20°C', color: '#0000ff' },
  ]

  return (
    <div className="relative h-full w-full">
      <div ref={containerRef} className="h-full w-full">
        <canvas ref={canvasRef} className="block" />
      </div>
      <div className="absolute right-3 top-3 flex flex-col gap-1 rounded-lg border border-border bg-bg-primary/80 px-2 py-2">
        <span className="mb-1 text-center text-[9px] text-text-muted">温度</span>
        {legendItems.map((item) => (
          <div key={item.label} className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-sm" style={{ backgroundColor: item.color }} />
            <span className="text-[9px] text-text-secondary">{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
