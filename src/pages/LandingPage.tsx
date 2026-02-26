import { useState } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { LandingNav } from './landing/LandingNav'
import { HeroSection } from './landing/HeroSection'
import { HowItWorksSection } from './landing/HowItWorksSection'
import { ComparisonTable } from './landing/ComparisonTable'
import { CityLaunchSection } from './landing/CityLaunchSection'
import { WaitlistModal } from './landing/WaitlistModal'

export default function LandingPage() {
  const { session, loading } = useAuth()
  const [modalRole, setModalRole] = useState<'homeowner' | 'contractor' | null>(null)

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-blue-600 border-t-transparent animate-spin" />
      </div>
    )
  }

  if (session) {
    return <Navigate to="/dashboard" replace />
  }

  return (
    <div className="min-h-screen bg-white">
      <LandingNav />

      <main>
        <HeroSection onCTAClick={(role) => setModalRole(role)} />
        <HowItWorksSection />
        <ComparisonTable />
        <CityLaunchSection onJoinWaitlist={(role) => setModalRole(role)} />
      </main>

      {/* Footer */}
      <footer className="py-10 px-4 border-t border-gray-100 text-center">
        <p className="text-sm text-gray-400">
          © {new Date().getFullYear()} FixIt. All rights reserved.
        </p>
      </footer>

      {modalRole && (
        <WaitlistModal
          role={modalRole}
          onClose={() => setModalRole(null)}
        />
      )}
    </div>
  )
}
