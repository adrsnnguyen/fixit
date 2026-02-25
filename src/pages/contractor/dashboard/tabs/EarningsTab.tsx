import { useEffect, useState } from 'react'
import { DollarSign, Info } from 'lucide-react'
import { supabase } from '../../../../lib/supabase'
import { useContractor } from '../../../../contexts/ContractorContext'
import { EmptyState } from '../../../../components/EmptyState'
import { formatPrice, contractorPayout } from '../../../../utils/pricing'

export function EarningsTab() {
  const { contractor } = useContractor()
  const [monthlyEarningsCents, setMonthlyEarningsCents] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!contractor) return

    const fetchMonthlyEarnings = async () => {
      setLoading(true)

      const now = new Date()
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()

      const { data } = await supabase
        .from('quotes')
        .select('amount_cents')
        .eq('contractor_id', contractor.id)
        .eq('status', 'accepted')
        .gte('created_at', startOfMonth)

      if (data) {
        const total = data.reduce(
          (sum: number, q: { amount_cents: number }) =>
            sum + contractorPayout(q.amount_cents),
          0,
        )
        setMonthlyEarningsCents(total)
      }

      setLoading(false)
    }

    fetchMonthlyEarnings()
  }, [contractor])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-6 h-6 rounded-full border-2 border-primary border-t-transparent animate-spin" />
      </div>
    )
  }

  const allTimeEarnings = contractor?.total_earnings_cents ?? 0

  if (allTimeEarnings === 0 && (monthlyEarningsCents ?? 0) === 0) {
    return (
      <EmptyState
        icon={<DollarSign className="w-7 h-7" />}
        heading="No earnings yet"
        body="Complete jobs to start earning. Your payouts will appear here."
      />
    )
  }

  return (
    <div className="px-4 py-4 space-y-4">
      {/* Earnings cards */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-surface border border-border rounded-2xl p-4">
          <p className="text-xs text-muted mb-1">This month</p>
          <p className="text-xl font-bold text-foreground">
            {formatPrice((monthlyEarningsCents ?? 0) / 100)}
          </p>
        </div>
        <div className="bg-surface border border-border rounded-2xl p-4">
          <p className="text-xs text-muted mb-1">All time</p>
          <p className="text-xl font-bold text-foreground">
            {formatPrice(allTimeEarnings / 100)}
          </p>
        </div>
      </div>

      {/* Fee explainer */}
      <div className="bg-background border border-border rounded-2xl p-4 flex gap-3">
        <Info className="w-4 h-4 text-muted shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-semibold text-foreground mb-1">How payouts work</p>
          <p className="text-xs text-muted leading-relaxed">
            FixIt deducts a 13% platform fee from each accepted quote. For example, on a{' '}
            <span className="font-medium text-foreground">$200</span> job you receive{' '}
            <span className="font-medium text-foreground">
              {formatPrice(contractorPayout(20000) / 100)}
            </span>
            . Stripe payouts arrive within 2 business days of job completion.
          </p>
        </div>
      </div>
    </div>
  )
}
