import type { VerificationStatus } from '../types/database'

interface Props {
  rating_count: number
  rating_avg: number | null
  verification_status: VerificationStatus
}

export function ContractorBadges({ rating_count, rating_avg, verification_status }: Props) {
  const badges: { label: string; className: string }[] = []

  if (rating_count >= 10 && rating_avg !== null && rating_avg >= 4.5) {
    badges.push({
      label: '⭐ Top Rated',
      className: 'bg-amber-100 text-amber-800',
    })
  }

  if (verification_status === 'verified') {
    badges.push({
      label: '✓ Verified',
      className: 'bg-green-100 text-green-800',
    })
  }

  if (rating_count < 5) {
    badges.push({
      label: '🚀 New Pro',
      className: 'bg-blue-100 text-blue-800',
    })
  } else {
    badges.push({
      label: '✓ Experienced',
      className: 'bg-gray-100 text-gray-700',
    })
  }

  return (
    <div className="flex flex-wrap gap-1">
      {badges.map((b) => (
        <span
          key={b.label}
          className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${b.className}`}
        >
          {b.label}
        </span>
      ))}
    </div>
  )
}
