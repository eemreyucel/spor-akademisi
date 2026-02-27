'use client'

import { useState } from 'react'
import { CreatePaymentForm } from './create-payment-form'

export function NewPaymentButton() {
  const [open, setOpen] = useState(false)

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700"
      >
        Yeni Ödeme
      </button>
      {open && <CreatePaymentForm onClose={() => setOpen(false)} />}
    </>
  )
}
