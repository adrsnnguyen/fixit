import { MapPin, ChevronRight } from 'lucide-react'
import type { Job } from '../types/database'
import { UrgencyBadge } from './UrgencyBadge'
import { formatPrice } from '../utils/pricing'

interface JobCardProps {
  job: Job
  onClick: () => void
}

export function JobCard({ job, onClick }: JobCardProps) {
  const priceRange = `${formatPrice(job.ai_price_min_cents / 100)}–${formatPrice(job.ai_price_max_cents / 100)}`
  const truncatedDesc =
    job.description.length > 100 ? job.description.slice(0, 100) + '…' : job.description

  return (
    <button
      onClick={onClick}
      className="w-full text-left bg-surface border border-border rounded-2xl p-4 active:scale-[0.98] transition-all hover:border-primary/30"
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="flex-1 min-w-0">
          <p className="text-xs font-medium text-muted uppercase tracking-wide mb-0.5">
            {job.category.replace(/_/g, ' ')}
          </p>
          <h3 className="font-semibold text-foreground leading-tight">{job.title}</h3>
        </div>
        <UrgencyBadge urgency={job.urgency} />
      </div>
      <p className="text-sm text-muted mb-3 leading-relaxed">{truncatedDesc}</p>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-sm font-semibold text-foreground">{priceRange}</span>
          <div className="flex items-center gap-1 text-xs text-muted">
            <MapPin className="w-3 h-3" />
            {job.zip_code}
          </div>
        </div>
        <ChevronRight className="w-4 h-4 text-muted" />
      </div>
    </button>
  )
}
