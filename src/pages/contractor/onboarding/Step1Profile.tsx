import { type ChangeEvent, useState } from 'react'
import { Camera, Loader2 } from 'lucide-react'
import toast from 'react-hot-toast'
import { supabase } from '../../../lib/supabase'
import { useAuth } from '../../../contexts/AuthContext'
import type { OnboardingDraft } from './OnboardingPage'

const TRADE_OPTIONS = [
  { value: 'plumbing', label: 'Plumbing' },
  { value: 'electrical', label: 'Electrical' },
  { value: 'cleaning', label: 'House Cleaning' },
  { value: 'landscaping', label: 'Landscaping' },
  { value: 'painting', label: 'Painting' },
  { value: 'carpentry', label: 'Carpentry' },
  { value: 'hvac', label: 'HVAC' },
  { value: 'moving', label: 'Moving' },
  { value: 'pest_control', label: 'Pest Control' },
  { value: 'appliance_repair', label: 'Appliance Repair' },
]

interface Step1Props {
  draft: OnboardingDraft
  onChange: (partial: Partial<OnboardingDraft>) => void
  onNext: () => void
}

export function Step1Profile({ draft, onChange, onNext }: Step1Props) {
  const { user } = useAuth()
  const [uploadingPhoto, setUploadingPhoto] = useState(false)
  const [zipInput, setZipInput] = useState(draft.service_zip_codes.join(', '))

  const handlePhotoChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !user) return

    onChange({ profile_photo_file: file })
    setUploadingPhoto(true)

    const path = `${user.id}/${Date.now()}-profile.jpg`
    const { data, error } = await supabase.storage
      .from('profiles')
      .upload(path, file, { upsert: true })

    if (error) {
      toast.error('Failed to upload photo')
      setUploadingPhoto(false)
      return
    }

    const { data: { publicUrl } } = supabase.storage.from('profiles').getPublicUrl(data.path)
    onChange({ profile_photo_url: publicUrl })
    setUploadingPhoto(false)
  }

  const handleZipChange = (value: string) => {
    setZipInput(value)
    const zips = value
      .split(',')
      .map((z) => z.trim())
      .filter(Boolean)
      .slice(0, 5)
    onChange({ service_zip_codes: zips })
  }

  const handleNext = () => {
    if (!draft.full_name.trim()) return toast.error('Name is required')
    if (!draft.phone.trim()) return toast.error('Phone is required')
    if (!draft.primary_trade) return toast.error('Select your primary trade')
    if (draft.service_zip_codes.length === 0) return toast.error('Add at least one postal code')
    onNext()
  }

  return (
    <div className="flex-1 overflow-y-auto px-6 pb-8">
      <h2 className="text-xl font-bold text-foreground mb-1">Your Profile</h2>
      <p className="text-sm text-muted mb-6">Tell homeowners a bit about yourself.</p>

      {/* Profile photo */}
      <div className="flex flex-col items-center mb-6">
        <label className="cursor-pointer group relative">
          <div className="w-24 h-24 rounded-full bg-background border-2 border-dashed border-border group-hover:border-primary transition-colors flex items-center justify-center overflow-hidden">
            {uploadingPhoto ? (
              <Loader2 className="w-6 h-6 text-muted animate-spin" />
            ) : draft.profile_photo_url ? (
              <img
                src={draft.profile_photo_url}
                alt="Profile"
                className="w-full h-full object-cover"
              />
            ) : (
              <Camera className="w-7 h-7 text-muted" />
            )}
          </div>
          <input
            type="file"
            accept="image/*"
            className="sr-only"
            onChange={handlePhotoChange}
            disabled={uploadingPhoto}
          />
        </label>
        <p className="text-xs text-muted mt-2">Tap to upload photo</p>
      </div>

      <div className="space-y-4">
        {/* Full name */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-1.5">
            Full name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={draft.full_name}
            onChange={(e) => onChange({ full_name: e.target.value })}
            placeholder="Jane Smith"
            className="w-full px-4 py-3 rounded-xl border border-border bg-surface text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
          />
        </div>

        {/* Phone */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-1.5">
            Phone number <span className="text-red-500">*</span>
          </label>
          <input
            type="tel"
            value={draft.phone}
            onChange={(e) => onChange({ phone: e.target.value })}
            placeholder="(604) 555-0000"
            className="w-full px-4 py-3 rounded-xl border border-border bg-surface text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
          />
        </div>

        {/* Bio */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-1.5">Bio</label>
          <textarea
            value={draft.bio}
            onChange={(e) => onChange({ bio: e.target.value })}
            placeholder="Tell homeowners about your experience and what makes you great…"
            rows={3}
            className="w-full px-4 py-3 rounded-xl border border-border bg-surface text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors resize-none"
          />
        </div>

        {/* Primary trade */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-1.5">
            Primary trade <span className="text-red-500">*</span>
          </label>
          <select
            value={draft.primary_trade}
            onChange={(e) => onChange({ primary_trade: e.target.value })}
            className="w-full px-4 py-3 rounded-xl border border-border bg-surface text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
          >
            <option value="">Select a trade…</option>
            {TRADE_OPTIONS.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </select>
        </div>

        {/* Service zip codes */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-1.5">
            Service postal codes <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={zipInput}
            onChange={(e) => handleZipChange(e.target.value)}
            placeholder="V6B 2R9, V5K 1B3"
            className="w-full px-4 py-3 rounded-xl border border-border bg-surface text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
          />
          <p className="text-xs text-muted mt-1">Comma-separated, up to 5 postal codes</p>
        </div>
      </div>

      <button
        onClick={handleNext}
        disabled={uploadingPhoto}
        className="w-full mt-8 py-3 bg-primary text-white font-semibold rounded-xl hover:bg-primary-hover active:scale-[0.98] transition-all disabled:opacity-60"
      >
        Continue
      </button>
    </div>
  )
}
