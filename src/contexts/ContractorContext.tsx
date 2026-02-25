import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from './AuthContext'
import type { Contractor } from '../types/database'

interface ContractorContextType {
  contractor: Contractor | null
  loading: boolean
  error: string | null
  refresh: () => Promise<void>
}

const ContractorContext = createContext<ContractorContextType | undefined>(undefined)

export function ContractorProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  const [contractor, setContractor] = useState<Contractor | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchContractor = useCallback(async () => {
    if (!user) {
      setContractor(null)
      setLoading(false)
      return
    }

    setLoading(true)
    setError(null)

    const { data, error: fetchError } = await supabase
      .from('contractors')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle()

    if (fetchError) {
      setError(fetchError.message)
    } else {
      setContractor(data)
    }
    setLoading(false)
  }, [user])

  useEffect(() => {
    fetchContractor()
  }, [fetchContractor])

  return (
    <ContractorContext.Provider
      value={{ contractor, loading, error, refresh: fetchContractor }}
    >
      {children}
    </ContractorContext.Provider>
  )
}

export function useContractor() {
  const context = useContext(ContractorContext)
  if (context === undefined) {
    throw new Error('useContractor must be used within a ContractorProvider')
  }
  return context
}
