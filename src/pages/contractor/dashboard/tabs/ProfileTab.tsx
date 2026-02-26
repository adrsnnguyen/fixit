import { useState } from 'react'
import { Star, CheckCircle, Clock, XCircle, Edit2, Save, X } from 'lucide-react'
import toast from 'react-hot-toast'
import { supabase } from '../../../../lib/supabase'
import { useContractor } from '../../../../contexts/ContractorContext'
import { useAuth } from '../../../../contexts/AuthContext'
import { Badge } from '../../../../components/Badge'

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

function StarRating({ avg, count }: { avg: number | null; count: number }) {
  if (!avg || count === 0) {
    return <span className="text-sm text-muted">No ratings yet</span>
  }
  return (
    <div className="flex items-center gap-1">
      {Array.from({ length: 5 }, (_, i) => (
        <Star
          key={i}
          className={[
            'w-4 h-4',
            i < Math.round(avg) ? 'text-warning fill-warning' : 'text-border',
          ].join(' ')}
        />
      ))}
      <span className="text-sm font-medium text-foreground ml-1">{avg.toFixed(1)}</span>
      <span className="text-xs text-muted">({count})</span>
    </div>
  )
}

const VERIFICATION_CONFIG = {
  pending: {
    icon: <Clock className="w-4 h-4" />,
    label: 'Under review',
    variant: 'warning' as const,
  },
  verified: {
    icon: <CheckCircle className="w-4 h-4" />,
    label: 'Verified',
    variant: 'success' as const,
  },
  rejected: {
    icon: <XCircle className="w-4 h-4" />,
    label: 'Rejected',
    variant: 'danger' as const,
  },
}

export function ProfileTab() {
  const { contractor, refresh } = useContractor()
  const { signOut } = useAuth()
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)

  // Edit state
  const [bio, setBio] = useState(contractor?.bio ?? '')
  const [selectedTrades, setSelectedTrades] = useState<string[]>(contractor?.trade_types ?? [])
  const [zipInput, setZipInput] = useState(contractor?.service_zip_codes.join(', ') ?? '')

  if (!contractor) return null

  const verification = VERIFICATION_CONFIG[contractor.verification_status]

  const handleEdit = () => {
    setBio(contractor.bio)
    setSelectedTrades(contractor.trade_types)
    setZipInput(contractor.service_zip_codes.join(', '))
    setEditing(true)
  }

  const handleCancel = () => setEditing(false)

  const toggleTrade = (trade: string) => {
    setSelectedTrades((prev) =>
      prev.includes(trade) ? prev.filter((t) => t !== trade) : [...prev, trade],
    )
  }

  const handleSave = async () => {
    if (selectedTrades.length === 0) {
      return toast.error('Select at least one trade')
    }

    const zips = zipInput
      .split(',')
      .map((z) => z.trim())
      .filter(Boolean)
      .slice(0, 5)

    if (zips.length === 0) {
      return toast.error('Add at least one postal code')
    }

    setSaving(true)
    const { error } = await supabase
      .from('contractors')
      .update({
        bio,
        trade_types: selectedTrades,
        service_zip_codes: zips,
      })
      .eq('id', contractor.id)

    if (error) {
      toast.error(error.message)
    } else {
      toast.success('Profile updated')
      await refresh()
      setEditing(false)
    }
    setSaving(false)
  }

  return (
    <div className="px-4 py-4 space-y-4">
      {/* New Pro boost banner */}
      {contractor.rating_count < 5 && (
        <div className="bg-primary/10 border border-primary/20 rounded-2xl p-4">
          <p className="text-sm font-semibold text-primary">
            🚀 New Pro boost active — you're being shown to more homeowners.
          </p>
          <p className="text-xs text-primary/70 mt-1">
            {5 - contractor.rating_count} job{5 - contractor.rating_count !== 1 ? 's' : ''} until you compete on reviews alone.
          </p>
        </div>
      )}

      {/* Header card */}
      <div className="bg-surface border border-border rounded-2xl p-4">
        <div className="flex items-start justify-between gap-2 mb-3">
          <div className="flex items-center gap-3">
            {contractor.profile_photo_url ? (
              <img
                src={contractor.profile_photo_url}
                alt={contractor.full_name}
                className="w-14 h-14 rounded-full object-cover border border-border"
              />
            ) : (
              <div className="w-14 h-14 rounded-full bg-border flex items-center justify-center text-muted font-bold text-lg">
                {contractor.full_name.charAt(0)}
              </div>
            )}
            <div>
              <h2 className="font-bold text-foreground">{contractor.full_name}</h2>
              <p className="text-sm text-muted">{contractor.phone}</p>
            </div>
          </div>
          {!editing && (
            <button
              onClick={handleEdit}
              className="p-2 rounded-xl border border-border text-muted hover:text-foreground hover:border-foreground transition-colors"
            >
              <Edit2 className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Verification badge */}
        <div className="flex items-center gap-1.5 mb-3">
          <span className={`text-${verification.variant === 'success' ? 'success' : verification.variant === 'warning' ? 'warning' : 'red-600'}`}>
            {verification.icon}
          </span>
          <Badge variant={verification.variant}>{verification.label}</Badge>
        </div>

        {/* Star rating */}
        <StarRating avg={contractor.rating_avg} count={contractor.rating_count} />
      </div>

      {/* Edit form or read view */}
      {editing ? (
        <div className="bg-surface border border-border rounded-2xl p-4 space-y-4">
          {/* Bio */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">Bio</label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              rows={3}
              placeholder="Tell homeowners about your experience…"
              className="w-full px-3 py-2.5 rounded-xl border border-border bg-background text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors resize-none text-sm"
            />
          </div>

          {/* Trade types */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Trades</label>
            <div className="flex flex-wrap gap-2">
              {TRADE_OPTIONS.map((t) => {
                const selected = selectedTrades.includes(t.value)
                return (
                  <button
                    key={t.value}
                    onClick={() => toggleTrade(t.value)}
                    className={[
                      'px-3 py-1.5 rounded-full text-xs font-medium border transition-colors',
                      selected
                        ? 'border-primary bg-primary/10 text-primary'
                        : 'border-border text-muted hover:border-primary/50',
                    ].join(' ')}
                  >
                    {t.label}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Zip codes */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">
              Service postal codes
            </label>
            <input
              type="text"
              value={zipInput}
              onChange={(e) => setZipInput(e.target.value)}
              placeholder="V6B 2R9, V5K 1B3"
              className="w-full px-3 py-2.5 rounded-xl border border-border bg-background text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors text-sm"
            />
            <p className="text-xs text-muted mt-1">Comma-separated, up to 5</p>
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-1">
            <button
              onClick={handleCancel}
              disabled={saving}
              className="flex-1 py-2.5 border border-border text-foreground text-sm font-semibold rounded-xl hover:border-foreground active:scale-[0.98] transition-all disabled:opacity-60 flex items-center justify-center gap-1.5"
            >
              <X className="w-3.5 h-3.5" />
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex-1 py-2.5 bg-primary text-white text-sm font-semibold rounded-xl hover:bg-primary-hover active:scale-[0.98] transition-all disabled:opacity-60 flex items-center justify-center gap-1.5"
            >
              <Save className="w-3.5 h-3.5" />
              {saving ? 'Saving…' : 'Save'}
            </button>
          </div>
        </div>
      ) : (
        <div className="bg-surface border border-border rounded-2xl p-4 space-y-4">
          {/* Bio */}
          {contractor.bio ? (
            <div>
              <p className="text-xs font-medium text-muted uppercase tracking-wide mb-1">Bio</p>
              <p className="text-sm text-foreground leading-relaxed">{contractor.bio}</p>
            </div>
          ) : (
            <p className="text-sm text-muted italic">No bio added yet.</p>
          )}

          <div className="border-t border-border" />

          {/* Trades */}
          <div>
            <p className="text-xs font-medium text-muted uppercase tracking-wide mb-2">Trades</p>
            <div className="flex flex-wrap gap-2">
              {contractor.trade_types.map((t) => (
                <Badge key={t} variant="primary">
                  {t.replace(/_/g, ' ')}
                </Badge>
              ))}
            </div>
          </div>

          <div className="border-t border-border" />

          {/* Zip codes */}
          <div>
            <p className="text-xs font-medium text-muted uppercase tracking-wide mb-1">
              Service area
            </p>
            <p className="text-sm text-foreground">{contractor.service_zip_codes.join(', ')}</p>
          </div>
        </div>
      )}

      {/* Sign out */}
      <button
        onClick={signOut}
        className="w-full py-3 border border-border text-muted font-medium rounded-xl hover:border-foreground hover:text-foreground transition-colors text-sm"
      >
        Sign out
      </button>
    </div>
  )
}
