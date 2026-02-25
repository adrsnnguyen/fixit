interface StepProgressBarProps {
  totalSteps: number
  currentStep: number // 1-indexed
}

export function StepProgressBar({ totalSteps, currentStep }: StepProgressBarProps) {
  return (
    <div className="flex items-center gap-2 px-6 py-4">
      {Array.from({ length: totalSteps }, (_, i) => {
        const step = i + 1
        const isCompleted = step < currentStep
        const isActive = step === currentStep
        return (
          <div key={step} className="flex items-center gap-2 flex-1">
            <div
              className={[
                'w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold shrink-0 transition-colors',
                isCompleted
                  ? 'bg-success text-white'
                  : isActive
                    ? 'bg-primary text-white'
                    : 'bg-border text-muted',
              ].join(' ')}
            >
              {isCompleted ? '✓' : step}
            </div>
            {i < totalSteps - 1 && (
              <div
                className={[
                  'flex-1 h-0.5 transition-colors',
                  isCompleted ? 'bg-success' : 'bg-border',
                ].join(' ')}
              />
            )}
          </div>
        )
      })}
    </div>
  )
}
