import { useRef, useEffect, useState } from 'react'
import type { FieldDefinition } from '../../types/form'
import { useT } from '../../lib/i18n'

interface FieldRendererProps {
  field: FieldDefinition
  value: unknown
  onChange: (value: unknown) => void
  accentColor?: string
  error?: string
}

const inputBase =
  'w-full rounded-input border border-[rgba(73,136,196,0.25)] bg-white px-3 py-2.5 text-sm text-[#0f2854] placeholder:text-[#4988c4]/50 focus:outline-none focus:border-[#4988c4] transition-colors'

export function FieldRenderer({
  field,
  value,
  onChange,
  accentColor = '#1C4D8D',
  error,
}: FieldRendererProps) {
  const t = useT()
  const str = value == null ? '' : String(value)

  const labelEl = (
    <label className="flex items-start gap-1 mb-1.5">
      <span className="text-sm font-normal text-[#0f2854]">{field.label}</span>
      {field.required && <span className="text-red-400 text-xs leading-none mt-0.5">*</span>}
    </label>
  )

  const helpEl = field.helpText ? (
    <p className="text-[11px] text-[#4988c4]/70 mt-1">{field.helpText}</p>
  ) : null

  const errorEl = error ? (
    <p className="text-[11px] text-red-500 mt-1">{error}</p>
  ) : null

  if (field.type === 'section_divider') {
    return (
      <div className="flex items-center gap-3 py-2">
        <div className="h-px flex-1 bg-rule" />
        {field.content && (
          <span
            className="shrink-0 font-mono text-[10px] font-medium uppercase tracking-[0.15em]"
            style={{ color: accentColor }}
          >
            {field.content}
          </span>
        )}
        <div className="h-px flex-1 bg-rule" />
      </div>
    )
  }

  if (field.type === 'statement') {
    return (
      <div className="py-3 px-4 rounded-input bg-[rgba(189,232,245,0.2)] border border-[rgba(73,136,196,0.15)]">
        <p className="text-sm text-[#0f2854]/80 leading-relaxed whitespace-pre-wrap">
          {field.content}
        </p>
      </div>
    )
  }

  if (field.type === 'short_text') {
    return (
      <div>
        {labelEl}
        <input
          type="text"
          value={str}
          placeholder={field.placeholder}
          onChange={(e) => onChange(e.target.value)}
          className={[inputBase, error ? 'border-red-400' : ''].join(' ')}
        />
        {helpEl}
        {errorEl}
      </div>
    )
  }

  if (field.type === 'long_text') {
    return (
      <div>
        {labelEl}
        <textarea
          value={str}
          placeholder={field.placeholder}
          onChange={(e) => onChange(e.target.value)}
          rows={4}
          className={[inputBase, 'resize-y', error ? 'border-red-400' : ''].join(' ')}
        />
        {helpEl}
        {errorEl}
      </div>
    )
  }

  if (field.type === 'email') {
    return (
      <div>
        {labelEl}
        <input
          type="email"
          value={str}
          placeholder={field.placeholder ?? t('field_renderer.email_placeholder')}
          onChange={(e) => onChange(e.target.value)}
          className={[inputBase, error ? 'border-red-400' : ''].join(' ')}
        />
        {helpEl}
        {errorEl}
      </div>
    )
  }

  if (field.type === 'number') {
    return (
      <div>
        {labelEl}
        <input
          type="number"
          value={str}
          placeholder={field.placeholder}
          onChange={(e) => onChange(e.target.value)}
          className={[inputBase, error ? 'border-red-400' : ''].join(' ')}
        />
        {helpEl}
        {errorEl}
      </div>
    )
  }

  if (field.type === 'date') {
    return (
      <div>
        {labelEl}
        <input
          type="date"
          value={str}
          onChange={(e) => onChange(e.target.value)}
          className={[inputBase, error ? 'border-red-400' : ''].join(' ')}
        />
        {helpEl}
        {errorEl}
      </div>
    )
  }

  if (field.type === 'datetime') {
    return (
      <div>
        {labelEl}
        <input
          type="datetime-local"
          value={str}
          onChange={(e) => onChange(e.target.value)}
          className={[inputBase, error ? 'border-red-400' : ''].join(' ')}
        />
        {helpEl}
        {errorEl}
      </div>
    )
  }

  if (field.type === 'single_select') {
    const opts = field.options ?? []
    return (
      <div>
        {labelEl}
        <div className="flex flex-col gap-2">
          {opts.map((opt) => (
            <label key={opt} className="flex items-center gap-2.5 cursor-pointer">
              <input
                type="radio"
                name={field.id}
                value={opt}
                checked={str === opt}
                onChange={() => onChange(opt)}
                className="sr-only"
              />
              <span
                className={[
                  'w-4 h-4 rounded-full border-2 flex items-center justify-center transition-colors shrink-0',
                  str === opt ? 'border-[var(--accent)]' : 'border-[rgba(73,136,196,0.4)]',
                ].join(' ')}
                style={{ '--accent': accentColor } as React.CSSProperties}
              >
                {str === opt && (
                  <span
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: accentColor }}
                  />
                )}
              </span>
              <span className="text-sm text-[#0f2854]/80">{opt}</span>
            </label>
          ))}
        </div>
        {helpEl}
        {errorEl}
      </div>
    )
  }

  if (field.type === 'multi_select') {
    const opts = field.options ?? []
    const selected = Array.isArray(value) ? (value as string[]) : []

    function toggle(opt: string) {
      const next = selected.includes(opt)
        ? selected.filter((s) => s !== opt)
        : [...selected, opt]
      onChange(next)
    }

    return (
      <div>
        {labelEl}
        <div className="flex flex-col gap-2">
          {opts.map((opt) => {
            const checked = selected.includes(opt)
            return (
              <label key={opt} className="flex items-center gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() => toggle(opt)}
                  className="sr-only"
                />
                <span
                  className={[
                    'w-4 h-4 rounded-[3px] border-2 flex items-center justify-center transition-colors shrink-0',
                    checked ? 'border-[var(--accent)] bg-[var(--accent)]' : 'border-[rgba(73,136,196,0.4)] bg-white',
                  ].join(' ')}
                  style={{ '--accent': accentColor } as React.CSSProperties}
                >
                  {checked && (
                    <svg width="9" height="7" viewBox="0 0 9 7" fill="none">
                      <path
                        d="M1 3.5L3.5 6L8 1"
                        stroke="white"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  )}
                </span>
                <span className="text-sm text-[#0f2854]/80">{opt}</span>
              </label>
            )
          })}
        </div>
        {helpEl}
        {errorEl}
      </div>
    )
  }

  if (field.type === 'file_upload') {
    return (
      <div>
        {labelEl}
        <label
          className={[
            'flex flex-col items-center justify-center gap-2 rounded-input border border-dashed py-8 cursor-pointer transition-colors',
            error
              ? 'border-red-400 bg-red-50'
              : 'border-[rgba(73,136,196,0.3)] bg-[rgba(189,232,245,0.1)] hover:bg-[rgba(189,232,245,0.25)]',
          ].join(' ')}
        >
          <span className="text-[#4988c4] text-sm font-light">
            {value ? String(value) : t('field_renderer.upload_hint')}
          </span>
          {field.acceptTypes && (
            <span className="font-mono text-[10px] uppercase tracking-widest text-[#4988c4]/60">
              {field.acceptTypes}
            </span>
          )}
          <input
            type="file"
            accept={field.acceptTypes}
            className="sr-only"
            onChange={(e) => {
              const file = e.target.files?.[0]
              onChange(file ? file.name : null)
            }}
          />
        </label>
        {helpEl}
        {errorEl}
      </div>
    )
  }

  if (field.type === 'signature') {
    return (
      <SignatureField
        field={field}
        value={str}
        onChange={onChange}
        accentColor={accentColor}
        error={error}
      />
    )
  }

  return null
}

function SignatureField({
  field,
  value,
  onChange,
  accentColor,
  error,
}: {
  field: FieldDefinition
  value: string
  onChange: (v: unknown) => void
  accentColor: string
  error?: string
}) {
  const t = useT()
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const drawing = useRef(false)
  const [isEmpty, setIsEmpty] = useState(!value)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    if (value) {
      const img = new Image()
      img.onload = () => ctx.drawImage(img, 0, 0)
      img.src = value
    }
  }, [])

  function getPos(e: React.MouseEvent | React.TouchEvent, canvas: HTMLCanvasElement) {
    const rect = canvas.getBoundingClientRect()
    const scaleX = canvas.width / rect.width
    const scaleY = canvas.height / rect.height
    if ('touches' in e) {
      const touch = e.touches[0]
      if (!touch) return { x: 0, y: 0 }
      return {
        x: (touch.clientX - rect.left) * scaleX,
        y: (touch.clientY - rect.top) * scaleY,
      }
    }
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY,
    }
  }

  function startDraw(e: React.MouseEvent | React.TouchEvent) {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    drawing.current = true
    const pos = getPos(e, canvas)
    ctx.beginPath()
    ctx.moveTo(pos.x, pos.y)
    e.preventDefault()
  }

  function draw(e: React.MouseEvent | React.TouchEvent) {
    if (!drawing.current) return
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    const pos = getPos(e, canvas)
    ctx.lineTo(pos.x, pos.y)
    ctx.strokeStyle = accentColor
    ctx.lineWidth = 2
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'
    ctx.stroke()
    setIsEmpty(false)
    e.preventDefault()
  }

  function stopDraw() {
    if (!drawing.current) return
    drawing.current = false
    const canvas = canvasRef.current
    if (!canvas) return
    onChange(canvas.toDataURL())
  }

  function clear() {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    setIsEmpty(true)
    onChange(null)
  }

  return (
    <div>
      <label className="flex items-start gap-1 mb-1.5">
        <span className="text-sm font-normal text-[#0f2854]">{field.label}</span>
        {field.required && <span className="text-red-400 text-xs leading-none mt-0.5">*</span>}
      </label>
      <div
        className={[
          'rounded-input border overflow-hidden',
          error ? 'border-red-400' : 'border-[rgba(73,136,196,0.25)]',
        ].join(' ')}
      >
        <canvas
          ref={canvasRef}
          width={600}
          height={160}
          className="w-full h-32 bg-[rgba(189,232,245,0.08)] cursor-crosshair touch-none"
          onMouseDown={startDraw}
          onMouseMove={draw}
          onMouseUp={stopDraw}
          onMouseLeave={stopDraw}
          onTouchStart={startDraw}
          onTouchMove={draw}
          onTouchEnd={stopDraw}
        />
        <div className="flex items-center justify-between px-3 py-1.5 bg-white border-t border-[rgba(73,136,196,0.1)]">
          <span className="font-mono text-[10px] uppercase tracking-widest text-[#4988c4]/60">
            {isEmpty ? t('field_renderer.signature_draw') : t('field_renderer.signature_captured')}
          </span>
          {!isEmpty && (
            <button
              type="button"
              onClick={clear}
              className="text-[11px] text-[#4988c4] hover:text-[#0f2854] transition-colors"
            >
              {t('field_renderer.clear')}
            </button>
          )}
        </div>
      </div>
      {field.helpText && <p className="text-[11px] text-[#4988c4]/70 mt-1">{field.helpText}</p>}
      {error && <p className="text-[11px] text-red-500 mt-1">{error}</p>}
    </div>
  )
}
