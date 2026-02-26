// ─────────────────────────────────────────────────────────────────────────────
// Union types
// ─────────────────────────────────────────────────────────────────────────────

export type VerificationStatus = 'pending' | 'verified' | 'rejected'
export type JobStatus = 'open' | 'matched' | 'active' | 'completed' | 'cancelled'
export type Urgency = 'ASAP' | 'This Week' | 'Flexible'
export type QuoteStatus = 'pending' | 'accepted' | 'rejected'
export type Availability = 'Today' | 'Tomorrow' | 'This Week' | 'Flexible'
export type CityStatus = 'live' | 'pre_launch' | 'waitlisted'

// ─────────────────────────────────────────────────────────────────────────────
// Table interfaces
// ─────────────────────────────────────────────────────────────────────────────

export interface Contractor {
  id: string
  user_id: string
  full_name: string
  phone: string
  profile_photo_url: string | null
  bio: string
  primary_trade: string
  trade_types: string[]
  service_zip_codes: string[]
  license_photo_url: string | null
  insurance_photo_url: string | null
  verification_status: VerificationStatus
  total_earnings_cents: number
  rating_avg: number | null
  rating_count: number
  created_at: string
}

export interface Job {
  id: string
  homeowner_id: string
  category: string
  title: string
  description: string
  status: JobStatus
  urgency: Urgency
  ai_price_min_cents: number
  ai_price_max_cents: number
  zip_code: string
  address: string | null
  city_id: string | null
  photos: string[]
  created_at: string
}

export interface Quote {
  id: string
  job_id: string
  contractor_id: string
  amount_cents: number
  message: string
  availability: Availability
  status: QuoteStatus
  created_at: string
}

export interface Profile {
  id: string
  user_id: string
  full_name: string
  avatar_url: string | null
  phone: string | null
  total_jobs_completed: number
  is_payment_method_on_file: boolean
  is_phone_verified: boolean
  role: 'homeowner' | 'provider'
}

export interface Rating {
  id: string
  contractor_id: string
  homeowner_id: string
  job_id: string
  rating: number
  comment: string | null
  created_at: string
  rater_role: 'homeowner' | 'contractor'
  on_time: boolean | null
  price_accurate: boolean | null
  would_hire_again: boolean | null
  clear_instructions: boolean | null
  payment_smooth: boolean | null
  professional_interaction: boolean | null
}

export interface City {
  id: string
  name: string
  state: string
  zip_codes: string[]
  status: CityStatus
}

export interface CityLaunchThreshold {
  city_id: string
  homeowner_target: number
  contractor_target: number
  homeowner_current: number
  contractor_current: number
  updated_at: string
}

export interface CityWithThreshold extends City {
  threshold: CityLaunchThreshold | null
}

export interface Waitlist {
  id: string
  email: string
  zip_code: string
  role: 'homeowner' | 'contractor'
  created_at: string
}

// ─────────────────────────────────────────────────────────────────────────────
// Composite types for joined queries
// ─────────────────────────────────────────────────────────────────────────────

export interface QuoteWithJob extends Quote {
  job: Pick<Job, 'title' | 'category' | 'status'>
}

export interface JobWithProfile extends Job {
  homeowner_profile: Pick<
    Profile,
    | 'full_name'
    | 'avatar_url'
    | 'total_jobs_completed'
    | 'is_payment_method_on_file'
    | 'is_phone_verified'
  >
}

export interface QuoteWithContractor extends Quote {
  contractor: Pick<
    Contractor,
    | 'id'
    | 'full_name'
    | 'profile_photo_url'
    | 'verification_status'
    | 'rating_avg'
    | 'phone'
  >
}

export interface Message {
  id: string
  job_id: string
  sender_id: string
  content: string
  created_at: string
}

export interface AiMatch {
  id: string
  job_id: string
  contractor_id: string
  reason: string
  created_at: string
}
