import { useEffect, useState } from 'react'
import { MapPin } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import type { CityWithThreshold, CityStatus } from '../../types/database'

interface CityLaunchSectionProps {
  onJoinWaitlist: (role: 'homeowner' | 'contractor') => void
}

const STATUS_LABEL: Record<CityStatus, string> = {
  live: 'Live',
  pre_launch: 'Pre-launch',
  waitlisted: 'Coming soon',
}

const STATUS_CLASSES: Record<CityStatus, string> = {
  live: 'bg-green-100 text-green-700',
  pre_launch: 'bg-yellow-100 text-yellow-700',
  waitlisted: 'bg-gray-100 text-gray-500',
}

function ProgressBar({ current, target, label }: { current: number; target: number; label: string }) {
  const pct = Math.min(100, Math.round((current / target) * 100))
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-xs text-gray-500">
        <span>{label}</span>
        <span>{current}/{target}</span>
      </div>
      <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
        <div
          className="h-full bg-yellow-400 rounded-full transition-all"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  )
}

export function CityLaunchSection({ onJoinWaitlist }: CityLaunchSectionProps) {
  const [cities, setCities] = useState<CityWithThreshold[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchCities = async () => {
      const { data } = await supabase
        .from('cities')
        .select('*, threshold:city_launch_thresholds(*)')
        .order('name')

      setCities((data as CityWithThreshold[]) ?? [])
      setLoading(false)
    }

    fetchCities()
  }, [])

  if (loading) return null

  return (
    <section className="py-14 px-4 bg-gray-50">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-10">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Available cities</h2>
          <p className="text-sm text-gray-500">
            Join the waitlist in your city — we launch when demand is ready.
          </p>
        </div>

        {cities.length === 0 ? (
          <p className="text-center text-gray-400 text-sm py-8">
            No cities listed yet. Check back soon!
          </p>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {cities.map((city) => (
              <div
                key={city.id}
                className="bg-white border border-gray-100 rounded-2xl p-5 space-y-4"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-gray-400 shrink-0" />
                    <div>
                      <p className="font-semibold text-gray-900">{city.name}</p>
                      <p className="text-xs text-gray-400">{city.state}</p>
                    </div>
                  </div>
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${STATUS_CLASSES[city.status]}`}>
                    {STATUS_LABEL[city.status]}
                  </span>
                </div>

                {city.status === 'pre_launch' && city.threshold && (
                  <div className="space-y-2">
                    <ProgressBar
                      current={city.threshold.homeowner_current}
                      target={city.threshold.homeowner_target}
                      label="Homeowners"
                    />
                    <ProgressBar
                      current={city.threshold.contractor_current}
                      target={city.threshold.contractor_target}
                      label="Contractors"
                    />
                  </div>
                )}

                {city.status !== 'live' && (
                  <button
                    onClick={() => onJoinWaitlist('homeowner')}
                    className="w-full py-2 text-sm font-medium text-blue-600 border border-blue-200 rounded-xl hover:bg-blue-50 transition-colors"
                  >
                    Join waitlist
                  </button>
                )}

                {city.status === 'live' && (
                  <div className="flex items-center gap-1.5 text-xs text-green-600 font-medium">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-500 inline-block animate-pulse" />
                    Accepting jobs now
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
