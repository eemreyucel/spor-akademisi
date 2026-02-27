export function validateTcKimlik(value: string): boolean {
  if (!/^\d{11}$/.test(value)) return false
  if (value[0] === '0') return false

  const digits = value.split('').map(Number)

  const sumOdd = digits[0] + digits[2] + digits[4] + digits[6] + digits[8]
  const sumEven = digits[1] + digits[3] + digits[5] + digits[7]
  const check10 = ((sumOdd * 7 - sumEven) % 10 + 10) % 10
  if (check10 !== digits[9]) return false

  const sumFirst10 = digits.slice(0, 10).reduce((a, b) => a + b, 0)
  if (sumFirst10 % 10 !== digits[10]) return false

  return true
}
