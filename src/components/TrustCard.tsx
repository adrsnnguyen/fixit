import { CheckCircle, User } from 'lucide-react'
import type { Profile } from '../types/database'

type TrustProfile = Pick<
  Profile,
  | 'full_name'
  | 'avatar_url'
  | 'total_jobs_completed'
  | 'is_payment_method_on_file'
  | 'is_phone_verified'
>

interface TrustCardProps {
  profile: TrustProfile
}

export function TrustCard({ profile }: TrustCardProps) {
  return (
    <div className="bg-surface border border-border rounded-2xl p-4">
      <div className="flex items-center gap-3 mb-3">
        {profile.avatar_url ? (
          <img
            src={profile.avatar_url}
            alt={profile.full_name}
            className="w-12 h-12 rounded-full object-cover border border-border"
          />
        ) : (
          <div className="w-12 h-12 rounded-full bg-border flex items-center justify-center">
            <User className="w-6 h-6 text-muted" />
          </div>
        )}
        <div>
          <p className="font-semibold text-foreground">{profile.full_name}</p>
          <p className="text-xs text-muted">{profile.total_jobs_completed} jobs completed</p>
        </div>
      </div>
      <div className="flex items-center gap-4 flex-wrap">
        {profile.is_payment_method_on_file && (
          <div className="flex items-center gap-1 text-xs text-success">
            <CheckCircle className="w-3.5 h-3.5" />
            Payment verified
          </div>
        )}
        {profile.is_phone_verified && (
          <div className="flex items-center gap-1 text-xs text-success">
            <CheckCircle className="w-3.5 h-3.5" />
            Phone verified
          </div>
        )}
        {!profile.is_payment_method_on_file && !profile.is_phone_verified && (
          <span className="text-xs text-muted">No verifications yet</span>
        )}
      </div>
    </div>
  )
}
