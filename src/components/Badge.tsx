interface BadgeProps {
  children: React.ReactNode
  variant?: 'primary' | 'success' | 'warning' | 'muted' | 'danger'
}

const VARIANT_CLASSES: Record<NonNullable<BadgeProps['variant']>, string> = {
  primary: 'bg-primary/10 text-primary',
  success: 'bg-success/10 text-success',
  warning: 'bg-warning/10 text-warning',
  muted: 'bg-border text-muted',
  danger: 'bg-red-50 text-red-600',
}

export function Badge({ children, variant = 'muted' }: BadgeProps) {
  return (
    <span
      className={[
        'inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium',
        VARIANT_CLASSES[variant],
      ].join(' ')}
    >
      {children}
    </span>
  )
}
