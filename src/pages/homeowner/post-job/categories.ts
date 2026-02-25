export const CATEGORY_LABELS: Record<string, string> = {
  plumbing: 'Plumbing',
  electrical: 'Electrical',
  hvac: 'HVAC',
  handyman: 'Handyman',
  painting: 'Painting',
  roofing: 'Roofing',
  landscaping: 'Landscaping',
  carpentry: 'Carpentry',
  other: 'Other',
}

export const CATEGORIES = Object.entries(CATEGORY_LABELS).map(([key, label]) => ({
  key,
  label,
}))
