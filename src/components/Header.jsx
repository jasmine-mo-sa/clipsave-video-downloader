export default function Header() {
  return (
    <header className="bg-white border-b border-gray-200 py-4">
      <div className="max-w-3xl mx-auto px-4 flex items-center gap-2">
        <svg className="w-7 h-7 text-indigo-600 flex-shrink-0" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect width="32" height="32" rx="8" fill="currentColor"/>
          <path d="M16 6v14M10 14l6 6 6-6" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
          <rect x="8" y="23" width="16" height="2.5" rx="1.25" fill="white"/>
        </svg>
        <span className="text-xl font-bold text-gray-900 tracking-tight">ClipSave</span>
        <span className="ml-auto text-xs text-gray-400 hidden sm:block">Free · No watermark · No sign-up</span>
      </div>
    </header>
  )
}
