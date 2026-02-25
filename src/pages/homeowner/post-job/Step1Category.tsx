import toast from 'react-hot-toast'
import {
  Droplets,
  Zap,
  Wind,
  Hammer,
  Paintbrush,
  Home,
  Leaf,
  Wrench,
  HelpCircle,
} from 'lucide-react'
import type { JobDraft } from './PostJobPage'
import { CATEGORIES } from './categories'

interface Props {
  draft: JobDraft
  onChange: (partial: Partial<JobDraft>) => void
  onNext: () => void
}

const ICONS: Record<string, React.ReactNode> = {
  plumbing: <Droplets className="w-6 h-6" />,
  electrical: <Zap className="w-6 h-6" />,
  hvac: <Wind className="w-6 h-6" />,
  handyman: <Hammer className="w-6 h-6" />,
  painting: <Paintbrush className="w-6 h-6" />,
  roofing: <Home className="w-6 h-6" />,
  landscaping: <Leaf className="w-6 h-6" />,
  carpentry: <Wrench className="w-6 h-6" />,
  other: <HelpCircle className="w-6 h-6" />,
}

export function Step1Category({ draft, onChange, onNext }: Props) {
  const handleNext = () => {
    if (!draft.category) {
      return toast.error('Select a category')
    }
    onNext()
  }

  return (
    <div className="flex-1 flex flex-col px-6 pb-8">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-foreground mb-1">What do you need help with?</h2>
        <p className="text-sm text-muted">Choose the category that best fits your job.</p>
      </div>

      <div className="grid grid-cols-3 gap-3 mb-8">
        {CATEGORIES.map(({ key, label }) => {
          const isSelected = draft.category === key
          return (
            <button
              key={key}
              onClick={() => onChange({ category: key })}
              className={[
                'flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition-colors active:scale-95',
                isSelected
                  ? 'border-primary bg-primary/5 text-primary'
                  : 'border-border text-muted hover:border-primary/40',
              ].join(' ')}
            >
              {ICONS[key]}
              <span className="text-xs font-medium text-center leading-tight">{label}</span>
            </button>
          )
        })}
      </div>

      <button
        onClick={handleNext}
        className="w-full py-3.5 bg-primary text-white font-semibold rounded-xl hover:bg-primary-hover active:scale-[0.98] transition-all"
      >
        Continue
      </button>
    </div>
  )
}
