'use client'

import * as Sentry from '@sentry/nextjs'
import { useEffect } from 'react'

export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    Sentry.captureException(error)
  }, [error])

  return (
    <html>
      <body>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-xl font-bold mb-4">Bir hata olustu</h2>
            <button onClick={reset} className="bg-blue-600 text-white px-4 py-2 rounded-lg">
              Tekrar Dene
            </button>
          </div>
        </div>
      </body>
    </html>
  )
}
