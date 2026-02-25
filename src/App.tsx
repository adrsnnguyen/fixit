import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AuthProvider } from './contexts/AuthContext'
import { ContractorProvider } from './contexts/ContractorContext'
import { ProtectedRoute } from './components/ProtectedRoute'

// Auth pages
import LoginPage from './pages/auth/LoginPage'
import SignupPage from './pages/auth/SignupPage'
import RoleSelectPage from './pages/auth/RoleSelectPage'

// App pages
import DashboardPage from './pages/DashboardPage'
import OnboardingPage from './pages/contractor/onboarding/OnboardingPage'
import ContractorDashboard from './pages/contractor/dashboard/ContractorDashboard'
import JobDetailPage from './pages/contractor/JobDetailPage'
import HomeownerDashboard from './pages/homeowner/dashboard/HomeownerDashboard'
import PostJobPage from './pages/homeowner/post-job/PostJobPage'
import HomeownerJobDetailPage from './pages/homeowner/HomeownerJobDetailPage'
import ChatPage from './pages/chat/ChatPage'
import { RatingGate } from './components/RatingGate'

/** Layout route that protects contractor-specific pages and provides ContractorContext */
function ContractorLayout() {
  return (
    <ProtectedRoute>
      <ContractorProvider>
        <Outlet />
      </ContractorProvider>
    </ProtectedRoute>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Toaster
          position="top-center"
          toastOptions={{
            duration: 4000,
            style: {
              fontFamily: 'var(--font-sans)',
              borderRadius: '12px',
              fontSize: '14px',
            },
          }}
        />
        <RatingGate>
        <Routes>
          {/* Root redirect */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />

          {/* Public auth routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/auth/role-select" element={<RoleSelectPage />} />

          {/* General protected dashboard (role-based redirect inside) */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <DashboardPage />
              </ProtectedRoute>
            }
          />

          {/* Contractor onboarding */}
          <Route
            path="/onboarding"
            element={
              <ProtectedRoute>
                <OnboardingPage />
              </ProtectedRoute>
            }
          />

          {/* Contractor routes — share ContractorProvider via layout route */}
          <Route element={<ContractorLayout />}>
            <Route path="/contractor/dashboard" element={<ContractorDashboard />} />
            <Route path="/contractor/jobs/:jobId" element={<JobDetailPage />} />
          </Route>

          {/* Homeowner routes */}
          <Route
            path="/homeowner/dashboard"
            element={
              <ProtectedRoute>
                <HomeownerDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/homeowner/post-job"
            element={
              <ProtectedRoute>
                <PostJobPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/homeowner/jobs/:jobId"
            element={
              <ProtectedRoute>
                <HomeownerJobDetailPage />
              </ProtectedRoute>
            }
          />

          {/* Chat — accessible by both roles */}
          <Route
            path="/chat/:jobId"
            element={
              <ProtectedRoute>
                <ChatPage />
              </ProtectedRoute>
            }
          />

          {/* Catch-all */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        </RatingGate>
      </AuthProvider>
    </BrowserRouter>
  )
}
