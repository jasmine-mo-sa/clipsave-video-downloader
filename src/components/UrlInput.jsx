import { useState, useRef } from 'react'

export default function UrlInput({ onSubmit, loading }) {
  const [url, setUrl] = useState('')
  const inputRef = useRef(null)

  function handleSubmit(e) {
    e.preventDefault()
    const trimmed = url.trim()
    if (trimmed) onSubmit(trimmed)
  }

  async function handlePaste() {
    try {
      const text = await navigator.clipboard.readText()
      if (text) {
        setUrl(text.trim())
        return
      }
    } catch {
      // clipboard permission denied — focus the input so user can paste manually
    }
    if (inputRef.current) {
      inputRef.current.focus()
    }
  }

  return (
    <form onSubmit={handleSubmit} className="w-full">
      <div className="flex flex-col sm:flex-row gap-2">
        <div className="relative flex-1">
          <input
            ref={inputRef}
            type="url"
            value={url}
            onChange={e => setUrl(e.target.value)}
            placeholder="Paste a TikTok or Instagram video link…"
            required
            className="w-full px-4 py-3 pr-24 text-sm border border-gray-300 rounded-xl
                       focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent
                       placeholder:text-gray-400 bg-white"
          />
          {!url && (
            <button
              type="button"
              onClick={handlePaste}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-indigo-600
                         font-medium hover:text-indigo-800 transition-colors px-1"
            >
              Paste
            </button>
          )}
          {url && (
            <button
              type="button"
              onClick={() => setUrl('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
              aria-label="Clear"
            >
              ✕
            </button>
          )}
        </div>
        <button
          type="submit"
          disabled={loading || !url.trim()}
          className="px-6 py-3 rounded-xl bg-indigo-600 text-white text-sm font-semibold
                     hover:bg-indigo-700 active:scale-95 transition-all disabled:opacity-50
                     disabled:cursor-not-allowed disabled:active:scale-100 whitespace-nowrap"
        >
          {loading ? (
            <span className="flex items-center gap-2">
              <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
              </svg>
              Fetching…
            </span>
          ) : 'Download'}
        </button>
      </div>
    </form>
  )
}
