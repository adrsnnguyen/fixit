import { useEffect, useState } from 'react'
import { ChevronDown, ChevronUp } from 'lucide-react'
import { supabase } from '../../../lib/supabase'
import type { Job, Quote } from '../../../types/database'
import { formatPrice } from '../../../utils/pricing'

interface JobWithProfile extends Job {
  homeowner_profile: { full_name: string } | null
}

const STATUS_CLASSES: Record<string, string> = {
  open: 'bg-blue-100 text-blue-700',
  matched: 'bg-yellow-100 text-yellow-700',
  active: 'bg-green-100 text-green-700',
  completed: 'bg-gray-100 text-gray-600',
  cancelled: 'bg-red-100 text-red-600',
}

export function AdminJobsTab() {
  const [jobs, setJobs] = useState<JobWithProfile[]>([])
  const [loading, setLoading] = useState(true)
  const [expandedJobId, setExpandedJobId] = useState<string | null>(null)
  const [quotesMap, setQuotesMap] = useState<Record<string, Quote[]>>({})
  const [loadingQuotes, setLoadingQuotes] = useState<string | null>(null)

  useEffect(() => {
    const fetchJobs = async () => {
      setLoading(true)
      const { data } = await supabase
        .from('jobs')
        .select('*, homeowner_profile:profiles!jobs_homeowner_id_fkey(full_name)')
        .order('created_at', { ascending: false })

      setJobs((data as JobWithProfile[]) ?? [])
      setLoading(false)
    }

    fetchJobs()
  }, [])

  const toggleExpand = async (jobId: string) => {
    if (expandedJobId === jobId) {
      setExpandedJobId(null)
      return
    }
    setExpandedJobId(jobId)

    if (!quotesMap[jobId]) {
      setLoadingQuotes(jobId)
      const { data } = await supabase
        .from('quotes')
        .select('*')
        .eq('job_id', jobId)
        .order('amount_cents', { ascending: true })

      setQuotesMap((prev) => ({ ...prev, [jobId]: data ?? [] }))
      setLoadingQuotes(null)
    }
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
      <h2 className="text-lg font-bold text-gray-900">All Jobs ({jobs.length})</h2>

      {jobs.length === 0 ? (
        <p className="text-sm text-gray-400 py-8 text-center">No jobs yet.</p>
      ) : (
        <div className="space-y-2">
          {jobs.map((job) => {
            const isExpanded = expandedJobId === job.id
            const quotes = quotesMap[job.id]

            return (
              <div key={job.id} className="bg-white border border-gray-100 rounded-2xl overflow-hidden">
                <button
                  onClick={() => toggleExpand(job.id)}
                  className="w-full px-4 py-4 flex items-center gap-3 text-left hover:bg-gray-50 transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-0.5">
                      <p className="font-semibold text-gray-900 truncate">{job.title}</p>
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full shrink-0 ${STATUS_CLASSES[job.status] ?? 'bg-gray-100 text-gray-500'}`}>
                        {job.status}
                      </span>
                    </div>
                    <p className="text-xs text-gray-400">
                      {job.homeowner_profile?.full_name ?? 'Unknown'} · {job.zip_code}
                    </p>
                  </div>
                  {isExpanded ? (
                    <ChevronUp className="w-4 h-4 text-gray-400 shrink-0" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-gray-400 shrink-0" />
                  )}
                </button>

                {isExpanded && (
                  <div className="border-t border-gray-50 px-4 pb-4 pt-3">
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">
                      Quotes
                    </p>
                    {loadingQuotes === job.id ? (
                      <div className="flex justify-center py-4">
                        <div className="w-4 h-4 rounded-full border-2 border-blue-600 border-t-transparent animate-spin" />
                      </div>
                    ) : quotes && quotes.length > 0 ? (
                      <div className="space-y-2">
                        {quotes.map((q) => (
                          <div
                            key={q.id}
                            className="flex items-center justify-between text-sm text-gray-700 border-b border-gray-50 pb-2 last:border-0 last:pb-0"
                          >
                            <span className="text-gray-400 text-xs">{q.contractor_id.slice(0, 8)}…</span>
                            <span className="font-semibold">{formatPrice(q.amount_cents / 100)}</span>
                            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                              q.status === 'accepted' ? 'bg-green-100 text-green-700'
                              : q.status === 'rejected' ? 'bg-red-100 text-red-600'
                              : 'bg-yellow-100 text-yellow-700'
                            }`}>
                              {q.status}
                            </span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-gray-400">No quotes yet.</p>
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
