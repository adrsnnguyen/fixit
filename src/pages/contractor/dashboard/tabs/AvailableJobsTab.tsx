import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Briefcase } from 'lucide-react'
import { supabase } from '../../../../lib/supabase'
import { useContractor } from '../../../../contexts/ContractorContext'
import { JobCard } from '../../../../components/JobCard'
import { EmptyState } from '../../../../components/EmptyState'
import type { Job } from '../../../../types/database'

export function AvailableJobsTab() {
  const { contractor } = useContractor()
  const navigate = useNavigate()
  const [jobs, setJobs] = useState<Job[]>([])
  const [loading, setLoading] = useState(true)
  const [aiMatchBannerVisible, setAiMatchBannerVisible] = useState(false)

  useEffect(() => {
    if (!contractor) return

    const fetchJobs = async () => {
      setLoading(true)

      // Data contract: job.category values must match contractor.trade_types exactly
      // Both use lowercase-with-underscores (e.g. 'plumbing', 'hvac', 'pest_control')
      let query = supabase
        .from('jobs')
        .select('*')
        .in('status', ['open', 'matched'])
        .order('created_at', { ascending: false })

      if (contractor.trade_types.length > 0) {
        query = query.in('category', contractor.trade_types)
      }

      if (contractor.service_zip_codes.length > 0) {
        query = query.in('zip_code', contractor.service_zip_codes)
      }

      const { data } = await query
      setJobs(data ?? [])
      setLoading(false)
    }

    fetchJobs()
  }, [contractor])

  useEffect(() => {
    if (!contractor) return

    // Check if there are any recent AI matches (last 24h)
    const checkAiMatches = async () => {
      const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
      const { data } = await supabase
        .from('ai_matches')
        .select('id')
        .eq('contractor_id', contractor.id)
        .gte('created_at', since)
        .limit(1)

      if (data && data.length > 0) {
        setAiMatchBannerVisible(true)
      }
    }

    checkAiMatches()

    // Subscribe to new AI matches in real-time
    const channel = supabase
      .channel(`ai_matches_${contractor.id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'ai_matches',
          filter: `contractor_id=eq.${contractor.id}`,
        },
        () => setAiMatchBannerVisible(true),
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [contractor])

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
        icon={<Briefcase className="w-7 h-7" />}
        heading="No jobs available"
        body="We'll show jobs matching your trade and service area here. Check back soon."
      />
    )
  }

  return (
    <div className="px-4 py-4 space-y-3">
      {aiMatchBannerVisible && (
        <div className="bg-primary/5 border border-primary/20 rounded-2xl p-3 flex items-center justify-between gap-2">
          <p className="text-sm text-primary font-medium">✨ New job matched to you!</p>
          <button
            onClick={() => setAiMatchBannerVisible(false)}
            className="text-muted text-xs font-medium"
          >
            Dismiss
          </button>
        </div>
      )}
      <p className="text-xs text-muted font-medium px-1">
        {jobs.length} job{jobs.length !== 1 ? 's' : ''} available
      </p>
      {jobs.map((job) => (
        <JobCard
          key={job.id}
          job={job}
          onClick={() => navigate(`/contractor/jobs/${job.id}`)}
        />
      ))}
    </div>
  )
}
