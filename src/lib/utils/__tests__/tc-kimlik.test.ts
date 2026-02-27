import { describe, it, expect } from 'vitest'
import { validateTcKimlik } from '../tc-kimlik'

describe('validateTcKimlik', () => {
  it('rejects non-11-digit strings', () => {
    expect(validateTcKimlik('12345')).toBe(false)
    expect(validateTcKimlik('123456789012')).toBe(false)
    expect(validateTcKimlik('')).toBe(false)
  })

  it('rejects strings starting with 0', () => {
    expect(validateTcKimlik('01234567890')).toBe(false)
  })

  it('rejects non-numeric strings', () => {
    expect(validateTcKimlik('1234567890a')).toBe(false)
  })

  it('validates correct TC Kimlik numbers', () => {
    expect(validateTcKimlik('10000000146')).toBe(true)
  })

  it('rejects invalid checksum', () => {
    expect(validateTcKimlik('10000000145')).toBe(false)
  })
})
