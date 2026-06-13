'use client'

import { useState } from 'react'

interface Props {
  content: string
  loading: boolean
  onRefine: (instruction: string) => void
}

export default function LessonOutput({ content, loading, onRefine }: Props) {
  const [chatInput, setChatInput] = useState('')

  const handleRefine = (e: React.FormEvent) => {
    e.preventDefault()
    if (!chatInput.trim()) return
    onRefine(chatInput.trim())
    setChatInput('')
  }

  if (!content && !loading) {
    return (
      <div className="h-full flex items-center justify-center text-gray-400">
        <div className="text-center">
          <div className="text-5xl mb-4">📋</div>
          <p className="text-lg font-medium">Your lesson plan will appear here</p>
          <p className="text-sm mt-1">Fill in the form and click Generate</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full">
      {/* Lesson plan content */}
      <div className="flex-1 overflow-y-auto">
        <div className="prose prose-sm max-w-none p-6">
          <MarkdownRenderer content={content} />
          {loading && (
            <span className="inline-block w-2 h-4 bg-blue-600 animate-pulse ml-0.5" />
          )}
        </div>
      </div>

      {/* Copy button */}
      {content && !loading && (
        <div className="px-6 py-2 border-t border-gray-100 flex justify-end gap-2">
          <CopyButton text={content} />
        </div>
      )}

      {/* Chat refinement */}
      {content && (
        <div className="border-t border-gray-200 p-4">
          <form onSubmit={handleRefine} className="flex gap-2">
            <input
              value={chatInput}
              onChange={e => setChatInput(e.target.value)}
              placeholder="Refine: e.g. Add more challenge questions, simplify the intro..."
              disabled={loading}
              className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={loading || !chatInput.trim()}
              className="bg-gray-800 hover:bg-gray-900 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            >
              Refine
            </button>
          </form>
        </div>
      )}
    </div>
  )
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false)
  const handleCopy = async () => {
    await navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }
  return (
    <button
      onClick={handleCopy}
      className="text-sm text-gray-500 hover:text-gray-800 border border-gray-200 rounded-md px-3 py-1 transition-colors"
    >
      {copied ? 'Copied!' : 'Copy Markdown'}
    </button>
  )
}

function MarkdownRenderer({ content }: { content: string }) {
  const lines = content.replace(/\*\*/g, '').replace(/\*/g, '').split('\n')
  return (
    <div className="space-y-1">
      {lines.map((line, i) => {
        if (line.startsWith('## ')) {
          return <h2 key={i} className="text-lg font-bold mt-6 mb-2 text-gray-900">{line.slice(3)}</h2>
        }
        if (line.startsWith('### ')) {
          return <h3 key={i} className="text-base font-semibold mt-4 mb-1 text-gray-800">{line.slice(4)}</h3>
        }
        if (line.startsWith('# ')) {
          return <h1 key={i} className="text-xl font-bold mt-2 mb-3 text-gray-900">{line.slice(2)}</h1>
        }
        if (line.startsWith('**') && line.endsWith('**')) {
          return <p key={i} className="font-semibold text-gray-800">{line.slice(2, -2)}</p>
        }
        if (line.startsWith('- ') || line.startsWith('• ')) {
          return <li key={i} className="ml-4 text-gray-700 list-disc text-sm">{line.slice(2)}</li>
        }
        if (line.startsWith('---')) {
          return <hr key={i} className="my-4 border-gray-200" />
        }
        if (line.trim() === '') {
          return <div key={i} className="h-2" />
        }
        return <p key={i} className="text-sm text-gray-700 leading-relaxed">{line}</p>
      })}
    </div>
  )
}
