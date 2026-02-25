import { useState } from 'react'
import toast from 'react-hot-toast'
import { supabase } from '../lib/supabase'

interface Props {
  jobId: string
  raterRole: 'homeowner' | 'contractor'
  onComplete: () => void
}

const HOMEOWNER_QUESTIONS = [
  { label: 'Arrived on time?', field: 'on_time' },
  { label: 'Final price within 10% of quote?', field: 'price_accurate' },
  { label: 'Would hire again?', field: 'would_hire_again' },
] as const

const CONTRACTOR_QUESTIONS = [
  { label: 'Instructions were clear?', field: 'clear_instructions' },
  { label: 'Payment released smoothly?', field: 'payment_smooth' },
  { label: 'Interaction was professional?', field: 'professional_interaction' },
] as const

function YesNoToggle({
  value,
  onChange,
}: {
  value: boolean | null
  onChange: (v: boolean) => void
}) {
  return (
    <div className="flex gap-2">
      <button
        onClick={() => onChange(true)}
        className={[
          'flex-1 py-2 rounded-xl border text-sm font-medium transition-colors',
          value === true
            ? 'border-primary bg-primary/10 text-primary'
            : 'border-border text-muted hover:border-primary/40',
        ].join(' ')}
      >
        Yes
      </button>
      <button
        onClick={() => onChange(false)}
        className={[
          'flex-1 py-2 rounded-xl border text-sm font-medium transition-colors',
          value === false
            ? 'border-primary bg-primary/10 text-primary'
            : 'border-border text-muted hover:border-primary/40',
        ].join(' ')}
      >
        No
      </button>
    </div>
  )
}

export function RatingInterstitial({ jobId, raterRole, onComplete }: Props) {
  const [stars, setStars] = useState(0)
  const [answers, setAnswers] = useState<Record<string, boolean | null>>({
    on_time: null,
    price_accurate: null,
    would_hire_again: null,
    clear_instructions: null,
    payment_smooth: null,
    professional_interaction: null,
  })
  const [comment, setComment] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const questions = raterRole === 'homeowner' ? HOMEOWNER_QUESTIONS : CONTRACTOR_QUESTIONS

  const setAnswer = (field: string, value: boolean) => {
    setAnswers((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async () => {
    if (stars === 0) {
      toast.error('Please select a star rating')
      return
    }
    for (const q of questions) {
      if (answers[q.field] === null) {
        toast.error(`Please answer: "${q.label}"`)
        return
      }
    }

    setSubmitting(true)

    // Fetch job and accepted quote info
    const [jobResult, quoteResult] = await Promise.all([
      supabase.from('jobs').select('homeowner_id').eq('id', jobId).single(),
      supabase
        .from('quotes')
        .select('contractor_id')
        .eq('job_id', jobId)
        .eq('status', 'accepted')
        .maybeSingle(),
    ])

    if (!jobResult.data || !quoteResult.data) {
      toast.error('Could not find job details')
      setSubmitting(false)
      return
    }

    const { error } = await supabase.from('ratings').insert({
      job_id: jobId,
      homeowner_id: jobResult.data.homeowner_id,
      contractor_id: quoteResult.data.contractor_id,
      rating: stars,
      comment: comment.trim() || null,
      rater_role: raterRole,
      on_time: answers.on_time,
      price_accurate: answers.price_accurate,
      would_hire_again: answers.would_hire_again,
      clear_instructions: answers.clear_instructions,
      payment_smooth: answers.payment_smooth,
      professional_interaction: answers.professional_interaction,
    })

    if (error) {
      toast.error(error.message)
      setSubmitting(false)
      return
    }

    toast.success('Thanks for your rating!')
    onComplete()
  }

  return (
    <div className="fixed inset-0 z-50 bg-background flex flex-col overflow-y-auto">
      <div className="max-w-md mx-auto w-full px-6 py-6 space-y-6">
        {/* Header */}
        <div className="pt-4 space-y-1">
          <p className="text-xl font-bold text-foreground">Rate your experience</p>
          <p className="text-sm text-muted">
            {raterRole === 'homeowner'
              ? 'How did your contractor do?'
              : 'How was working with this homeowner?'}
          </p>
        </div>

        {/* Star rating */}
        <div className="space-y-2">
          <p className="text-sm font-medium text-foreground">Overall rating</p>
          <div className="flex gap-2">
            {[1, 2, 3, 4, 5].map((n) => (
              <button
                key={n}
                onClick={() => setStars(n)}
                className={[
                  'text-3xl transition-colors',
                  n <= stars ? 'text-warning' : 'text-border',
                ].join(' ')}
              >
                ★
              </button>
            ))}
          </div>
        </div>

        {/* Y/N questions */}
        <div className="space-y-4">
          {questions.map((q) => (
            <div key={q.field} className="space-y-1.5">
              <p className="text-sm font-medium text-foreground">{q.label}</p>
              <YesNoToggle
                value={answers[q.field]}
                onChange={(v) => setAnswer(q.field, v)}
              />
            </div>
          ))}
        </div>

        {/* Optional comment */}
        <div className="space-y-1.5">
          <p className="text-sm font-medium text-foreground">
            Comments <span className="text-muted font-normal">(optional)</span>
          </p>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            rows={3}
            placeholder="Share anything else about your experience…"
            className="w-full px-4 py-3 rounded-xl border border-border bg-background text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors resize-none text-sm"
          />
        </div>

        {/* Submit */}
        <button
          onClick={handleSubmit}
          disabled={submitting}
          className="w-full py-3 bg-primary text-white font-semibold rounded-xl hover:bg-primary-hover active:scale-[0.98] transition-all disabled:opacity-60"
        >
          {submitting ? 'Submitting…' : 'Submit Rating'}
        </button>
      </div>
    </div>
  )
}
