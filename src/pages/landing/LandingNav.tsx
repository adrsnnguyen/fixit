import { Link } from 'react-router-dom'
import { Wrench } from 'lucide-react'

export function LandingNav() {
  return (
    <nav className="fixed top-0 inset-x-0 z-40 bg-white/90 backdrop-blur-sm border-b border-gray-100">
      <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
        <div className="flex items-center gap-2 font-bold text-xl text-blue-600">
          <Wrench className="w-5 h-5" />
          <span>FixIt</span>
        </div>
        <Link
          to="/login"
          className="text-sm font-medium text-gray-600 hover:text-blue-600 transition-colors"
        >
          Sign In
        </Link>
      </div>
    </nav>
  )
}
