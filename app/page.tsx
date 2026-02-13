'use client'

import { useState, useRef, useCallback } from 'react'
import Header from '@/components/header'
import Canvas, { CanvasRef } from '@/components/canvas'
import Toolbar from '@/components/toolbar'
import ControlPanel from '@/components/control-panel'
import ImagePreview from '@/components/image-preview'
import { useInpainting } from '@/hooks/use-inpainting'

export default function Page() {
  const { run, isLoading, error, result, reset } = useInpainting()
  const [validationError, setValidationError] = useState<string | null>(null)
  const [baseImage, setBaseImage] = useState<string | null>(null)
  const [resultImage, setResultImage] = useState<string | null>(null)
  const [brushSize, setBrushSize] = useState(20)
  const [isEraser, setIsEraser] = useState(false)
  const [showResult, setShowResult] = useState(false)
  const canvasRef = useRef<CanvasRef>(null)

  const handleImageUpload = useCallback((file: File) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      setBaseImage(e.target?.result as string)
      setResultImage(null)
      setShowResult(false)
      setValidationError(null)
      reset()
    }
    reader.readAsDataURL(file)
  }, [reset])

  const handleGenerate = useCallback(async (prompt: string) => {
    setValidationError(null)
    if (!baseImage) {
      setValidationError('Please upload an image first')
      return
    }
    const mask = canvasRef.current?.getMask()
    if (!mask) {
      setValidationError('Please draw a mask on the image first')
      return
    }
    const data = await run({
      image: baseImage,
      mask,
      prompt,
    })
    if (data?.images?.[0]?.url) {
      setResultImage(data.images[0].url)
      setShowResult(true)
    }
  }, [baseImage, run, reset])

  const handleRetry = useCallback(() => {
    setValidationError(null)
    reset()
  }, [reset])

  const handleDownload = () => {
    if (!resultImage) return
    
    const link = document.createElement('a')
    link.href = resultImage
    link.download = 'inpainting-result.png'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <div className="min-h-screen bg-zinc-50 flex flex-col">
      <Header />
      
      <div className="flex-1 flex overflow-hidden">
        {/* Left Column - Canvas Area */}
        <div className="flex-1 flex flex-col border-r border-zinc-200 p-6">
          <ImagePreview
            resultImage={resultImage}
            showResult={showResult}
            onShowResultChange={setShowResult}
            onDownload={handleDownload}
          >
            <Canvas
              ref={canvasRef}
              baseImage={baseImage}
              brushSize={brushSize}
              isEraser={isEraser}
              isLoading={isLoading}
            />
          </ImagePreview>
          
          {!showResult && (
            <Toolbar
              brushSize={brushSize}
              onBrushSizeChange={setBrushSize}
              isEraser={isEraser}
              onToggleEraser={() => setIsEraser(!isEraser)}
            />
          )}
        </div>

        {/* Right Column - Control Panel */}
        <div className="w-80 p-6 overflow-y-auto">
          <ControlPanel
            onImageUpload={handleImageUpload}
            onGenerate={handleGenerate}
            onRetry={handleRetry}
            isLoading={isLoading}
            error={validationError ?? error}
            hasImage={!!baseImage}
            canRetry={!!(validationError ?? error)}
          />
        </div>
      </div>
    </div>
  )
}
