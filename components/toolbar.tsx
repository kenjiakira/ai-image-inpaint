'use client'

interface ToolbarProps {
  brushSize: number
  onBrushSizeChange: (size: number) => void
  isEraser: boolean
  onToggleEraser: () => void
}

export default function Toolbar({
  brushSize,
  onBrushSizeChange,
  isEraser,
  onToggleEraser,
}: ToolbarProps) {
  return (
    <div className="bg-white border border-zinc-200 rounded p-4 flex items-center gap-4">
      <button
        onClick={() => onToggleEraser()}
        className={`px-3 py-2 rounded text-sm font-medium transition-colors ${
          !isEraser
            ? 'bg-zinc-900 text-white'
            : 'bg-zinc-100 text-zinc-700 hover:bg-zinc-200'
        }`}
      >
        <svg
          className="w-4 h-4 inline mr-2"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M7 4a1 1 0 011 1v14a1 1 0 01-1 1H4a1 1 0 01-1-1V5a1 1 0 011-1h3z"
          />
        </svg>
        Brush
      </button>

      <button
        onClick={onToggleEraser}
        className={`px-3 py-2 rounded text-sm font-medium transition-colors ${
          isEraser
            ? 'bg-zinc-900 text-white'
            : 'bg-zinc-100 text-zinc-700 hover:bg-zinc-200'
        }`}
      >
        <svg
          className="w-4 h-4 inline mr-2"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
          />
        </svg>
        Erase
      </button>

      <div className="flex-1" />

      <div className="flex items-center gap-3">
        <label className="text-sm font-medium text-zinc-700">Size:</label>
        <input
          type="range"
          min="5"
          max="100"
          value={brushSize}
          onChange={(e) => onBrushSizeChange(Number(e.target.value))}
          className="w-32 h-2 bg-zinc-200 rounded-lg appearance-none cursor-pointer"
        />
        <span className="text-sm text-zinc-600 w-8 text-right">{brushSize}</span>
      </div>
    </div>
  )
}
