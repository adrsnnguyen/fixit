import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Briefcase } from 'lucide-react'
import { supabase } from '../../../../lib/supabase'
import { useAuth } from '../../../../contexts/AuthContext'
import { EmptyState } from '../../../../components/EmptyState'
import { UrgencyBadge } from '../../../../components/UrgencyBadge'
import { formatPrice } from '../../../../utils/pricing'
import type { Job } from '../../../../types/database'
import { CATEGORY_LABELS } from '../../post-job/categories'

interface JobWithQuoteCount extends Job {
  quoteCount: number
}

function statusLabel(job: JobWithQuoteCount): string {
  if (job.status === 'completed') return '✅ Completed'
  if (job.status === 'matched' || job.status === 'active') return '🟢 In Progress'
  if (job.status === 'open' && job.quoteCount > 0) {
    return `🔵 ${job.quoteCount} Quote${job.quoteCount > 1 ? 's' : ''}`
  }
  return '🟡 Open'
}

export function MyJobsTab() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [jobs, setJobs] = useState<JobWithQuoteCount[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) return

    const fetchJobs = async () => {
      setLoading(true)

      const { data: jobData } = await supabase
        .from('jobs')
        .select('*')
        .eq('homeowner_id', user.id)
        .order('created_at', { ascending: false })

      if (!jobData || jobData.length === 0) {
        setJobs([])
        setLoading(false)
        return
      }

      const jobIds = (jobData as Job[]).map((j) => j.id)

      const { data: quoteData } = await supabase
        .from('quotes')
        .select('job_id')
        .in('job_id', jobIds)

      const countMap: Record<string, number> = {}
      for (const q of (quoteData ?? []) as { job_id: string }[]) {
        countMap[q.job_id] = (countMap[q.job_id] ?? 0) + 1
      }

      setJobs(
        (jobData as Job[]).map((j) => ({
          ...j,
          quoteCount: countMap[j.id] ?? 0,
        })),
      )
      setLoading(false)
    }

    fetchJobs()
  }, [user])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-7 h-7 rounded-full border-2 border-primary border-t-transparent animate-spin" />
      </div>
    )
  }

  if (jobs.length === 0) {
    return (
      <EmptyState
        icon={<Briefcase className="w-8 h-8" />}
        heading="No jobs yet"
        body="Post your first job and get quotes from local contractors."
      />
    )
  }

  return (
    <div className="px-4 py-4 space-y-3">
      {jobs.map((job) => (
        <button
          key={job.id}
          onClick={() => navigate(`/homeowner/jobs/${job.id}`)}
          className="w-full text-left bg-surface border border-border rounded-2xl p-4 space-y-2 active:scale-[0.99] transition-transform"
        >
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-muted uppercase tracking-wide mb-0.5">
                {CATEGORY_LABELS[job.category] ?? job.category}
              </p>
              <h3 className="font-semibold text-foreground text-sm leading-snug line-clamp-2">
                {job.description.slice(0, 80)}{job.description.length > 80 ? '…' : ''}
              </h3>
            </div>
            <UrgencyBadge urgency={job.urgency} />
          </div>

          <div className="flex items-center gap-3 text-xs text-muted">
            <span>
              {formatPrice(job.ai_price_min_cents / 100)}–{formatPrice(job.ai_price_max_cents / 100)}
            </span>
            <span>·</span>
            <span>{job.zip_code}</span>
          </div>

          <p className="text-xs font-medium">{statusLabel(job)}</p>
        </button>
      ))}
    </div>
  )
}
