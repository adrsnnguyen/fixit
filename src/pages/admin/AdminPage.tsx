import { useState } from 'react'
import { Wrench } from 'lucide-react'
import toast from 'react-hot-toast'
import { AdminDashboardTab } from './tabs/AdminDashboardTab'
import { AdminContractorsTab } from './tabs/AdminContractorsTab'
import { AdminCitiesTab } from './tabs/AdminCitiesTab'
import { AdminJobsTab } from './tabs/AdminJobsTab'

type AdminTab = 'dashboard' | 'contractors' | 'cities' | 'jobs'

const TABS: { id: AdminTab; label: string }[] = [
  { id: 'dashboard', label: 'Overview' },
  { id: 'contractors', label: 'Contractors' },
  { id: 'cities', label: 'Cities' },
  { id: 'jobs', label: 'Jobs' },
]

export default function AdminPage() {
  const [authed, setAuthed] = useState(
    () => sessionStorage.getItem('admin_authed') === 'true',
  )
  const [password, setPassword] = useState('')
  const [activeTab, setActiveTab] = useState<AdminTab>('dashboard')

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    if (password === import.meta.env.VITE_ADMIN_PASSWORD) {
      sessionStorage.setItem('admin_authed', 'true')
      setAuthed(true)
    } else {
      toast.error('Incorrect password')
    }
  }

  if (!authed) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="bg-white border border-gray-100 rounded-2xl p-8 w-full max-w-sm space-y-6">
          <div className="flex items-center gap-2 font-bold text-xl text-blue-600">
            <Wrench className="w-5 h-5" />
            <span>FixIt Admin</span>
          </div>
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Admin password
              </label>
              <input
                type="password"
                required
                autoFocus
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors"
              />
            </div>
            <button
              type="submit"
              className="w-full py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-colors"
            >
              Sign in
            </button>
          </form>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top bar */}
      <div className="bg-white border-b border-gray-100 px-4 h-14 flex items-center justify-between">
        <div className="flex items-center gap-2 font-bold text-blue-600">
          <Wrench className="w-5 h-5" />
          <span>FixIt Admin</span>
        </div>
        <button
          onClick={() => {
            sessionStorage.removeItem('admin_authed')
            setAuthed(false)
          }}
          className="text-xs text-gray-400 hover:text-gray-700 transition-colors"
        >
          Sign out
        </button>
      </div>

      {/* Tab bar */}
      <div className="bg-white border-b border-gray-100 px-4 flex gap-1 overflow-x-auto">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={[
              'px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap',
              activeTab === tab.id
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700',
            ].join(' ')}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab panels — hidden-div pattern */}
      <div className={activeTab === 'dashboard' ? '' : 'hidden'}>
        <AdminDashboardTab />
      </div>
      <div className={activeTab === 'contractors' ? '' : 'hidden'}>
        <AdminContractorsTab />
      </div>
      <div className={activeTab === 'cities' ? '' : 'hidden'}>
        <AdminCitiesTab />
      </div>
      <div className={activeTab === 'jobs' ? '' : 'hidden'}>
        <AdminJobsTab />
      </div>
    </div>
  )
}
