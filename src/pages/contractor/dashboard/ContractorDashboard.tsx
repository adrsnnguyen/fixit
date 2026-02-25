import { useState } from 'react'
import { Navigate } from 'react-router-dom'
import { Briefcase, FileText, Zap, DollarSign, User } from 'lucide-react'
import { useContractor } from '../../../contexts/ContractorContext'
import { TabBar } from '../../../components/TabBar'
import { AvailableJobsTab } from './tabs/AvailableJobsTab'
import { MyQuotesTab } from './tabs/MyQuotesTab'
import { ActiveJobsTab } from './tabs/ActiveJobsTab'
import { EarningsTab } from './tabs/EarningsTab'
import { ProfileTab } from './tabs/ProfileTab'

const TABS = [
  { id: 'jobs', label: 'Jobs', icon: <Briefcase className="w-5 h-5" /> },
  { id: 'quotes', label: 'Quotes', icon: <FileText className="w-5 h-5" /> },
  { id: 'active', label: 'Active', icon: <Zap className="w-5 h-5" /> },
  { id: 'earnings', label: 'Earnings', icon: <DollarSign className="w-5 h-5" /> },
  { id: 'profile', label: 'Profile', icon: <User className="w-5 h-5" /> },
]

const TAB_LABELS: Record<string, string> = {
  jobs: 'Available Jobs',
  quotes: 'My Quotes',
  active: 'Active Jobs',
  earnings: 'Earnings',
  profile: 'Profile',
}

export default function ContractorDashboard() {
  const { contractor, loading } = useContractor()
  const [activeTab, setActiveTab] = useState('jobs')

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
      </div>
    )
  }

  // Redirect to onboarding if no contractor record yet
  if (!contractor) {
    return <Navigate to="/onboarding" replace />
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Top header */}
      <div className="bg-surface border-b border-border px-4 pt-4 pb-3 shrink-0">
        <h1 className="text-lg font-bold text-foreground">{TAB_LABELS[activeTab]}</h1>
        <p className="text-xs text-muted">Hey, {contractor.full_name.split(' ')[0]}</p>
      </div>

      {/* Tab content — all mounted, only active one visible */}
      <div className="flex-1 overflow-y-auto pb-20">
        <div className={activeTab === 'jobs' ? '' : 'hidden'}>
          <AvailableJobsTab />
        </div>
        <div className={activeTab === 'quotes' ? '' : 'hidden'}>
          <MyQuotesTab />
        </div>
        <div className={activeTab === 'active' ? '' : 'hidden'}>
          <ActiveJobsTab />
        </div>
        <div className={activeTab === 'earnings' ? '' : 'hidden'}>
          <EarningsTab />
        </div>
        <div className={activeTab === 'profile' ? '' : 'hidden'}>
          <ProfileTab />
        </div>
      </div>

      <TabBar tabs={TABS} activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  )
}
