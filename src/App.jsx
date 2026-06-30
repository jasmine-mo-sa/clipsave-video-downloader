import { useState } from 'react'
import Header from './components/Header'
import UrlInput from './components/UrlInput'
import ResultCard from './components/ResultCard'
import EmailSignup from './components/EmailSignup'
import TipButton from './components/TipButton'

export default function App() {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState(null)

  async function handleSubmit(url) {
    setLoading(true)
    setResult(null)
    setError(null)
    try {
      const res = await fetch(`/api/resolve?url=${encodeURIComponent(url)}`)
      const data = await res.json()
      if (!res.ok || data.error) {
        setError(data.error || 'Something went wrong. Please try again.')
      } else {
        setResult(data)
      }
    } catch {
      setError('Network error. Please check your connection and try again.')
    } finally {
      setLoading(false)
    }
  }

  function handleReset() {
    setResult(null)
    setError(null)
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />

      {/* Hero */}
      <div className="bg-gradient-to-br from-indigo-600 via-indigo-700 to-purple-700 text-white py-12 px-4">
        <div className="max-w-3xl mx-auto text-center space-y-3">
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">
            Free Video Downloader
          </h1>
          <p className="text-indigo-200 text-sm sm:text-base max-w-lg mx-auto">
            Save TikTok, Instagram Reels, and YouTube Shorts without watermarks — free, instant, no account needed.
          </p>
          <div className="pt-4">
            <UrlInput onSubmit={handleSubmit} loading={loading} />
          </div>
          <p className="text-indigo-300 text-xs pt-1">
            Supports TikTok, Instagram Reels &amp; YouTube Shorts
          </p>
        </div>
      </div>

      <main className="max-w-3xl w-full mx-auto px-4 py-8 flex-1 space-y-6">
        {/* Error state */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3">
            <span className="text-red-500 text-lg flex-shrink-0">⚠</span>
            <div>
              <p className="text-sm text-red-700 font-medium">{error}</p>
              <button
                onClick={handleReset}
                className="text-xs text-red-500 mt-1 underline underline-offset-2"
              >
                Try again
              </button>
            </div>
          </div>
        )}

        {/* Result */}
        {result && (
          <ResultCard result={result} onReset={handleReset} />
        )}

        {/* How it works */}
        {!result && !error && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white rounded-2xl border border-gray-200 p-5">
              <div className="text-2xl mb-2">📋</div>
              <h3 className="font-semibold text-gray-800 mb-1 text-sm">1. Paste the link</h3>
              <p className="text-gray-500 text-xs leading-relaxed">
                Copy the video URL from TikTok, Instagram, or YouTube Shorts and paste it into the box above.
              </p>
            </div>
            <div className="bg-white rounded-2xl border border-gray-200 p-5">
              <div className="text-2xl mb-2">⚡</div>
              <h3 className="font-semibold text-gray-800 mb-1 text-sm">2. Click Download</h3>
              <p className="text-gray-500 text-xs leading-relaxed">
                We fetch the video in seconds — no watermark, full quality, completely free.
              </p>
            </div>
            <div className="bg-white rounded-2xl border border-gray-200 p-5">
              <div className="text-2xl mb-2">💾</div>
              <h3 className="font-semibold text-gray-800 mb-1 text-sm">3. Save your video</h3>
              <p className="text-gray-500 text-xs leading-relaxed">
                Download the MP4 directly to your device — no sign-up, no hidden charges.
              </p>
            </div>
          </div>
        )}

        {/* Feature cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white rounded-2xl border border-gray-200 p-5">
            <div className="text-2xl mb-2">🚫</div>
            <h3 className="font-semibold text-gray-800 mb-1 text-sm">No Watermark</h3>
            <p className="text-gray-500 text-xs leading-relaxed">
              Download clean, watermark-free TikTok, Instagram Reels, and YouTube Shorts videos in HD quality.
            </p>
          </div>
          <div className="bg-white rounded-2xl border border-gray-200 p-5">
            <div className="text-2xl mb-2">🔒</div>
            <h3 className="font-semibold text-gray-800 mb-1 text-sm">100% Free</h3>
            <p className="text-gray-500 text-xs leading-relaxed">
              No account, no limits, no payment — just paste a link and download.
            </p>
          </div>
          <div className="bg-white rounded-2xl border border-gray-200 p-5">
            <div className="text-2xl mb-2">📱</div>
            <h3 className="font-semibold text-gray-800 mb-1 text-sm">Works Everywhere</h3>
            <p className="text-gray-500 text-xs leading-relaxed">
              Works on iPhone, Android, Mac, and PC — no app download required.
            </p>
          </div>
        </div>

        {/* SEO content */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6 space-y-4 text-xs text-gray-500 leading-relaxed">
          <div>
            <h2 className="font-semibold text-gray-800 text-sm mb-1">How to download TikTok, Instagram Reels, and YouTube Shorts without watermark</h2>
            <p>
              TikTok and Instagram both add a watermark or overlay to videos when you save them natively. ClipSave bypasses this by fetching the original video file directly — so you get a clean, high-definition MP4 with no logo or overlay. YouTube Shorts downloads come straight from the source too.
            </p>
          </div>
          <div>
            <h2 className="font-semibold text-gray-800 text-sm mb-1">How to copy a video link</h2>
            <ol className="list-decimal list-inside space-y-1">
              <li>Open TikTok, Instagram, or YouTube and find the video you want.</li>
              <li>Tap the <strong>Share</strong> button.</li>
              <li>Tap <strong>Copy link</strong>.</li>
              <li>Paste the link into ClipSave above and click Download.</li>
            </ol>
          </div>
        </div>

        {/* FAQ section */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <h2 className="font-semibold text-gray-800 text-sm mb-4">Frequently Asked Questions</h2>
          <div className="space-y-4 text-xs text-gray-500 leading-relaxed">
            <div>
              <h3 className="font-semibold text-gray-700 mb-1">Is ClipSave free to use?</h3>
              <p>Yes — ClipSave is completely free. No account, no limits, no hidden fees. Just paste a link and download.</p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-700 mb-1">Does ClipSave work on iPhone and Android?</h3>
              <p>Yes. ClipSave works on any device with a web browser — iPhone, Android, Mac, and PC. No app download needed. On iPhone, after downloading, the video saves to your Files app; you can then move it to Photos.</p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-700 mb-1">Why use ClipSave instead of the app's save button?</h3>
              <p>TikTok and Instagram's native save adds a watermark or username overlay to videos. ClipSave fetches the original source file so you get a clean, watermark-free MP4 — great for repurposing content or keeping a personal archive.</p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-700 mb-1">What video quality does ClipSave download?</h3>
              <p>ClipSave fetches the highest-quality version available for each platform, depending on how the creator uploaded the video.</p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-700 mb-1">Does ClipSave support Instagram and YouTube Shorts?</h3>
              <p>Yes. ClipSave supports TikTok, public Instagram Reels and posts, and YouTube Shorts. Just paste any link from one of these platforms above.</p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-700 mb-1">Is it legal to download videos with ClipSave?</h3>
              <p>Downloading videos for personal use is generally fine. Always respect creators' rights — don't re-upload someone else's content without permission or claim it as your own.</p>
            </div>
          </div>
        </div>

        <EmailSignup />
        <TipButton />
      </main>

      {/* Hidden iframe absorbs Google Form response so the page never navigates away */}
      <iframe name="hidden_iframe" style={{ display: 'none' }} title="hidden_iframe" />

      <footer className="text-center text-xs text-gray-400 pb-6 pt-2">
        ClipSave is a free tool. Only download videos you have the right to save.
      </footer>
    </div>
  )
}
