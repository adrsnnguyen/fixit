import { useRef, useState } from 'react'
import { Camera, Loader2, X } from 'lucide-react'
import toast from 'react-hot-toast'
import { supabase } from '../../../lib/supabase'
import { useAuth } from '../../../contexts/AuthContext'
import type { Urgency } from '../../../types/database'
import type { JobDraft } from './PostJobPage'

interface Props {
  draft: JobDraft
  onChange: (partial: Partial<JobDraft>) => void
  onNext: () => void
  onBack: () => void
}

const URGENCY_OPTIONS: Urgency[] = ['ASAP', 'This Week', 'Flexible']

export function Step2Describe({ draft, onChange, onNext, onBack }: Props) {
  const { user } = useAuth()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? [])
    if (!files.length || !user) return

    const remaining = 5 - draft.photos.length
    const toUpload = files.slice(0, remaining)

    if (toUpload.length === 0) {
      return toast.error('Maximum 5 photos allowed')
    }

    setUploading(true)
    const newUrls: string[] = []

    for (const file of toUpload) {
      const path = `${user.id}/${Date.now()}-${file.name}`
      const { error } = await supabase.storage.from('job-photos').upload(path, file)
      if (error) {
        toast.error(`Upload failed: ${error.message}`)
        continue
      }
      const { data } = supabase.storage.from('job-photos').getPublicUrl(path)
      newUrls.push(data.publicUrl)
    }

    onChange({ photos: [...draft.photos, ...newUrls] })
    setUploading(false)
    // Reset input so same file can be re-selected
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const removePhoto = (index: number) => {
    onChange({ photos: draft.photos.filter((_, i) => i !== index) })
  }

  const handleNext = () => {
    if (!draft.description.trim()) {
      return toast.error('Describe your job')
    }
    if (!draft.urgency) {
      return toast.error('Select urgency')
    }
    onNext()
  }

  return (
    <div className="flex-1 flex flex-col px-6 pb-8 space-y-5">
      <div>
        <h2 className="text-xl font-bold text-foreground mb-1">Describe your job</h2>
        <p className="text-sm text-muted">Give contractors enough detail to quote accurately.</p>
      </div>

      {/* Description */}
      <div>
        <label className="block text-sm font-medium text-foreground mb-1.5">
          Job description <span className="text-red-500">*</span>
        </label>
        <textarea
          value={draft.description}
          onChange={(e) => onChange({ description: e.target.value })}
          rows={4}
          placeholder="Describe what needs to be done, any known issues, and relevant details…"
          className="w-full px-3 py-2.5 rounded-xl border border-border bg-background text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors resize-none text-sm"
        />
      </div>

      {/* Photos */}
      <div>
        <label className="block text-sm font-medium text-foreground mb-2">
          Photos <span className="text-muted text-xs font-normal">(up to 5)</span>
        </label>
        <div className="flex gap-3 overflow-x-auto pb-1">
          {draft.photos.map((url, i) => (
            <div key={i} className="relative shrink-0">
              <img
                src={url}
                alt={`Photo ${i + 1}`}
                className="w-20 h-20 rounded-xl object-cover border border-border"
              />
              <button
                onClick={() => removePhoto(i)}
                className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-foreground text-background rounded-full flex items-center justify-center"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ))}
          {draft.photos.length < 5 && (
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="w-20 h-20 rounded-xl border-2 border-dashed border-border flex flex-col items-center justify-center gap-1 text-muted hover:border-primary/40 transition-colors shrink-0 disabled:opacity-60"
            >
              {uploading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  <Camera className="w-5 h-5" />
                  <span className="text-xs">Add</span>
                </>
              )}
            </button>
          )}
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={handlePhotoUpload}
        />
      </div>

      {/* Urgency */}
      <div>
        <label className="block text-sm font-medium text-foreground mb-2">
          How soon do you need this? <span className="text-red-500">*</span>
        </label>
        <div className="flex gap-2">
          {URGENCY_OPTIONS.map((opt) => (
            <button
              key={opt}
              onClick={() => onChange({ urgency: opt })}
              className={[
                'flex-1 py-2.5 rounded-xl text-sm font-medium border transition-colors',
                draft.urgency === opt
                  ? 'border-primary bg-primary/10 text-primary'
                  : 'border-border text-muted hover:border-primary/40',
              ].join(' ')}
            >
              {opt}
            </button>
          ))}
        </div>
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
