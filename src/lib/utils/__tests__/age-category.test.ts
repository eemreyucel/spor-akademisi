import { describe, it, expect } from 'vitest'
import { calculateAgeCategory } from '../age-category'

describe('calculateAgeCategory', () => {
  const seasonStart = new Date(2025, 8, 1) // Sept 1, 2025

  it('returns minik_a for ages 6-7', () => {
    const dob = new Date(2018, 0, 15)
    expect(calculateAgeCategory(dob, seasonStart)).toBe('minik_a')
  })

  it('returns minik_b for ages 8-9', () => {
    const dob = new Date(2016, 5, 1)
    expect(calculateAgeCategory(dob, seasonStart)).toBe('minik_b')
  })

  it('returns kucukler for ages 10-11', () => {
    const dob = new Date(2015, 0, 1)
    expect(calculateAgeCategory(dob, seasonStart)).toBe('kucukler')
  })

  it('returns yildizlar for ages 12-13', () => {
    const dob = new Date(2013, 3, 1)
    expect(calculateAgeCategory(dob, seasonStart)).toBe('yildizlar')
  })

  it('returns gencler for ages 14-17', () => {
    const dob = new Date(2010, 6, 1)
    expect(calculateAgeCategory(dob, seasonStart)).toBe('gencler')
  })

  it('returns null for ages outside 6-17', () => {
    const dob5 = new Date(2020, 6, 1)
    expect(calculateAgeCategory(dob5, seasonStart)).toBeNull()
    const dob18 = new Date(2007, 0, 1)
    expect(calculateAgeCategory(dob18, seasonStart)).toBeNull()
  })
})
