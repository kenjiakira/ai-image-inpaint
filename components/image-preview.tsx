'use client'

import React from 'react'

interface ImagePreviewProps {
  resultImage: string | null
  showResult: boolean
  onShowResultChange: (show: boolean) => void
  onDownload: () => void
  children: React.ReactNode
}

export default function ImagePreview({
  resultImage,
  showResult,
  onShowResultChange,
  onDownload,
  children,
}: ImagePreviewProps) {
  return (
    <div className="flex-1 flex flex-col gap-4">
      {/* Tabs to switch between Original and Result */}
      {resultImage && (
        <div className="flex gap-2 border-b border-zinc-200">
          <button
            onClick={() => onShowResultChange(false)}
            className={`px-4 py-2 text-sm font-medium transition-colors ${
              !showResult
                ? 'text-zinc-900 border-b-2 border-zinc-900'
                : 'text-zinc-500 hover:text-zinc-700'
            }`}
          >
            Original
          </button>
          <button
            onClick={() => onShowResultChange(true)}
            className={`px-4 py-2 text-sm font-medium transition-colors ${
              showResult
                ? 'text-zinc-900 border-b-2 border-zinc-900'
                : 'text-zinc-500 hover:text-zinc-700'
            }`}
          >
            Result
          </button>
        </div>
      )}

      {showResult && resultImage ? (
        <div className="relative flex-1 bg-zinc-100 rounded border border-zinc-200 overflow-auto flex items-center justify-center">
          <img
            src={resultImage}
            alt="Inpainting result"
            className="max-w-full max-h-full"
          />
          <button
            onClick={onDownload}
            className="absolute top-4 right-4 px-4 py-2 bg-zinc-900 text-white rounded text-sm font-medium hover:bg-zinc-800 transition-colors flex items-center gap-2"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
              />
            </svg>
            Download
          </button>
        </div>
      ) : (
        children
      )}
    </div>
  )
}
