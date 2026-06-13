'use client'

import { useState, useRef } from 'react'
import LessonForm from '@/components/LessonForm'
import LessonOutput from '@/components/LessonOutput'

const API = (process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000') + '/api'

interface FormParams {
  unit: string
  topic: string
  subtopic: string
  duration_mins: number
  student_level: string
  textbook: string
  extra: string
}

export default function Home() {
  const [content, setContent] = useState('')
  const [loading, setLoading] = useState(false)
  const [mockMode, setMockMode] = useState(false)
  const lastParams = useRef<FormParams | null>(null)

  const streamResponse = async (url: string, body: object) => {
    setLoading(true)
    setContent('')
    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      if (!res.ok || !res.body) throw new Error('Request failed')
      const reader = res.body.getReader()
      const decoder = new TextDecoder()
      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        setContent(prev => prev + decoder.decode(value))
      }
    } catch {
      setContent('Error connecting to backend. Make sure the API server is running on port 8000.')
    } finally {
      setLoading(false)
    }
  }

  const handleGenerate = (params: FormParams) => {
    lastParams.current = params
    const endpoint = mockMode ? 'mock' : 'generate'
    streamResponse(`${API}/${endpoint}`, params)
  }

  const handleRefine = (instruction: string) => {
    if (!lastParams.current) return
    const endpoint = mockMode ? 'mock' : 'refine'
    streamResponse(`${API}/${endpoint}`, { ...lastParams.current, instruction })
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-blue-600 text-white rounded-lg p-2 text-lg font-bold">VCE</div>
            <div>
              <h1 className="text-lg font-bold text-gray-900">General Mathematics Lesson Planner</h1>
              <p className="text-xs text-gray-500">Aligned with VCAA Study Design 2023–2027</p>
            </div>
          </div>
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <span className="text-xs text-gray-500">Mock mode</span>
            <div
              onClick={() => setMockMode(m => !m)}
              className={`w-10 h-5 rounded-full transition-colors relative ${mockMode ? 'bg-amber-400' : 'bg-gray-200'}`}
            >
              <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${mockMode ? 'translate-x-5' : 'translate-x-0.5'}`} />
            </div>
            {mockMode && <span className="text-xs font-medium text-amber-600">No tokens used</span>}
          </label>
        </div>
      </header>

      <main className="flex-1 max-w-7xl mx-auto w-full p-6 flex gap-6">
        <aside className="w-80 flex-shrink-0">
          <div className="bg-white rounded-xl border border-gray-200 p-5 sticky top-6">
            <h2 className="text-sm font-semibold text-gray-900 mb-4">Lesson Parameters</h2>
            <LessonForm onGenerate={handleGenerate} loading={loading} />
          </div>
        </aside>

        <div className="flex-1 bg-white rounded-xl border border-gray-200 overflow-hidden flex flex-col min-h-[600px]">
          <LessonOutput content={content} loading={loading} onRefine={handleRefine} />
        </div>
      </main>
    </div>
  )
}
