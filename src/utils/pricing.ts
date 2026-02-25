// ────────────────────────────────────────────────────────────────────────────
// Service catalogue
// ────────────────────────────────────────────────────────────────────────────

export const SERVICE_CATEGORIES = {
  plumbing: { label: 'Plumbing', basePrice: 80, hourlyRate: 65, icon: '🔧' },
  electrical: { label: 'Electrical', basePrice: 90, hourlyRate: 75, icon: '⚡' },
  cleaning: { label: 'House Cleaning', basePrice: 60, hourlyRate: 30, icon: '🧹' },
  landscaping: { label: 'Landscaping', basePrice: 50, hourlyRate: 40, icon: '🌿' },
  painting: { label: 'Painting', basePrice: 70, hourlyRate: 35, icon: '🎨' },
  carpentry: { label: 'Carpentry', basePrice: 85, hourlyRate: 60, icon: '🪚' },
  hvac: { label: 'HVAC', basePrice: 100, hourlyRate: 85, icon: '❄️' },
  moving: { label: 'Moving', basePrice: 120, hourlyRate: 50, icon: '📦' },
  pest_control: { label: 'Pest Control', basePrice: 75, hourlyRate: 40, icon: '🐛' },
  appliance_repair: { label: 'Appliance Repair', basePrice: 65, hourlyRate: 55, icon: '🔌' },
} as const

export type ServiceCategory = keyof typeof SERVICE_CATEGORIES

// ────────────────────────────────────────────────────────────────────────────
// Platform constants
// ────────────────────────────────────────────────────────────────────────────

/** Platform commission taken from the customer's total */
export const PLATFORM_FEE_RATE = 0.15 // 15 %

/** Sales tax rate — adjust per jurisdiction */
export const TAX_RATE = 0.08 // 8 %

// ────────────────────────────────────────────────────────────────────────────
// Price breakdown
// ────────────────────────────────────────────────────────────────────────────

export interface PriceBreakdown {
  /** Flat call-out / first-hour fee */
  basePrice: number
  /** Cost of additional hours beyond the first */
  hourlyTotal: number
  /** basePrice + hourlyTotal */
  subtotal: number
  /** Platform commission (PLATFORM_FEE_RATE × subtotal) */
  platformFee: number
  /** Tax on (subtotal + platformFee) */
  tax: number
  /** Amount the customer pays */
  total: number
}

/**
 * Calculate a full price breakdown for a service booking.
 *
 * @param category  - Service category key
 * @param hours     - Estimated job duration in hours (min 1)
 * @param includePlatformFee - Pass false to get the raw provider-side total
 */
export function calculateServicePrice(
  category: ServiceCategory,
  hours: number,
  includePlatformFee = true,
): PriceBreakdown {
  const service = SERVICE_CATEGORIES[category]
  const clampedHours = Math.max(1, hours)

  const basePrice = service.basePrice
  // Additional hours after the first are billed at the hourly rate
  const hourlyTotal = service.hourlyRate * (clampedHours - 1)
  const subtotal = basePrice + hourlyTotal

  const platformFee = includePlatformFee ? subtotal * PLATFORM_FEE_RATE : 0
  const preTax = subtotal + platformFee
  const tax = preTax * TAX_RATE
  const total = preTax + tax

  return { basePrice, hourlyTotal, subtotal, platformFee, tax, total }
}

// ────────────────────────────────────────────────────────────────────────────
// Provider payout
// ────────────────────────────────────────────────────────────────────────────

/**
 * Net amount a provider receives after the platform takes its fee.
 * Providers are NOT charged tax — that is a customer-side cost.
 *
 * @param subtotal - The job subtotal (basePrice + hourlyTotal)
 */
export function calculateProviderPayout(subtotal: number): number {
  return subtotal * (1 - PLATFORM_FEE_RATE)
}

// ────────────────────────────────────────────────────────────────────────────
// Formatting helpers
// ────────────────────────────────────────────────────────────────────────────

const usdFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  minimumFractionDigits: 2,
})

/** Format a number as a USD currency string, e.g. $1,234.56 */
export function formatPrice(amount: number): string {
  return usdFormatter.format(amount)
}

/**
 * Quick human-readable estimate string for a category + hour combo.
 * Example: "Plumbing · 2 hrs → $191.62"
 */
export function getQuoteLabel(category: ServiceCategory, hours: number): string {
  const { total } = calculateServicePrice(category, hours)
  const { label } = SERVICE_CATEGORIES[category]
  const hrLabel = hours === 1 ? '1 hr' : `${hours} hrs`
  return `${label} · ${hrLabel} → ${formatPrice(total)}`
}

// ────────────────────────────────────────────────────────────────────────────
// Contractor-side fee (13% flat)
// ────────────────────────────────────────────────────────────────────────────

const CONTRACTOR_FEE_RATE = 0.13

/**
 * Platform fee deducted from a contractor's quote amount.
 * Returns integer cents.
 *
 * @param amountCents - The contractor's quoted price in cents
 */
export function calculatePlatformFee(amountCents: number): number {
  return Math.round(amountCents * CONTRACTOR_FEE_RATE)
}

/**
 * Net payout to the contractor after the platform takes its 13% fee.
 * Returns integer cents. Divide by 100 before passing to formatPrice().
 *
 * @param amountCents - The contractor's quoted price in cents
 */
export function contractorPayout(amountCents: number): number {
  return amountCents - calculatePlatformFee(amountCents)
}
