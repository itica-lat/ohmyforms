interface ToggleProps {
  checked: boolean
  onChange: (v: boolean) => void
  label?: string
  id?: string
}

export function Toggle({ checked, onChange, label, id }: ToggleProps) {
  return (
    <label
      htmlFor={id}
      className="flex items-center gap-2 cursor-pointer select-none"
    >
      <button
        id={id}
        role="switch"
        type="button"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={[
          'relative w-9 h-5 rounded-full transition-colors border',
          checked ? 'bg-blue border-blue' : 'bg-white border-[rgba(73,136,196,0.3)]',
        ].join(' ')}
      >
        <span
          className={[
            'absolute top-0.5 w-4 h-4 rounded-full transition-transform bg-white shadow-[0_1px_3px_rgba(0,0,0,0.15)]',
            checked ? 'translate-x-4' : 'translate-x-0.5',
          ].join(' ')}
        />
      </button>
      {label && (
        <span className="text-sm text-navy font-light">{label}</span>
      )}
    </label>
  )
}
