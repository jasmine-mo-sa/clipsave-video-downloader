import { useState } from 'react'

const FORM_ACTION = 'https://docs.google.com/forms/d/e/1FAIpQLSfOhBJEmt0FZM5Rz_HLwcWyRFpopotLb3s_W92PwC4wjhqtow/formResponse'
const ENTRY_ID = 'entry.343124845'

export default function EmailSignup() {
  const [signedUp, setSignedUp] = useState(false)

  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-6 text-center">
      <h2 className="font-semibold text-gray-800 text-base mb-1">Get notified about new free tools</h2>
      <p className="text-gray-500 text-xs mb-4">
        No spam — just useful free tools for creators.
      </p>

      {signedUp ? (
        <p className="text-green-600 text-sm font-medium">Thanks, you're in!</p>
      ) : (
        <form
          action={FORM_ACTION}
          method="POST"
          target="hidden_iframe"
          onSubmit={() => setSignedUp(true)}
          className="flex flex-col sm:flex-row gap-2 justify-center"
        >
          <input
            type="email"
            name={ENTRY_ID}
            required
            placeholder="you@example.com"
            className="flex-1 max-w-xs px-4 py-2 text-sm border border-gray-300 rounded-lg
                       focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <button
            type="submit"
            className="px-5 py-2 rounded-lg bg-indigo-600 text-white text-sm font-semibold
                       hover:bg-indigo-700 active:scale-95 transition-all"
          >
            Notify me
          </button>
        </form>
      )}
    </div>
  )
}
