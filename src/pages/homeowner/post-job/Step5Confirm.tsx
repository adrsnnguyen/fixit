import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { supabase } from '../../../lib/supabase'
import { useAuth } from '../../../contexts/AuthContext'
import { UrgencyBadge } from '../../../components/UrgencyBadge'
import { PhotoGallery } from '../../../components/PhotoGallery'
import { formatPrice } from '../../../utils/pricing'
import { runAiMatching } from '../../../utils/aiMatching'
import { CATEGORY_LABELS } from './categories'
import type { JobDraft } from './PostJobPage'

interface Props {
  draft: JobDraft
  onBack: () => void
}

export function Step5Confirm({ draft, onBack }: Props) {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [posting, setPosting] = useState(false)

  const handlePost = async () => {
    if (!user) return

    setPosting(true)

    // 1. Look up city
    const { data: cityData } = await supabase
      .from('cities')
      .select('id')
      .eq('name', 'Austin')
      .maybeSingle()

    if (!cityData) {
      toast.error('City not found')
      setPosting(false)
      return
    }

    // 2. Insert job
    const { data: insertedJobs, error } = await supabase.from('jobs').insert({
      homeowner_id: user.id,
      category: draft.category,
      title: CATEGORY_LABELS[draft.category] ?? draft.category,
      description: draft.description,
      status: 'open',
      urgency: draft.urgency!,
      ai_price_min_cents: draft.ai_price_min_cents,
      ai_price_max_cents: draft.ai_price_max_cents,
      zip_code: draft.zip_code,
      address: draft.address || null,
      photos: draft.photos,
      city_id: cityData.id,
    }).select('id')

    if (error) {
      toast.error(error.message)
      setPosting(false)
      return
    }

    const jobId = (insertedJobs as { id: string }[])?.[0]?.id
    if (jobId) {
      runAiMatching(jobId, draft.category, draft.description, draft.urgency!, draft.zip_code)
    }

    toast.success('Job posted!')
    navigate('/homeowner/dashboard', { replace: true })
  }

  return (
    <div className="flex-1 flex flex-col px-6 pb-8 space-y-5">
      <div>
        <h2 className="text-xl font-bold text-foreground mb-1">Review & post</h2>
        <p className="text-sm text-muted">Double-check everything before submitting.</p>
      </div>

      {/* Summary card */}
      <div className="bg-surface border border-border rounded-2xl p-4 space-y-4">
        {/* Category + urgency */}
        <div className="flex items-center justify-between">
          <p className="text-xs font-medium text-muted uppercase tracking-wide">
            {CATEGORY_LABELS[draft.category] ?? draft.category}
          </p>
          {draft.urgency && <UrgencyBadge urgency={draft.urgency} />}
        </div>

        {/* Description preview */}
        <p className="text-sm text-foreground leading-relaxed line-clamp-4">{draft.description}</p>

        <div className="border-t border-border" />

        {/* Location */}
        <div className="flex items-center gap-4 text-sm">
          {draft.address && (
            <div>
              <span className="text-muted">Address: </span>
              <span className="text-foreground font-medium">{draft.address}</span>
            </div>
          )}
          <div>
            <span className="text-muted">Zip: </span>
            <span className="text-foreground font-medium">{draft.zip_code}</span>
          </div>
        </div>

        {/* Price estimate */}
        <div className="text-sm">
          <span className="text-muted">Estimate: </span>
          <span className="font-semibold text-foreground">
            {formatPrice(draft.ai_price_min_cents / 100)}–{formatPrice(draft.ai_price_max_cents / 100)}
          </span>
        </div>

        {/* Photos */}
        {draft.photos.length > 0 && (
          <div>
            <p className="text-xs font-medium text-muted mb-2">Photos</p>
            <PhotoGallery photos={draft.photos} alt="Job photo" />
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <button
          onClick={onBack}
          disabled={posting}
          className="flex-1 py-3 border border-border text-foreground font-semibold rounded-xl hover:border-foreground active:scale-[0.98] transition-all text-sm disabled:opacity-60"
        >
          Back
        </button>
        <button
          onClick={handlePost}
          disabled={posting}
          className="flex-1 py-3 bg-primary text-white font-semibold rounded-xl hover:bg-primary-hover active:scale-[0.98] transition-all text-sm disabled:opacity-60"
        >
          {posting ? 'Posting…' : 'Post Job'}
        </button>
      </div>
    </div>
  )
}
