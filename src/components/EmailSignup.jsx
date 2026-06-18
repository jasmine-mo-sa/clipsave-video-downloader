import { useState } from 'react'

// TODO: Replace with the real Google Form action URL and entry field name after creating the form.
// Steps:
//   1. Create a Google Form with one Email field.
//   2. Right-click the form's "Submit" button → Inspect → note the <form action="..."> URL.
//   3. Note the email input's name attribute (e.g. "entry.123456789").
//   4. Replace FORM_ACTION and ENTRY_ID below.
const FORM_ACTION = 'https://docs.google.com/forms/d/e/REPLACE_WITH_FORM_ID/formResponse'
const ENTRY_ID = 'entry.REPLACE_WITH_ENTRY_ID'

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
