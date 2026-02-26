import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { supabase } from '../../../lib/supabase'
import type { Contractor } from '../../../types/database'

export function AdminContractorsTab() {
  const [contractors, setContractors] = useState<Contractor[]>([])
  const [loading, setLoading] = useState(true)
  const [verifying, setVerifying] = useState<string | null>(null)

  const fetchContractors = async () => {
    setLoading(true)
    const { data } = await supabase
      .from('contractors')
      .select('*')
      .eq('verification_status', 'pending')
      .order('created_at', { ascending: false })

    setContractors(data ?? [])
    setLoading(false)
  }

  useEffect(() => {
    fetchContractors()
  }, [])

  const handleVerify = async (id: string) => {
    setVerifying(id)
    const { error } = await supabase
      .from('contractors')
      .update({ verification_status: 'verified' })
      .eq('id', id)

    if (error) {
      toast.error(error.message)
    } else {
      toast.success('Contractor verified!')
      setContractors((prev) => prev.filter((c) => c.id !== id))
    }
    setVerifying(null)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-6 h-6 rounded-full border-2 border-blue-600 border-t-transparent animate-spin" />
      </div>
    )
  }

  return (
    <div className="p-6 space-y-4">
      <h2 className="text-lg font-bold text-gray-900">
        Pending Verification ({contractors.length})
      </h2>

      {contractors.length === 0 ? (
        <p className="text-sm text-gray-400 py-8 text-center">No pending contractors.</p>
      ) : (
        <div className="space-y-3">
          {contractors.map((c) => (
            <div
              key={c.id}
              className="bg-white border border-gray-100 rounded-2xl p-4 flex items-center justify-between gap-4"
            >
              <div className="min-w-0">
                <p className="font-semibold text-gray-900 truncate">{c.full_name}</p>
                <p className="text-xs text-gray-400">{c.trade_types.join(', ')}</p>
                <p className="text-xs text-gray-400">{c.phone}</p>
              </div>
              <button
                onClick={() => handleVerify(c.id)}
                disabled={verifying === c.id}
                className="px-4 py-2 bg-green-600 text-white text-sm font-semibold rounded-xl hover:bg-green-700 active:scale-[0.98] transition-all disabled:opacity-60 shrink-0"
              >
                {verifying === c.id ? 'Verifying…' : 'Mark Verified'}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
