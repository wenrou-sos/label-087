'use client'

import { DollarSign, Skull, Heart, UserCheck, Minus, Plus } from 'lucide-react'

interface LossFormValue {
  propertyLoss: number
  deaths: number
  injuries: number
  rescued: number
}

interface LossFormProps {
  value: LossFormValue
  onChange: (value: LossFormValue) => void
}

const fields: {
  key: keyof LossFormValue
  label: string
  icon: typeof DollarSign
  min: number
  step: number
}[] = [
  { key: 'propertyLoss', label: '财产损失 (万元)', icon: DollarSign, min: 0, step: 0.01 },
  { key: 'deaths', label: '死亡人数', icon: Skull, min: 0, step: 1 },
  { key: 'injuries', label: '受伤人数', icon: Heart, min: 0, step: 1 },
  { key: 'rescued', label: '被救人数', icon: UserCheck, min: 0, step: 1 },
]

export default function LossForm({ value, onChange }: LossFormProps) {
  const handleChange = (key: keyof LossFormValue, delta: number) => {
    const current = value[key]
    const next = Math.max(fields.find((f) => f.key === key)!.min, +(current + delta).toFixed(2))
    onChange({ ...value, [key]: next })
  }

  const handleInput = (key: keyof LossFormValue, val: string) => {
    const num = val === '' ? 0 : parseFloat(val)
    if (isNaN(num)) return
    const field = fields.find((f) => f.key === key)!
    onChange({ ...value, [key]: Math.max(field.min, num) })
  }

  return (
    <div className="space-y-4">
      {fields.map((field) => {
        const Icon = field.icon
        return (
          <div key={field.key} className="flex items-center gap-3 rounded-lg border border-border bg-bg-tertiary p-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-bg-hover">
              <Icon className="h-5 w-5 text-text-secondary" />
            </div>
            <div className="flex-1">
              <label className="mb-1 block text-sm font-medium text-text-secondary">
                {field.label}
              </label>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleChange(field.key, -field.step)}
                  className="flex h-8 w-8 items-center justify-center rounded border border-border bg-bg-hover text-text-secondary transition-colors hover:bg-border"
                >
                  <Minus className="h-3 w-3" />
                </button>
                <input
                  type="number"
                  min={field.min}
                  step={field.step}
                  value={value[field.key]}
                  onChange={(e) => handleInput(field.key, e.target.value)}
                  className="h-8 w-24 rounded border border-border bg-bg-primary px-2 text-center text-sm text-text-primary outline-none focus:border-accent-blue"
                />
                <button
                  type="button"
                  onClick={() => handleChange(field.key, field.step)}
                  className="flex h-8 w-8 items-center justify-center rounded border border-border bg-bg-hover text-text-secondary transition-colors hover:bg-border"
                >
                  <Plus className="h-3 w-3" />
                </button>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
