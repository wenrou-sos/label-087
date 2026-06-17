'use client'

interface SummaryFormProps {
  value: string
  onChange: (value: string) => void
}

const MIN_LENGTH = 20

export default function SummaryForm({ value, onChange }: SummaryFormProps) {
  const isValid = value.length >= MIN_LENGTH

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-text-secondary">处置总结</label>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="请输入处置总结，至少20个字符..."
        rows={8}
        className="w-full resize-none rounded-lg border border-border bg-bg-tertiary px-3 py-2.5 text-sm text-text-primary placeholder-text-muted outline-none transition-colors focus:border-accent-blue"
      />
      <div className="flex items-center justify-between text-xs">
        <span className={isValid ? 'text-accent-green' : value.length > 0 ? 'text-accent-amber' : 'text-text-muted'}>
          {value.length < MIN_LENGTH
            ? `还需输入 ${MIN_LENGTH - value.length} 个字符`
            : '字数满足要求'}
        </span>
        <span className="text-text-muted">{value.length} 字</span>
      </div>
    </div>
  )
}
