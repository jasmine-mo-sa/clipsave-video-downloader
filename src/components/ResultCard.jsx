const PLATFORM_LABELS = {
  tiktok: { label: 'TikTok', color: 'bg-black text-white' },
  instagram: { label: 'Instagram', color: 'bg-gradient-to-r from-purple-500 to-pink-500 text-white' },
}

function fmtDuration(seconds) {
  if (!seconds) return null
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${m}:${String(s).padStart(2, '0')}`
}

export default function ResultCard({ result, onReset }) {
  const platform = PLATFORM_LABELS[result.platform] || { label: result.platform, color: 'bg-gray-200 text-gray-800' }

  const filename = `${result.platform}-${(result.author || 'video').replace(/[^a-z0-9_-]/gi, '_')}.mp4`
  const proxyUrl = `/.netlify/functions/proxy?url=${encodeURIComponent(result.videoUrl)}&filename=${encodeURIComponent(filename)}`

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
      <div className="flex flex-col sm:flex-row gap-4 p-5">
        {result.thumbnail && (
          <div className="flex-shrink-0">
            <img
              src={result.thumbnail}
              alt="Video thumbnail"
              className="w-full sm:w-28 h-40 sm:h-36 object-cover rounded-xl bg-gray-100"
              onError={e => { e.target.style.display = 'none' }}
            />
          </div>
        )}
        <div className="flex flex-col justify-between gap-3 flex-1 min-w-0">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 flex-wrap">
              <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${platform.color}`}>
                {platform.label}
              </span>
              {result.author && (
                <span className="text-xs text-gray-500">@{result.author}</span>
              )}
              {result.duration && (
                <span className="text-xs text-gray-400">{fmtDuration(result.duration)}</span>
              )}
            </div>
            {result.title && (
              <p className="text-sm text-gray-800 font-medium leading-snug line-clamp-3">
                {result.title}
              </p>
            )}
          </div>

          <div className="flex flex-wrap gap-2">
            <a
              href={proxyUrl}
              download={filename}
              className="px-4 py-2 rounded-lg bg-indigo-600 text-white text-sm font-semibold
                         hover:bg-indigo-700 active:scale-95 transition-all flex items-center gap-1.5 no-underline"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/>
              </svg>
              Download Video
            </a>
            <a
              href={result.videoUrl}
              target="_blank"
              rel="noreferrer"
              className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 text-sm font-medium
                         hover:bg-gray-50 active:scale-95 transition-all"
            >
              Open in Browser
            </a>
            <button
              onClick={onReset}
              className="px-4 py-2 rounded-lg text-gray-500 text-sm hover:text-gray-700 transition-colors"
            >
              ↩ New video
            </button>
          </div>
        </div>
      </div>

      <div className="border-t border-gray-100 px-5 py-2.5 bg-gray-50">
        <p className="text-xs text-gray-400">
          Video downloads directly to your device. Works on iPhone, Android, Mac, and PC.
        </p>
      </div>
    </div>
  )
}
