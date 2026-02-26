import { useEffect, useState } from 'react'
import { Edit2, Save, X, CreditCard } from 'lucide-react'
import toast from 'react-hot-toast'
import { supabase } from '../../../../lib/supabase'
import { useAuth } from '../../../../contexts/AuthContext'

interface ProfileData {
  full_name: string
  phone: string
}

export function HomeownerProfileTab() {
  const { user, signOut } = useAuth()
  const [profile, setProfile] = useState<ProfileData>({ full_name: '', phone: '' })
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)

  // Edit state
  const [editName, setEditName] = useState('')
  const [editPhone, setEditPhone] = useState('')

  useEffect(() => {
    if (!user) return

    const fetchProfile = async () => {
      const { data } = await supabase
        .from('profiles')
        .select('full_name, phone')
        .eq('user_id', user.id)
        .single()

      if (data) {
        setProfile({ full_name: data.full_name ?? '', phone: data.phone ?? '' })
      }
      setLoading(false)
    }

    fetchProfile()
  }, [user])

  const handleEdit = () => {
    setEditName(profile.full_name)
    setEditPhone(profile.phone)
    setEditing(true)
  }

  const handleCancel = () => setEditing(false)

  const handleSave = async () => {
    if (!user) return
    if (!editName.trim()) return toast.error('Name is required')

    setSaving(true)
    const { error } = await supabase
      .from('profiles')
      .update({ full_name: editName.trim(), phone: editPhone.trim() || null })
      .eq('user_id', user.id)

    if (error) {
      toast.error(error.message)
    } else {
      setProfile({ full_name: editName.trim(), phone: editPhone.trim() })
      toast.success('Profile updated')
      setEditing(false)
    }
    setSaving(false)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-7 h-7 rounded-full border-2 border-primary border-t-transparent animate-spin" />
      </div>
    )
  }

  return (
    <div className="px-4 py-4 space-y-4">
      {/* Profile card */}
      <div className="bg-surface border border-border rounded-2xl p-4">
        <div className="flex items-start justify-between gap-2 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-14 h-14 rounded-full bg-border flex items-center justify-center text-muted font-bold text-xl">
              {profile.full_name.charAt(0).toUpperCase() || '?'}
            </div>
            <div>
              <h2 className="font-bold text-foreground">{profile.full_name || 'No name set'}</h2>
              <p className="text-sm text-muted">{profile.phone || 'No phone set'}</p>
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

        {editing && (
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Full name</label>
              <input
                type="text"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                placeholder="Jane Smith"
                className="w-full px-3 py-2.5 rounded-xl border border-border bg-background text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Phone</label>
              <input
                type="tel"
                value={editPhone}
                onChange={(e) => setEditPhone(e.target.value)}
                placeholder="(604) 555-0000"
                className="w-full px-3 py-2.5 rounded-xl border border-border bg-background text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors text-sm"
              />
            </div>
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
        )}
      </div>

      {/* Payment placeholder */}
      <div className="bg-surface border border-border rounded-2xl p-4 flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-border flex items-center justify-center text-muted shrink-0">
          <CreditCard className="w-5 h-5" />
        </div>
        <div>
          <p className="text-sm font-semibold text-foreground">Payment methods</p>
          <p className="text-xs text-muted mt-0.5">Coming soon — no payment required to post.</p>
        </div>
      </div>

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
