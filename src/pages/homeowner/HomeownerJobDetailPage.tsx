import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Phone, X, MessageSquare } from 'lucide-react'
import toast from 'react-hot-toast'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../contexts/AuthContext'
import { UrgencyBadge } from '../../components/UrgencyBadge'
import { PhotoGallery } from '../../components/PhotoGallery'
import { EmptyState } from '../../components/EmptyState'
import { ContractorBadges } from '../../components/ContractorBadges'
import { formatPrice, calculatePlatformFee } from '../../utils/pricing'
import { CATEGORY_LABELS } from './post-job/categories'
import type { Job, QuoteWithContractor } from '../../types/database'

export default function HomeownerJobDetailPage() {
  const { jobId } = useParams<{ jobId: string }>()
  const navigate = useNavigate()
  const { user } = useAuth()

  const [job, setJob] = useState<Job | null>(null)
  const [quotes, setQuotes] = useState<QuoteWithContractor[]>([])
  const [loading, setLoading] = useState(true)

  // Confirmation modal state
  const [confirmQuote, setConfirmQuote] = useState<QuoteWithContractor | null>(null)
  const [accepting, setAccepting] = useState(false)
  const [paymentConfirmed, setPaymentConfirmed] = useState(false)

  useEffect(() => {
    if (!jobId || !user) return

    const fetchData = async () => {
      setLoading(true)

      const [jobResult, quotesResult, aiMatchResult] = await Promise.all([
        supabase.from('jobs').select('*').eq('id', jobId).single(),
        supabase
          .from('quotes')
          .select(
            '*, contractor:contractors(id, full_name, profile_photo_url, verification_status, rating_avg, rating_count, phone)',
          )
          .eq('job_id', jobId),
        supabase
          .from('ai_matches')
          .select('contractor_id')
          .eq('job_id', jobId)
          .order('created_at', { ascending: true }),
      ])

      if (jobResult.data) setJob(jobResult.data as Job)

      const aiMatchData = (aiMatchResult.data ?? []) as { contractor_id: string }[]

      if (quotesResult.data) {
        const fetchedQuotes = quotesResult.data as QuoteWithContractor[]
        const matchOrder = aiMatchData.map((m) => m.contractor_id)
        fetchedQuotes.sort((a, b) => {
          const ai = matchOrder.indexOf(a.contractor_id)
          const bi = matchOrder.indexOf(b.contractor_id)
          if (ai === -1 && bi === -1) return 0
          if (ai === -1) return 1
          if (bi === -1) return -1
          return ai - bi
        })
        setQuotes(fetchedQuotes)
      }

      setLoading(false)
    }

    fetchData()
  }, [jobId, user])

  const handleAccept = async () => {
    if (!confirmQuote || !job) return
    setAccepting(true)

    // 1. Accept this quote
    const { error: e1 } = await supabase
      .from('quotes')
      .update({ status: 'accepted' })
      .eq('id', confirmQuote.id)

    if (e1) {
      toast.error(e1.message)
      setAccepting(false)
      return
    }

    // 2. Reject all other pending quotes
    await supabase
      .from('quotes')
      .update({ status: 'rejected' })
      .eq('job_id', job.id)
      .neq('id', confirmQuote.id)
      .eq('status', 'pending')

    // 3. Update job status
    await supabase.from('jobs').update({ status: 'matched' }).eq('id', job.id)

    // Optimistic update
    setJob((prev) => (prev ? { ...prev, status: 'matched' } : prev))
    setQuotes((prev) =>
      prev.map((q) => ({
        ...q,
        status: q.id === confirmQuote.id ? 'accepted' : q.status === 'pending' ? 'rejected' : q.status,
      })),
    )

    toast.success('Quote accepted!')
    setConfirmQuote(null)
    setAccepting(false)
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
        <EmptyState
          icon={<span className="text-2xl">🔍</span>}
          heading="Job not found"
          body="This job may have been removed or you don't have access to it."
        />
      </div>
    )
  }

  const platformFee = confirmQuote ? calculatePlatformFee(confirmQuote.amount_cents) : 0

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
        <h1 className="font-bold text-foreground leading-tight line-clamp-1 flex-1">
          {CATEGORY_LABELS[job.category] ?? job.category}
        </h1>
        {job.urgency && <UrgencyBadge urgency={job.urgency} />}
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4 pb-8 space-y-5">
        {/* Payment confirmation banner */}
        {job.status === 'completed' && !paymentConfirmed && (
          <div className="bg-warning/5 border border-warning/30 rounded-2xl p-4 space-y-3">
            <p className="text-sm font-semibold text-foreground">
              Your contractor marked this job complete. Please confirm to release payment.
            </p>
            <button
              onClick={() => {
                setPaymentConfirmed(true)
                toast.success('Payment released! 💸')
              }}
              className="w-full py-2.5 bg-warning text-white text-sm font-semibold rounded-xl hover:opacity-90 active:scale-[0.98] transition-all"
            >
              Confirm Complete
            </button>
            <p className="text-xs text-muted text-center">
              Auto-confirms in 48 hours if no action taken
            </p>
          </div>
        )}
        {job.status === 'completed' && paymentConfirmed && (
          <div className="bg-success/5 border border-success/30 rounded-2xl p-3 text-center">
            <p className="text-sm font-semibold text-success">✅ Payment Released</p>
          </div>
        )}

        {/* Job summary */}
        <div className="bg-surface border border-border rounded-2xl p-4 space-y-3">
          <p className="text-sm text-foreground leading-relaxed">{job.description}</p>
          <div className="flex flex-wrap gap-3 text-xs text-muted">
            <span>
              Estimate:{' '}
              <span className="font-semibold text-foreground">
                {formatPrice(job.ai_price_min_cents / 100)}–{formatPrice(job.ai_price_max_cents / 100)}
              </span>
            </span>
            <span>Postal code: <span className="font-medium text-foreground">{job.zip_code}</span></span>
          </div>
          {job.photos && job.photos.length > 0 && (
            <PhotoGallery photos={job.photos} alt="Job photo" />
          )}
        </div>

        {/* Quotes */}
        <div>
          <h2 className="text-sm font-semibold text-foreground mb-3">
            {quotes.length === 0 ? 'No quotes yet' : `${quotes.length} Quote${quotes.length > 1 ? 's' : ''}`}
          </h2>

          <div className="space-y-3">
            {quotes.map((quote) => {
              const c = quote.contractor
              const isAccepted = quote.status === 'accepted'
              const isRejected = quote.status === 'rejected'
              const canAccept = job.status === 'open' && quote.status === 'pending'

              return (
                <div
                  key={quote.id}
                  className={[
                    'bg-surface border rounded-2xl p-4 space-y-3',
                    isAccepted ? 'border-success/40 bg-success/5' : 'border-border',
                  ].join(' ')}
                >
                  {/* Contractor header */}
                  <div className="flex items-center gap-3">
                    {c.profile_photo_url ? (
                      <img
                        src={c.profile_photo_url}
                        alt={c.full_name}
                        className="w-10 h-10 rounded-full object-cover border border-border shrink-0"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-border flex items-center justify-center text-muted font-bold shrink-0">
                        {c.full_name.charAt(0)}
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-foreground text-sm mb-1">{c.full_name}</p>
                      <ContractorBadges
                        rating_count={c.rating_count}
                        rating_avg={c.rating_avg}
                        verification_status={c.verification_status}
                      />
                      {c.rating_count < 5 && (
                        <p className="text-xs text-muted mt-1">
                          New to FixIt — building their reputation with competitive pricing
                        </p>
                      )}
                    </div>
                    <p className="text-base font-bold text-foreground shrink-0">
                      {formatPrice(quote.amount_cents / 100)}
                    </p>
                  </div>

                  {/* Availability + message */}
                  <div className="space-y-1.5">
                    <p className="text-xs text-muted">
                      Available: <span className="text-foreground font-medium">{quote.availability}</span>
                    </p>
                    {quote.message && (
                      <p className="text-sm text-foreground leading-relaxed">{quote.message}</p>
                    )}
                  </div>

                  {/* Status / actions */}
                  {isAccepted && (
                    <div className="space-y-2">
                      <div className="bg-success/10 border border-success/30 rounded-xl p-3 flex items-center gap-2">
                        <Phone className="w-4 h-4 text-success shrink-0" />
                        <div>
                          <p className="text-xs font-semibold text-success">Quote accepted!</p>
                          {c.phone && (
                            <p className="text-xs text-success/80 mt-0.5">Contact: {c.phone}</p>
                          )}
                        </div>
                      </div>
                      {['matched', 'active', 'completed'].includes(job.status) && (
                        <button
                          onClick={() => navigate(`/chat/${job.id}`)}
                          className="w-full py-2.5 border border-primary/30 text-primary text-sm font-medium rounded-xl hover:bg-primary/5 transition-colors flex items-center justify-center gap-2"
                        >
                          <MessageSquare className="w-4 h-4" /> Message Contractor
                        </button>
                      )}
                    </div>
                  )}

                  {isRejected && (
                    <p className="text-xs text-muted italic">Not selected</p>
                  )}

                  {canAccept && (
                    <button
                      onClick={() => setConfirmQuote(quote)}
                      className="w-full py-2.5 bg-primary text-white text-sm font-semibold rounded-xl hover:bg-primary-hover active:scale-[0.98] transition-all"
                    >
                      Accept Quote
                    </button>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Confirmation modal */}
      {confirmQuote && (
        <div className="fixed inset-0 z-50 flex items-end">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => !accepting && setConfirmQuote(null)}
          />

          {/* Sheet */}
          <div className="relative w-full bg-surface rounded-t-3xl p-6 space-y-4 max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-foreground">Confirm Quote</h3>
              <button
                onClick={() => !accepting && setConfirmQuote(null)}
                className="p-1.5 rounded-xl text-muted hover:text-foreground transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-sm text-muted">
              Accept quote from{' '}
              <span className="font-semibold text-foreground">{confirmQuote.contractor.full_name}</span>?
            </p>

            <div className="bg-background rounded-xl p-3 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted">Quote amount</span>
                <span className="font-semibold text-foreground">
                  {formatPrice(confirmQuote.amount_cents / 100)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted">Platform fee (13%)</span>
                <span className="text-foreground">{formatPrice(platformFee / 100)}</span>
              </div>
            </div>

            <p className="text-xs text-muted bg-border/40 rounded-xl p-3">
              Payment integration coming soon. No payment will be charged at this time.
            </p>

            <button
              onClick={handleAccept}
              disabled={accepting}
              className="w-full py-3 bg-primary text-white font-semibold rounded-xl hover:bg-primary-hover active:scale-[0.98] transition-all disabled:opacity-60"
            >
              {accepting ? 'Confirming…' : 'Confirm & Accept'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
