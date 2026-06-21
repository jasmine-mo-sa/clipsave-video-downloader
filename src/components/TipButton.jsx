import { useState } from 'react'

export default function TipButton() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  async function handleTip() {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/tip', { method: 'POST' })
      const data = await res.json()
      if (data.url) {
        window.location.href = data.url
      } else {
        setError(data.error || 'Could not start payment. Try again later.')
        setLoading(false)
      }
    } catch {
      setError('Network error — please try again.')
      setLoading(false)
    }
  }

  return (
    <div className="bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200 rounded-2xl p-6 text-center space-y-3">
      <div className="text-3xl">☕</div>
      <div>
        <p className="font-semibold text-gray-800 text-sm">ClipSave saved you time?</p>
        <p className="text-gray-500 text-xs mt-1">It's free — but a $3 coffee helps keep it running. No account needed.</p>
      </div>
      <button
        onClick={handleTip}
        disabled={loading}
        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 active:scale-95 text-white text-sm font-semibold transition-all disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {loading ? (
          <>
            <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
            </svg>
            Opening…
          </>
        ) : (
          <>☕ Buy me a coffee — $3</>
        )}
      </button>
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  )
}
