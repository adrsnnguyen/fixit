import { type ReactNode, useCallback, useEffect, useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'
import { RatingInterstitial } from './RatingInterstitial'

interface PendingRating {
  jobId: string
  raterRole: 'homeowner' | 'contractor'
}

interface Props {
  children: ReactNode
}

export function RatingGate({ children }: Props) {
  const { user, loading: authLoading } = useAuth()
  const [pending, setPending] = useState<PendingRating | null>(null)

  const checkPendingRatings = useCallback(async () => {
    if (!user) {
      setPending(null)
      return
    }

    // Check homeowner first
    const [completedJobsResult, existingRatingsResult] = await Promise.all([
      supabase.from('jobs').select('id').eq('homeowner_id', user.id).eq('status', 'completed'),
      supabase
        .from('ratings')
        .select('job_id')
        .eq('homeowner_id', user.id)
        .eq('rater_role', 'homeowner'),
    ])

    const completedJobIds = new Set((completedJobsResult.data ?? []).map((j: { id: string }) => j.id))
    const ratedJobIds = new Set(
      (existingRatingsResult.data ?? []).map((r: { job_id: string }) => r.job_id),
    )

    for (const jobId of completedJobIds) {
      if (!ratedJobIds.has(jobId)) {
        setPending({ jobId, raterRole: 'homeowner' })
        return
      }
    }

    // Check contractor
    const { data: cr } = await supabase
      .from('contractors')
      .select('id')
      .eq('user_id', user.id)
      .maybeSingle()

    if (!cr) {
      setPending(null)
      return
    }

    const { data: acceptedQuotes } = await supabase
      .from('quotes')
      .select('job_id')
      .eq('contractor_id', cr.id)
      .eq('status', 'accepted')

    const quotedJobIds = (acceptedQuotes ?? []).map((q: { job_id: string }) => q.job_id)

    if (quotedJobIds.length === 0) {
      setPending(null)
      return
    }

    const [contractorCompletedResult, contractorRatingsResult] = await Promise.all([
      supabase.from('jobs').select('id').in('id', quotedJobIds).eq('status', 'completed'),
      supabase
        .from('ratings')
        .select('job_id')
        .eq('contractor_id', cr.id)
        .eq('rater_role', 'contractor'),
    ])

    const contractorCompletedIds = new Set(
      (contractorCompletedResult.data ?? []).map((j: { id: string }) => j.id),
    )
    const contractorRatedIds = new Set(
      (contractorRatingsResult.data ?? []).map((r: { job_id: string }) => r.job_id),
    )

    for (const jobId of contractorCompletedIds) {
      if (!contractorRatedIds.has(jobId)) {
        setPending({ jobId, raterRole: 'contractor' })
        return
      }
    }

    setPending(null)
  }, [user])

  useEffect(() => {
    if (!authLoading) {
      checkPendingRatings()
    }
  }, [authLoading, checkPendingRatings])

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
      </div>
    )
  }

  if (pending) {
    return (
      <RatingInterstitial
        jobId={pending.jobId}
        raterRole={pending.raterRole}
        onComplete={checkPendingRatings}
      />
    )
  }

  return <>{children}</>
}
