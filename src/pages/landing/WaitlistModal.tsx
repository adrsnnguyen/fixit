import { useState, useEffect } from 'react'
import { X, CheckCircle } from 'lucide-react'
import toast from 'react-hot-toast'
import { supabase } from '../../lib/supabase'

interface WaitlistModalProps {
  role: 'homeowner' | 'contractor'
  onClose: () => void
}

export function WaitlistModal({ role, onClose }: WaitlistModalProps) {
  const [email, setEmail] = useState('')
  const [zipCode, setZipCode] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [confirmed, setConfirmed] = useState(false)

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onClose])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.trim() || !zipCode.trim()) return

    setSubmitting(true)

    const { error } = await supabase
      .from('waitlist')
      .insert({ email: email.trim().toLowerCase(), zip_code: zipCode.trim(), role })

    setSubmitting(false)

    if (error) {
      if (error.code === '23505') {
        toast.error("You're already on the waitlist!")
      } else {
        toast.error(error.message)
      }
      return
    }

    setConfirmed(true)
    toast.success("You're on the list!")
  }

  const roleLabel = role === 'homeowner' ? 'homeowner' : 'contractor'

  return (
    <div className="fixed inset-0 z-50 flex items-end">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40"
        onClick={() => !submitting && onClose()}
      />

      {/* Bottom sheet */}
      <div className="relative w-full bg-white rounded-t-3xl p-6 space-y-5 max-h-[85vh] overflow-y-auto">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-gray-900">
            {confirmed ? "You're on the list!" : `Join as a ${roleLabel}`}
          </h3>
          <button
            onClick={() => !submitting && onClose()}
            className="p-1.5 rounded-xl text-gray-400 hover:text-gray-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {confirmed ? (
          <div className="text-center space-y-4 py-4">
            <CheckCircle className="w-14 h-14 text-green-500 mx-auto" />
            <p className="text-gray-600 text-sm leading-relaxed">
              We'll email you at <span className="font-semibold text-gray-900">{email}</span>{' '}
              as soon as FixIt launches in your area.
            </p>
            <button
              onClick={onClose}
              className="w-full py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-colors"
            >
              Done
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <p className="text-sm text-gray-500">
              Be the first to know when FixIt launches near you.
            </p>

            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Email address <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Postal code <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  pattern="[A-Za-z][0-9][A-Za-z] ?[0-9][A-Za-z][0-9]"
                  maxLength={7}
                  value={zipCode}
                  onChange={(e) => setZipCode(e.target.value)}
                  placeholder="V6B 2R9"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting || !email.trim() || !zipCode.trim()}
              className="w-full py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 active:scale-[0.98] transition-all disabled:opacity-60"
            >
              {submitting ? 'Joining…' : 'Join the waitlist'}
            </button>

            <p className="text-xs text-gray-400 text-center">
              No spam. Unsubscribe any time.
            </p>
          </form>
        )}
      </div>
    </div>
  )
}
