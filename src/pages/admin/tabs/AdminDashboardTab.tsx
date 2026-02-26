import { useEffect, useState } from 'react'
import { supabase } from '../../../lib/supabase'

interface Stats {
  homeowners: number
  contractors: number
  openJobs: number
  activeJobs: number
  completedJobs: number
  waitlistSignups: number
}

function StatCard({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="bg-white border border-gray-100 rounded-2xl p-5">
      <p className="text-xs font-medium text-gray-400 mb-1">{label}</p>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
    </div>
  )
}

export function AdminDashboardTab() {
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchStats = async () => {
      const [profilesRes, contractorsRes, jobsRes, waitlistRes] = await Promise.all([
        supabase.from('profiles').select('role', { count: 'exact', head: false }),
        supabase.from('contractors').select('id', { count: 'exact', head: false }),
        supabase.from('jobs').select('status'),
        supabase.from('waitlist').select('id', { count: 'exact', head: false }),
      ])

      const profiles = profilesRes.data ?? []
      const jobs = jobsRes.data ?? []

      setStats({
        homeowners: profiles.filter((p: { role: string }) => p.role === 'homeowner').length,
        contractors: contractorsRes.count ?? 0,
        openJobs: jobs.filter((j: { status: string }) => j.status === 'open').length,
        activeJobs: jobs.filter((j: { status: string }) => ['matched', 'active'].includes(j.status)).length,
        completedJobs: jobs.filter((j: { status: string }) => j.status === 'completed').length,
        waitlistSignups: waitlistRes.count ?? 0,
      })

      setLoading(false)
    }

    fetchStats()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-6 h-6 rounded-full border-2 border-blue-600 border-t-transparent animate-spin" />
      </div>
    )
  }

  if (!stats) return null

  return (
    <div className="p-6 space-y-4">
      <h2 className="text-lg font-bold text-gray-900">Overview</h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        <StatCard label="Homeowners" value={stats.homeowners} />
        <StatCard label="Contractors" value={stats.contractors} />
        <StatCard label="Open jobs" value={stats.openJobs} />
        <StatCard label="Active jobs" value={stats.activeJobs} />
        <StatCard label="Completed jobs" value={stats.completedJobs} />
        <StatCard label="Waitlist signups" value={stats.waitlistSignups} />
      </div>
    </div>
  )
}
