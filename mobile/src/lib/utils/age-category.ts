export type AgeCategory = 'minik_a' | 'minik_b' | 'kucukler' | 'yildizlar' | 'gencler'

export const AGE_CATEGORY_LABELS: Record<AgeCategory, string> = {
  minik_a: 'Minik A',
  minik_b: 'Minik B',
  kucukler: 'Küçükler',
  yildizlar: 'Yıldızlar',
  gencler: 'Gençler',
}

export function calculateAgeCategory(dob: Date, seasonStart?: Date): AgeCategory | null {
  const ref = seasonStart ?? new Date(new Date().getFullYear(), 8, 1)
  const age = Math.floor((ref.getTime() - dob.getTime()) / (365.25 * 24 * 60 * 60 * 1000))

  if (age >= 6 && age <= 7) return 'minik_a'
  if (age >= 8 && age <= 9) return 'minik_b'
  if (age >= 10 && age <= 11) return 'kucukler'
  if (age >= 12 && age <= 13) return 'yildizlar'
  if (age >= 14 && age <= 17) return 'gencler'

  return null
}
