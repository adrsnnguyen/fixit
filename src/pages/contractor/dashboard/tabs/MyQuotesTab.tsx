import { useEffect, useState } from 'react'
import { FileText } from 'lucide-react'
import toast from 'react-hot-toast'
import { supabase } from '../../../../lib/supabase'
import { useContractor } from '../../../../contexts/ContractorContext'
import { Badge } from '../../../../components/Badge'
import { EmptyState } from '../../../../components/EmptyState'
import { formatPrice } from '../../../../utils/pricing'
import type { QuoteWithJob, QuoteStatus } from '../../../../types/database'

const STATUS_VARIANT: Record<QuoteStatus, 'warning' | 'success' | 'danger'> = {
  pending: 'warning',
  accepted: 'success',
  rejected: 'danger',
}

export function MyQuotesTab() {
  const { contractor } = useContractor()
  const [quotes, setQuotes] = useState<QuoteWithJob[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!contractor) return

    const fetchQuotes = async () => {
      setLoading(true)
      const { data, error } = await supabase
        .from('quotes')
        .select('*, job:jobs(title, category, status)')
        .eq('contractor_id', contractor.id)
        .order('created_at', { ascending: false })

      if (error) toast.error('Failed to load quotes')
      setQuotes((data as QuoteWithJob[]) ?? [])
      setLoading(false)
    }

    fetchQuotes()
  }, [contractor])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-6 h-6 rounded-full border-2 border-primary border-t-transparent animate-spin" />
      </div>
    )
  }

  if (quotes.length === 0) {
    return (
      <EmptyState
        icon={<FileText className="w-7 h-7" />}
        heading="No quotes yet"
        body="Submit quotes on available jobs and they'll appear here."
      />
    )
  }

  return (
    <div className="px-4 py-4 space-y-3">
      {quotes.map((quote) => (
        <div
          key={quote.id}
          className="bg-surface border border-border rounded-2xl p-4"
        >
          <div className="flex items-start justify-between gap-2 mb-2">
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-muted uppercase tracking-wide mb-0.5">
                {quote.job.category.replace(/_/g, ' ')}
              </p>
              <h3 className="font-semibold text-foreground leading-tight line-clamp-1">
                {quote.job.title}
              </h3>
            </div>
            <Badge variant={STATUS_VARIANT[quote.status]}>
              {quote.status.charAt(0).toUpperCase() + quote.status.slice(1)}
            </Badge>
          </div>
          <div className="flex items-center justify-between mt-3">
            <span className="text-base font-bold text-foreground">
              {formatPrice(quote.amount_cents / 100)}
            </span>
            <span className="text-xs text-muted">{quote.availability}</span>
          </div>
          {quote.message && (
            <p className="text-sm text-muted mt-2 leading-relaxed line-clamp-2">
              {quote.message}
            </p>
          )}
        </div>
      ))}
    </div>
  )
}
