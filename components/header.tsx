export default function Header() {
  return (
    <header className="border-b border-zinc-200 bg-white px-6 py-4 flex items-center gap-4">
      <button
        className="text-zinc-500 hover:text-zinc-900 transition-colors"
        aria-label="Go back"
      >
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 19l-7-7 7-7"
          />
        </svg>
      </button>
      
      <div className="flex-1">
        <h1 className="text-xl font-medium text-zinc-900">AI Image – Inpaint</h1>
      </div>
      
      <div className="text-sm font-medium text-zinc-500 bg-zinc-100 px-3 py-1 rounded">
        Inpaint mode
      </div>
    </header>
  )
}
