import { useState } from 'react'
import { CheckCircle, CreditCard, User, MapPin, Wrench } from 'lucide-react'
import toast from 'react-hot-toast'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../../../lib/supabase'
import { useAuth } from '../../../contexts/AuthContext'
import type { OnboardingDraft } from './OnboardingPage'

interface Step3Props {
  draft: OnboardingDraft
  onBack: () => void
}

export function Step3Confirmation({ draft, onBack }: Step3Props) {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async () => {
    if (!user) return
    setSubmitting(true)

    const { error } = await supabase.from('contractors').insert({
      user_id: user.id,
      full_name: draft.full_name,
      phone: draft.phone,
      profile_photo_url: draft.profile_photo_url,
      bio: draft.bio,
      primary_trade: draft.primary_trade,
      // Data contract: trade_types values must match job.category values exactly
      trade_types: [draft.primary_trade],
      service_zip_codes: draft.service_zip_codes,
      license_photo_url: draft.license_photo_url,
      insurance_photo_url: draft.insurance_photo_url,
      verification_status: 'pending',
      total_earnings_cents: 0,
      rating_avg: null,
      rating_count: 0,
    })

    if (error) {
      toast.error(error.message)
      setSubmitting(false)
      return
    }

    toast.success('Profile created! Welcome to FixIt.')
    navigate('/contractor/dashboard', { replace: true })
  }

  return (
    <div className="flex-1 overflow-y-auto px-6 pb-8">
      <h2 className="text-xl font-bold text-foreground mb-1">Almost there!</h2>
      <p className="text-sm text-muted mb-6">
        Review your profile before going live.
      </p>

      {/* Profile summary */}
      <div className="bg-surface border border-border rounded-2xl p-4 mb-4 space-y-3">
        {/* Avatar + name */}
        <div className="flex items-center gap-3">
          {draft.profile_photo_url ? (
            <img
              src={draft.profile_photo_url}
              alt="Profile"
              className="w-14 h-14 rounded-full object-cover border border-border"
            />
          ) : (
            <div className="w-14 h-14 rounded-full bg-border flex items-center justify-center">
              <User className="w-7 h-7 text-muted" />
            </div>
          )}
          <div>
            <p className="font-semibold text-foreground">{draft.full_name}</p>
            <p className="text-sm text-muted">{draft.phone}</p>
          </div>
        </div>

        <div className="border-t border-border" />

        {/* Trade */}
        <div className="flex items-center gap-2">
          <Wrench className="w-4 h-4 text-muted shrink-0" />
          <span className="text-sm text-foreground capitalize">
            {draft.primary_trade.replace(/_/g, ' ')}
          </span>
        </div>

        {/* Zip codes */}
        <div className="flex items-start gap-2">
          <MapPin className="w-4 h-4 text-muted shrink-0 mt-0.5" />
          <span className="text-sm text-foreground">
            {draft.service_zip_codes.join(', ')}
          </span>
        </div>

        {/* Bio */}
        {draft.bio && (
          <p className="text-sm text-muted leading-relaxed">{draft.bio}</p>
        )}
      </div>

      {/* Document verification badges */}
      <div className="flex gap-3 mb-4">
        <div className="flex-1 flex items-center gap-2 bg-success/5 border border-success/20 rounded-xl px-3 py-2">
          <CheckCircle className="w-4 h-4 text-success shrink-0" />
          <span className="text-xs font-medium text-success">License uploaded</span>
        </div>
        <div className="flex-1 flex items-center gap-2 bg-success/5 border border-success/20 rounded-xl px-3 py-2">
          <CheckCircle className="w-4 h-4 text-success shrink-0" />
          <span className="text-xs font-medium text-success">Insurance uploaded</span>
        </div>
      </div>

      {/* Stripe placeholder */}
      <div className="bg-background border border-dashed border-border rounded-2xl p-4 flex gap-3 mb-8">
        <CreditCard className="w-5 h-5 text-muted shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-semibold text-foreground mb-0.5">Payment setup</p>
          <p className="text-xs text-muted leading-relaxed">
            Stripe Connect integration coming soon. You'll be able to link your bank account to
            receive direct deposits for completed jobs.
          </p>
        </div>
      </div>

      <div className="flex gap-3">
        <button
          onClick={onBack}
          disabled={submitting}
          className="flex-1 py-3 border border-border text-foreground font-semibold rounded-xl hover:border-foreground active:scale-[0.98] transition-all disabled:opacity-60"
        >
          Back
        </button>
        <button
          onClick={handleSubmit}
          disabled={submitting}
          className="flex-1 py-3 bg-primary text-white font-semibold rounded-xl hover:bg-primary-hover active:scale-[0.98] transition-all disabled:opacity-60"
        >
          {submitting ? 'Creating profile…' : 'Go to Dashboard'}
        </button>
      </div>
    </div>
  )
}
