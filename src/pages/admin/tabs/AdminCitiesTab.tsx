import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { supabase } from '../../../lib/supabase'
import type { CityWithThreshold, CityStatus } from '../../../types/database'

const STATUS_CLASSES: Record<CityStatus, string> = {
  live: 'bg-green-100 text-green-700',
  pre_launch: 'bg-yellow-100 text-yellow-700',
  waitlisted: 'bg-gray-100 text-gray-500',
}

const STATUS_LABEL: Record<CityStatus, string> = {
  live: 'Live',
  pre_launch: 'Pre-launch',
  waitlisted: 'Waitlisted',
}

export function AdminCitiesTab() {
  const [cities, setCities] = useState<CityWithThreshold[]>([])
  const [loading, setLoading] = useState(true)
  const [activating, setActivating] = useState<string | null>(null)

  // Add city form
  const [showForm, setShowForm] = useState(false)
  const [newName, setNewName] = useState('')
  const [newState, setNewState] = useState('')
  const [newZips, setNewZips] = useState('')
  const [adding, setAdding] = useState(false)

  const fetchCities = async () => {
    setLoading(true)
    const { data } = await supabase
      .from('cities')
      .select('*, threshold:city_launch_thresholds(*)')
      .order('name')

    setCities((data as CityWithThreshold[]) ?? [])
    setLoading(false)
  }

  useEffect(() => {
    fetchCities()
  }, [])

  const handleActivate = async (id: string) => {
    setActivating(id)
    const { error } = await supabase
      .from('cities')
      .update({ status: 'live' })
      .eq('id', id)

    if (error) {
      toast.error(error.message)
    } else {
      toast.success('City activated!')
      setCities((prev) =>
        prev.map((c) => (c.id === id ? { ...c, status: 'live' } : c)),
      )
    }
    setActivating(null)
  }

  const handleAddCity = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newName.trim() || !newState.trim()) return
    setAdding(true)

    const zipCodes = newZips
      .split(',')
      .map((z) => z.trim())
      .filter(Boolean)

    const { error } = await supabase
      .from('cities')
      .insert({ name: newName.trim(), state: newState.trim(), zip_codes: zipCodes, status: 'waitlisted' })

    if (error) {
      toast.error(error.message)
    } else {
      toast.success('City added!')
      setNewName('')
      setNewState('')
      setNewZips('')
      setShowForm(false)
      fetchCities()
    }
    setAdding(false)
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
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-gray-900">Cities ({cities.length})</h2>
        <button
          onClick={() => setShowForm((v) => !v)}
          className="px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-xl hover:bg-blue-700 transition-colors"
        >
          {showForm ? 'Cancel' : '+ Add City'}
        </button>
      </div>

      {showForm && (
        <form
          onSubmit={handleAddCity}
          className="bg-white border border-gray-100 rounded-2xl p-4 space-y-3"
        >
          <p className="text-sm font-semibold text-gray-700">New city</p>
          <input
            required
            placeholder="City name"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
          />
          <input
            required
            placeholder="State (e.g. TX)"
            value={newState}
            onChange={(e) => setNewState(e.target.value)}
            className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
          />
          <input
            placeholder="Zip codes (comma-separated)"
            value={newZips}
            onChange={(e) => setNewZips(e.target.value)}
            className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
          />
          <button
            type="submit"
            disabled={adding}
            className="w-full py-2 bg-blue-600 text-white text-sm font-semibold rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-60"
          >
            {adding ? 'Adding…' : 'Add City'}
          </button>
        </form>
      )}

      <div className="space-y-3">
        {cities.map((city) => (
          <div
            key={city.id}
            className="bg-white border border-gray-100 rounded-2xl p-4 flex items-center justify-between gap-4"
          >
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <p className="font-semibold text-gray-900">{city.name}, {city.state}</p>
                <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${STATUS_CLASSES[city.status]}`}>
                  {STATUS_LABEL[city.status]}
                </span>
              </div>
              <p className="text-xs text-gray-400 mt-0.5">
                {city.zip_codes.length} zip code{city.zip_codes.length !== 1 ? 's' : ''}
              </p>
            </div>

            {city.status !== 'live' && (
              <button
                onClick={() => handleActivate(city.id)}
                disabled={activating === city.id}
                className="px-4 py-2 bg-green-600 text-white text-sm font-semibold rounded-xl hover:bg-green-700 transition-all disabled:opacity-60 shrink-0"
              >
                {activating === city.id ? 'Activating…' : 'Activate'}
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
