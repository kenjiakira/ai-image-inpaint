'use client'

import React from "react"

import { useRef, useState } from 'react'

interface ControlPanelProps {
  onImageUpload: (file: File) => void
  onGenerate: (prompt: string) => void
  onRetry: () => void
  isLoading: boolean
  error: string | null
  hasImage: boolean
  canRetry: boolean
}

export default function ControlPanel({
  onImageUpload,
  onGenerate,
  onRetry,
  isLoading,
  error,
  hasImage,
  canRetry,
}: ControlPanelProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [prompt, setPrompt] = useState('')

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      onImageUpload(file)
    }
  }

  const handleGenerate = () => {
    if (prompt.trim()) {
      onGenerate(prompt)
    }
  }

  return (
    <div className="space-y-4">
      {/* Image Upload Card */}
      <div
        className="border border-zinc-200 rounded p-4 cursor-pointer hover:bg-zinc-50 transition-colors"
        onClick={() => fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="hidden"
        />
        <div className="text-center">
          <svg
            className="w-8 h-8 mx-auto mb-2 text-zinc-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
          <p className="text-sm font-medium text-zinc-900">
            {hasImage ? 'Change Image' : 'Upload Image'}
          </p>
          <p className="text-xs text-zinc-500 mt-1">PNG, JPG, WebP</p>
        </div>
      </div>

      {/* Prompt Textarea */}
      <div>
        <label className="block text-sm font-medium text-zinc-900 mb-2">
          Prompt
        </label>
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Describe what you want to generate in the masked area"
          disabled={isLoading}
          className="w-full h-28 p-3 border border-zinc-200 rounded text-sm text-zinc-900 placeholder-zinc-400 focus:outline-none focus:ring-1 focus:ring-zinc-400 disabled:bg-zinc-50 disabled:text-zinc-500"
        />
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded p-3">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex gap-2">
        <button
          onClick={handleGenerate}
          disabled={isLoading || !hasImage || !prompt.trim()}
          className="flex-1 px-4 py-2 bg-zinc-900 text-white rounded text-sm font-medium hover:bg-zinc-800 transition-colors disabled:bg-zinc-300 disabled:cursor-not-allowed"
        >
          {isLoading ? 'Processing...' : 'Generate'}
        </button>

        {canRetry && (
          <button
            onClick={onRetry}
            disabled={isLoading}
            className="flex-1 px-4 py-2 bg-zinc-200 text-zinc-900 rounded text-sm font-medium hover:bg-zinc-300 transition-colors disabled:cursor-not-allowed"
          >
            Retry
          </button>
        )}
      </div>
    </div>
  )
}
