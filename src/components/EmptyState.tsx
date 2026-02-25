interface EmptyStateProps {
  icon: React.ReactNode
  heading: string
  body: string
}

export function EmptyState({ icon, heading, body }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-20 px-6 text-center">
      <div className="w-16 h-16 rounded-2xl bg-border flex items-center justify-center text-muted mb-4">
        {icon}
      </div>
      <h3 className="text-base font-semibold text-foreground mb-1">{heading}</h3>
      <p className="text-sm text-muted max-w-xs">{body}</p>
    </div>
  )
}
