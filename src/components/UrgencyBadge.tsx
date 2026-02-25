import type { Urgency } from '../types/database'
import { Badge } from './Badge'

const URGENCY_VARIANT: Record<Urgency, 'danger' | 'warning' | 'muted'> = {
  ASAP: 'danger',
  'This Week': 'warning',
  Flexible: 'muted',
}

interface UrgencyBadgeProps {
  urgency: Urgency
}

export function UrgencyBadge({ urgency }: UrgencyBadgeProps) {
  return <Badge variant={URGENCY_VARIANT[urgency]}>{urgency}</Badge>
}
