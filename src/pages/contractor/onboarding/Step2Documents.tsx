import { type ChangeEvent, useState } from 'react'
import { Upload, Clock, Loader2, CheckCircle } from 'lucide-react'
import toast from 'react-hot-toast'
import { supabase } from '../../../lib/supabase'
import { useAuth } from '../../../contexts/AuthContext'
import type { OnboardingDraft } from './OnboardingPage'

interface DocUploadProps {
  label: string
  uploading: boolean
  uploaded: boolean
  onFileChange: (e: ChangeEvent<HTMLInputElement>) => void
}

function DocUpload({ label, uploading, uploaded, onFileChange }: DocUploadProps) {
  return (
    <label className="block cursor-pointer">
      <div
        className={[
          'border-2 border-dashed rounded-2xl p-6 text-center transition-colors',
          uploaded
            ? 'border-success bg-success/5'
            : 'border-border bg-background hover:border-primary/50',
        ].join(' ')}
      >
        {uploading ? (
          <Loader2 className="w-8 h-8 text-muted mx-auto mb-2 animate-spin" />
        ) : uploaded ? (
          <CheckCircle className="w-8 h-8 text-success mx-auto mb-2" />
        ) : (
          <Upload className="w-8 h-8 text-muted mx-auto mb-2" />
        )}
        <p className="text-sm font-medium text-foreground">{label}</p>
        <p className="text-xs text-muted mt-1">
          {uploading ? 'Uploading…' : uploaded ? 'Uploaded successfully' : 'Tap to upload image'}
        </p>
      </div>
      <input
        type="file"
        accept="image/*"
        className="sr-only"
        onChange={onFileChange}
        disabled={uploading}
      />
    </label>
  )
}

interface Step2Props {
  draft: OnboardingDraft
  onChange: (partial: Partial<OnboardingDraft>) => void
  onNext: () => void
  onBack: () => void
}

export function Step2Documents({ draft, onChange, onNext, onBack }: Step2Props) {
  const { user } = useAuth()
  const [uploadingLicense, setUploadingLicense] = useState(false)
  const [uploadingInsurance, setUploadingInsurance] = useState(false)

  const uploadDocument = async (
    file: File,
    suffix: 'license' | 'insurance',
    onStart: () => void,
    onDone: (url: string | null) => void,
  ) => {
    if (!user) return
    onStart()

    const path = `${user.id}/${Date.now()}-${suffix}.jpg`
    const { data, error } = await supabase.storage
      .from('documents')
      .upload(path, file, { upsert: true })

    if (error) {
      toast.error(`Failed to upload ${suffix}`)
      onDone(null)
      return
    }

    const { data: { publicUrl } } = supabase.storage.from('documents').getPublicUrl(data.path)
    onDone(publicUrl)
  }

  const handleLicenseChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    onChange({ license_photo_file: file })
    uploadDocument(
      file,
      'license',
      () => setUploadingLicense(true),
      (url) => {
        if (url) onChange({ license_photo_url: url })
        setUploadingLicense(false)
      },
    )
  }

  const handleInsuranceChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    onChange({ insurance_photo_file: file })
    uploadDocument(
      file,
      'insurance',
      () => setUploadingInsurance(true),
      (url) => {
        if (url) onChange({ insurance_photo_url: url })
        setUploadingInsurance(false)
      },
    )
  }

  const handleNext = () => {
    if (!draft.license_photo_url) return toast.error('Upload your contractor license')
    if (!draft.insurance_photo_url) return toast.error('Upload your insurance certificate')
    onNext()
  }

  return (
    <div className="flex-1 overflow-y-auto px-6 pb-8">
      <h2 className="text-xl font-bold text-foreground mb-1">Verify Your Credentials</h2>
      <p className="text-sm text-muted mb-6">
        Upload photos of your license and insurance. We review all documents before you go live.
      </p>

      <div className="space-y-4 mb-6">
        <DocUpload
          label="Contractor License"
          uploading={uploadingLicense}
          uploaded={!!draft.license_photo_url}
          onFileChange={handleLicenseChange}
        />
        <DocUpload
          label="Proof of Insurance"
          uploading={uploadingInsurance}
          uploaded={!!draft.insurance_photo_url}
          onFileChange={handleInsuranceChange}
        />
      </div>

      {/* Review info card */}
      <div className="bg-primary/5 border border-primary/20 rounded-2xl p-4 flex gap-3 mb-8">
        <Clock className="w-5 h-5 text-primary shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-semibold text-foreground mb-0.5">24-hour review</p>
          <p className="text-xs text-muted leading-relaxed">
            Our team reviews all submitted documents within 24 hours. You'll receive an email once
            your account is verified and you can start accepting jobs.
          </p>
        </div>
      </div>

      <div className="flex gap-3">
        <button
          onClick={onBack}
          className="flex-1 py-3 border border-border text-foreground font-semibold rounded-xl hover:border-foreground active:scale-[0.98] transition-all"
        >
          Back
        </button>
        <button
          onClick={handleNext}
          disabled={uploadingLicense || uploadingInsurance}
          className="flex-1 py-3 bg-primary text-white font-semibold rounded-xl hover:bg-primary-hover active:scale-[0.98] transition-all disabled:opacity-60"
        >
          Continue
        </button>
      </div>
    </div>
  )
}
