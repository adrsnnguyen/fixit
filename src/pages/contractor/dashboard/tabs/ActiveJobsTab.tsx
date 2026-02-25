import { useEffect, useState } from 'react'
import { Zap, MessageSquare } from 'lucide-react'
import toast from 'react-hot-toast'
import { supabase } from '../../../../lib/supabase'
import { useContractor } from '../../../../contexts/ContractorContext'
import { EmptyState } from '../../../../components/EmptyState'
import { UrgencyBadge } from '../../../../components/UrgencyBadge'
import { formatPrice } from '../../../../utils/pricing'
import type { Job } from '../../../../types/database'

export function ActiveJobsTab() {
  const { contractor } = useContractor()
  const [jobs, setJobs] = useState<Job[]>([])
  const [loading, setLoading] = useState(true)
  const [completing, setCompleting] = useState<string | null>(null)

  const fetchActiveJobs = async () => {
    if (!contractor) return
    setLoading(true)

    // Get job IDs from accepted quotes for this contractor
    const { data: acceptedQuotes } = await supabase
      .from('quotes')
      .select('job_id')
      .eq('contractor_id', contractor.id)
      .eq('status', 'accepted')

    const jobIds = (acceptedQuotes ?? []).map((q: { job_id: string }) => q.job_id)

    if (jobIds.length === 0) {
      setJobs([])
      setLoading(false)
      return
    }

    const { data } = await supabase
      .from('jobs')
      .select('*')
      .in('id', jobIds)
      .eq('status', 'active')
      .order('created_at', { ascending: false })

    setJobs(data ?? [])
    setLoading(false)
  }

  useEffect(() => {
    fetchActiveJobs()
  }, [contractor])

  const handleMarkComplete = async (jobId: string) => {
    setCompleting(jobId)
    const { error } = await supabase
      .from('jobs')
      .update({ status: 'completed' })
      .eq('id', jobId)

    if (error) {
      toast.error(error.message)
    } else {
      toast.success('Job marked as complete!')
      setJobs((prev) => prev.filter((j) => j.id !== jobId))
    }
    setCompleting(null)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-6 h-6 rounded-full border-2 border-primary border-t-transparent animate-spin" />
      </div>
    )
  }

  if (jobs.length === 0) {
    return (
      <EmptyState
        icon={<Zap className="w-7 h-7" />}
        heading="No active jobs"
        body="When a homeowner accepts your quote, the job will appear here."
      />
    )
  }

  return (
    <div className="px-4 py-4 space-y-3">
      {jobs.map((job) => (
        <div key={job.id} className="bg-surface border border-border rounded-2xl p-4">
          <div className="flex items-start justify-between gap-2 mb-2">
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-muted uppercase tracking-wide mb-0.5">
                {job.category.replace(/_/g, ' ')}
              </p>
              <h3 className="font-semibold text-foreground leading-tight">{job.title}</h3>
            </div>
            <UrgencyBadge urgency={job.urgency} />
          </div>
          <p className="text-sm text-muted mb-1">
            {formatPrice(job.ai_price_min_cents / 100)}–
            {formatPrice(job.ai_price_max_cents / 100)}
          </p>
          <p className="text-xs text-muted mb-4">{job.zip_code}</p>
          <div className="flex gap-2">
            <button
              onClick={() => handleMarkComplete(job.id)}
              disabled={completing === job.id}
              className="flex-1 py-2 bg-success text-white text-sm font-semibold rounded-xl hover:opacity-90 active:scale-[0.98] transition-all disabled:opacity-60"
            >
              {completing === job.id ? 'Marking…' : 'Mark as Complete'}
            </button>
            <button
              onClick={() => toast('Messaging coming soon')}
              className="px-4 py-2 border border-border text-muted text-sm font-medium rounded-xl hover:border-foreground hover:text-foreground transition-colors"
            >
              <MessageSquare className="w-4 h-4" />
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}
