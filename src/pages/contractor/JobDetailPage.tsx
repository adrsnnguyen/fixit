import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, CheckCircle, MessageSquare } from 'lucide-react'
import toast from 'react-hot-toast'
import { supabase } from '../../lib/supabase'
import { useContractor } from '../../contexts/ContractorContext'
import { PhotoGallery } from '../../components/PhotoGallery'
import { TrustCard } from '../../components/TrustCard'
import { UrgencyBadge } from '../../components/UrgencyBadge'
import { formatPrice, contractorPayout } from '../../utils/pricing'
import type { JobWithProfile, Availability } from '../../types/database'

const AVAILABILITY_OPTIONS: Availability[] = ['Today', 'Tomorrow', 'This Week', 'Flexible']

const MESSAGE_TEMPLATE = `Hi, I'm interested in this job and have the experience to complete it professionally. I can work around your schedule and ensure quality results. Please feel free to reach out with any questions.`

export default function JobDetailPage() {
  const { jobId } = useParams<{ jobId: string }>()
  const navigate = useNavigate()
  const { contractor } = useContractor()

  const [job, setJob] = useState<JobWithProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [alreadyQuoted, setAlreadyQuoted] = useState(false)
  const [aiMatchReason, setAiMatchReason] = useState<string | null>(null)

  // Quote form state
  const [priceDollars, setPriceDollars] = useState('')
  const [availability, setAvailability] = useState<Availability | null>(null)
  const [message, setMessage] = useState(MESSAGE_TEMPLATE)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (!jobId || !contractor) return

    const fetchData = async () => {
      setLoading(true)

      const [jobResult, quoteResult, matchResult] = await Promise.all([
        supabase
          .from('jobs')
          .select(
            '*, homeowner_profile:profiles!jobs_homeowner_id_fkey(full_name, avatar_url, total_jobs_completed, is_payment_method_on_file, is_phone_verified)',
          )
          .eq('id', jobId)
          .single(),
        supabase
          .from('quotes')
          .select('id, status')
          .eq('job_id', jobId)
          .eq('contractor_id', contractor.id)
          .maybeSingle(),
        supabase
          .from('ai_matches')
          .select('reason')
          .eq('job_id', jobId)
          .eq('contractor_id', contractor.id)
          .maybeSingle(),
      ])

      if (jobResult.data) {
        setJob(jobResult.data as JobWithProfile)
        // Pre-fill price to midpoint of AI range
        const midpoint = Math.round(
          (jobResult.data.ai_price_min_cents + jobResult.data.ai_price_max_cents) / 2,
        )
        setPriceDollars((midpoint / 100).toFixed(0))
      }

      if (quoteResult.data) {
        setAlreadyQuoted(true)
      }

      if (matchResult.data?.reason) {
        setAiMatchReason(matchResult.data.reason)
      }

      setLoading(false)
    }

    fetchData()
  }, [jobId, contractor])

  const priceAmountCents = Math.round(parseFloat(priceDollars || '0') * 100)
  const payoutCents = contractorPayout(priceAmountCents)

  const handleSubmitQuote = async () => {
    if (!job || !contractor) return
    if (!priceDollars || parseFloat(priceDollars) <= 0) {
      return toast.error('Enter a valid price')
    }
    if (!availability) {
      return toast.error('Select your availability')
    }

    setSubmitting(true)

    const { error } = await supabase.from('quotes').insert({
      job_id: job.id,
      contractor_id: contractor.id,
      amount_cents: priceAmountCents,
      message,
      availability,
      status: 'pending',
    })

    if (error) {
      toast.error(error.message)
      setSubmitting(false)
      return
    }

    toast.success('Quote sent!')
    navigate('/contractor/dashboard', { replace: true })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
      </div>
    )
  }

  if (!job) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-6">
        <p className="text-muted text-center">Job not found.</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <div className="bg-surface border-b border-border px-4 pt-4 pb-3 flex items-center gap-3">
        <button
          onClick={() => navigate(-1)}
          className="p-2 -ml-1 rounded-xl text-muted hover:text-foreground hover:bg-background transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="font-bold text-foreground leading-tight line-clamp-1 flex-1">{job.title}</h1>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4 pb-8 space-y-5">
        {/* Job details */}
        <div className="bg-surface border border-border rounded-2xl p-4 space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium text-muted uppercase tracking-wide">
              {job.category.replace(/_/g, ' ')}
            </p>
            <UrgencyBadge urgency={job.urgency} />
          </div>
          <h2 className="font-bold text-foreground text-lg leading-tight">{job.title}</h2>
          <p className="text-sm text-muted leading-relaxed">{job.description}</p>
          <div className="flex items-center gap-3 pt-1">
            <div className="text-sm">
              <span className="text-muted">Estimate: </span>
              <span className="font-semibold text-foreground">
                {formatPrice(job.ai_price_min_cents / 100)}–
                {formatPrice(job.ai_price_max_cents / 100)}
              </span>
            </div>
            <div className="text-sm">
              <span className="text-muted">Zip: </span>
              <span className="font-medium text-foreground">{job.zip_code}</span>
            </div>
          </div>
        </div>

        {/* AI match reason callout */}
        {aiMatchReason && (
          <div className="bg-warning/5 border border-warning/25 rounded-2xl p-4 flex items-start gap-3">
            <span className="text-lg shrink-0">💡</span>
            <div>
              <p className="text-sm font-semibold text-foreground mb-0.5">Matched because</p>
              <p className="text-sm text-muted leading-relaxed">{aiMatchReason}</p>
            </div>
          </div>
        )}

        {/* Photos */}
        {job.photos && job.photos.length > 0 && (
          <div>
            <p className="text-sm font-semibold text-foreground mb-2">Photos</p>
            <PhotoGallery photos={job.photos} alt="Job photo" />
          </div>
        )}

        {/* Homeowner trust card */}
        {job.homeowner_profile && (
          <div>
            <p className="text-sm font-semibold text-foreground mb-2">Posted by</p>
            <TrustCard profile={job.homeowner_profile} />
          </div>
        )}

        {/* Quote sent banner or form */}
        {alreadyQuoted ? (
          <div className="bg-success/5 border border-success/30 rounded-2xl p-4">
            <div className="flex items-center gap-3">
              <CheckCircle className="w-5 h-5 text-success shrink-0" />
              <div>
                <p className="font-semibold text-success">Quote sent</p>
                <p className="text-xs text-muted mt-0.5">
                  You've already submitted a quote for this job.
                </p>
              </div>
            </div>
            <button
              onClick={() => navigate(`/chat/${jobId}`)}
              className="w-full mt-3 py-2 border border-border text-sm font-medium text-foreground rounded-xl hover:border-primary hover:text-primary transition-colors flex items-center justify-center gap-2"
            >
              <MessageSquare className="w-4 h-4" /> Message Homeowner
            </button>
          </div>
        ) : (
          <div className="bg-surface border border-border rounded-2xl p-4 space-y-4">
            <h3 className="font-bold text-foreground">Submit a Quote</h3>

            {/* Price input */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">
                Your price <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted font-medium">
                  $
                </span>
                <input
                  type="number"
                  min="1"
                  step="1"
                  value={priceDollars}
                  onChange={(e) => setPriceDollars(e.target.value)}
                  placeholder="0"
                  className="w-full pl-8 pr-4 py-3 rounded-xl border border-border bg-background text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
                />
              </div>
              {/* Live payout */}
              {priceAmountCents > 0 && (
                <p className="text-xs text-muted mt-1.5">
                  You receive{' '}
                  <span className="font-semibold text-success">
                    {formatPrice(payoutCents / 100)}
                  </span>{' '}
                  after the 13% platform fee
                </p>
              )}
            </div>

            {/* Availability */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Availability <span className="text-red-500">*</span>
              </label>
              <div className="flex flex-wrap gap-2">
                {AVAILABILITY_OPTIONS.map((opt) => (
                  <button
                    key={opt}
                    onClick={() => setAvailability(opt)}
                    className={[
                      'px-3 py-1.5 rounded-full text-xs font-medium border transition-colors',
                      availability === opt
                        ? 'border-primary bg-primary/10 text-primary'
                        : 'border-border text-muted hover:border-primary/50',
                    ].join(' ')}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </div>

            {/* Message */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">
                Message
              </label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={4}
                className="w-full px-4 py-3 rounded-xl border border-border bg-background text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors resize-none text-sm"
              />
            </div>

            <button
              onClick={handleSubmitQuote}
              disabled={submitting}
              className="w-full py-3 bg-primary text-white font-semibold rounded-xl hover:bg-primary-hover active:scale-[0.98] transition-all disabled:opacity-60"
            >
              {submitting ? 'Sending quote…' : 'Send Quote'}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
