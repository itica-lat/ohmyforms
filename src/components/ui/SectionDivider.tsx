interface SectionDividerProps {
  label?: string
  className?: string
}

export function SectionDivider({ label, className = '' }: SectionDividerProps) {
  return (
    <div className={['flex items-center gap-4', className].join(' ')}>
      <div className="h-px flex-1 bg-rule" />
      {label && <span className="label-meta text-navy/40 shrink-0">{label}</span>}
      {!label && <div className="h-px flex-1 bg-rule" />}
      {label && <div className="h-px flex-1 bg-rule" />}
    </div>
  )
}
