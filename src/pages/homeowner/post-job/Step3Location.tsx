import toast from 'react-hot-toast'
import type { JobDraft } from './PostJobPage'

interface Props {
  draft: JobDraft
  onChange: (partial: Partial<JobDraft>) => void
  onNext: () => void
  onBack: () => void
}

export function Step3Location({ draft, onChange, onNext, onBack }: Props) {
  const handleNext = () => {
    if (!/^\d{5}$/.test(draft.zip_code)) {
      return toast.error('Enter a valid 5-digit zip code')
    }
    onNext()
  }

  return (
    <div className="flex-1 flex flex-col px-6 pb-8 space-y-5">
      <div>
        <h2 className="text-xl font-bold text-foreground mb-1">Where is the job?</h2>
        <p className="text-sm text-muted">Help contractors know if they serve your area.</p>
      </div>

      {/* Address */}
      <div>
        <label className="block text-sm font-medium text-foreground mb-1.5">
          Street address <span className="text-muted text-xs font-normal">(optional)</span>
        </label>
        <input
          type="text"
          value={draft.address}
          onChange={(e) => onChange({ address: e.target.value })}
          placeholder="123 Main St"
          className="w-full px-3 py-2.5 rounded-xl border border-border bg-background text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors text-sm"
        />
        <p className="text-xs text-muted mt-1">Only shared with a contractor after you accept their quote.</p>
      </div>

      {/* Zip */}
      <div>
        <label className="block text-sm font-medium text-foreground mb-1.5">
          Zip code <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          inputMode="numeric"
          value={draft.zip_code}
          onChange={(e) => onChange({ zip_code: e.target.value.replace(/\D/g, '').slice(0, 5) })}
          placeholder="78701"
          maxLength={5}
          className="w-full px-3 py-2.5 rounded-xl border border-border bg-background text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors text-sm"
        />
      </div>

      {/* Actions */}
      <div className="flex gap-3 pt-2">
        <button
          onClick={onBack}
          className="flex-1 py-3 border border-border text-foreground font-semibold rounded-xl hover:border-foreground active:scale-[0.98] transition-all text-sm"
        >
          Back
        </button>
        <button
          onClick={handleNext}
          className="flex-1 py-3 bg-primary text-white font-semibold rounded-xl hover:bg-primary-hover active:scale-[0.98] transition-all text-sm"
        >
          Continue
        </button>
      </div>
    </div>
  )
}
