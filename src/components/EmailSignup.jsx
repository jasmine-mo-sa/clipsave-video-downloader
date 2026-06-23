import { useState } from 'react'

export default function EmailSignup() {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState('idle') // idle | loading | done | error

  const handleSubmit = async (e) => {
    e.preventDefault()
    setStatus('loading')
    try {
      const res = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      setStatus(res.ok ? 'done' : 'error')
    } catch {
      setStatus('error')
    }
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-6 text-center">
      <h2 className="font-semibold text-gray-800 text-base mb-1">Get notified about new free tools</h2>
      <p className="text-gray-500 text-xs mb-4">No spam — just useful free tools for creators.</p>

      {status === 'done' ? (
        <p className="text-green-600 text-sm font-medium">Thanks, you're in! 🎉</p>
      ) : (
        <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-2 justify-center">
          <input
            type="email"
            required
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="you@example.com"
            className="flex-1 max-w-xs px-4 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <button
            type="submit"
            disabled={status === 'loading'}
            className="px-5 py-2 rounded-lg bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-700 active:scale-95 transition-all disabled:opacity-60"
          >
            {status === 'loading' ? 'Joining…' : 'Notify me'}
          </button>
        </form>
      )}
      {status === 'error' && (
        <p className="text-red-500 text-xs mt-2">Something went wrong — please try again.</p>
      )}
    </div>
  )
}
