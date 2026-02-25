import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Briefcase, Plus, User } from 'lucide-react'
import { supabase } from '../../../lib/supabase'
import { useAuth } from '../../../contexts/AuthContext'
import { TabBar } from '../../../components/TabBar'
import { MyJobsTab } from './tabs/MyJobsTab'
import { HomeownerProfileTab } from './tabs/HomeownerProfileTab'

const TABS = [
  { id: 'jobs', label: 'My Jobs', icon: <Briefcase className="w-5 h-5" /> },
  { id: 'post', label: 'Post Job', icon: <Plus className="w-5 h-5" /> },
  { id: 'profile', label: 'Profile', icon: <User className="w-5 h-5" /> },
]

const TAB_LABELS: Record<string, string> = {
  jobs: 'My Jobs',
  profile: 'Profile',
}

export default function HomeownerDashboard() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('jobs')
  const [firstName, setFirstName] = useState('')

  useEffect(() => {
    if (!user) return

    supabase
      .from('profiles')
      .select('full_name')
      .eq('user_id', user.id)
      .single()
      .then(({ data }) => {
        if (data?.full_name) {
          setFirstName(data.full_name.split(' ')[0])
        }
      })
  }, [user])

  const handleTabChange = (tabId: string) => {
    if (tabId === 'post') {
      navigate('/homeowner/post-job')
      return
    }
    setActiveTab(tabId)
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <div className="bg-surface border-b border-border px-4 pt-4 pb-3 shrink-0">
        <h1 className="text-lg font-bold text-foreground">{TAB_LABELS[activeTab] ?? activeTab}</h1>
        {firstName && <p className="text-xs text-muted">Hey, {firstName}</p>}
      </div>

      {/* Tab content */}
      <div className="flex-1 overflow-y-auto pb-20">
        <div className={activeTab === 'jobs' ? '' : 'hidden'}>
          <MyJobsTab />
        </div>
        <div className={activeTab === 'profile' ? '' : 'hidden'}>
          <HomeownerProfileTab />
        </div>
      </div>

      <TabBar tabs={TABS} activeTab={activeTab} onTabChange={handleTabChange} />
    </div>
  )
}
