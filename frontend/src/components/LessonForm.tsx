'use client'

import { useState } from 'react'

const UNITS = [
  'Unit 1: General Mathematics',
  'Unit 2: General Mathematics',
  'Units 3 and 4: General Mathematics',
]

interface TopicData {
  label: string
  subtopics: string[]
}

const TOPICS: Record<string, TopicData[]> = {
  'Unit 1: General Mathematics': [
    {
      label: 'Investigating and comparing data distributions',
      subtopics: ['Types of data', 'Frequency tables and graphs', 'Summary statistics', 'Five-number summary and boxplots', 'Comparing distributions'],
    },
    {
      label: 'Arithmetic and geometric sequences and financial mathematics',
      subtopics: ['Arithmetic sequences', 'Geometric sequences', 'First-order linear recurrence relations', 'Percentage and financial calculations', 'Inflation and depreciation'],
    },
    {
      label: 'Linear functions, graphs, equations and models',
      subtopics: ['Linear functions and graphs', 'Graphing linear relations', 'Formulating and analysing linear models', 'Piecewise linear graphs'],
    },
    {
      label: 'Matrices',
      subtopics: ['Matrix notation and types', 'Matrix operations', 'Matrix multiplication', 'Inverse matrices', 'Transition matrices'],
    },
  ],
  'Unit 2: General Mathematics': [
    {
      label: 'Investigating relationships between two numerical variables',
      subtopics: ['Scatterplots', 'Pearson correlation coefficient', 'Least squares regression', 'Residual analysis'],
    },
    {
      label: 'Graphs and networks',
      subtopics: ['Graph terminology', 'Planar graphs and Euler\'s formula', 'Walks, trails, paths and cycles', 'Weighted graphs'],
    },
    {
      label: 'Geometry, measurement and trigonometry',
      subtopics: ['Pythagoras\' theorem', 'Trigonometric ratios', 'Applications of trigonometry', 'Area, surface area and volume'],
    },
    {
      label: 'Directed graphs and networks',
      subtopics: ['Directed graphs', 'Network flow', 'Shortest path', 'Minimum spanning tree'],
    },
  ],
  'Units 3 and 4: General Mathematics': [
    {
      label: 'Data analysis',
      subtopics: ['Investigating data distributions', 'Investigating association between two variables', 'Investigating and modelling linear associations', 'Investigating and modelling time series data'],
    },
    {
      label: 'Recursion and financial modelling',
      subtopics: ['Depreciation of assets', 'Compound interest investments and loans', 'Reducing balance loans', 'Annuities and perpetuities', 'Compound interest with periodic additions'],
    },
    {
      label: 'Matrices',
      subtopics: ['Matrices and their applications', 'Transition matrices'],
    },
    {
      label: 'Networks and decision mathematics',
      subtopics: ['Graphs and networks', 'Exploring and travelling problems', 'Trees and minimum connector problems', 'Flow problems', 'Shortest path problems', 'Matching problems', 'Scheduling and critical path analysis'],
    },
  ],
}

const TEXTBOOKS: Record<string, { name: string; publisher: string }[]> = {
  'Unit 1: General Mathematics': [
    { name: 'General Mathematics Units 1&2 (Cambridge)', publisher: 'Cambridge University Press' },
    { name: 'General Maths Units 1&2 (Nelson)', publisher: 'Cengage / Nelson' },
    { name: 'Maths Quest General Mathematics Units 1&2', publisher: 'Jacaranda' },
  ],
  'Unit 2: General Mathematics': [
    { name: 'General Mathematics Units 1&2 (Cambridge)', publisher: 'Cambridge University Press' },
    { name: 'General Maths Units 1&2 (Nelson)', publisher: 'Cengage / Nelson' },
    { name: 'Maths Quest General Mathematics Units 1&2', publisher: 'Jacaranda' },
  ],
  'Units 3 and 4: General Mathematics': [
    { name: 'General Mathematics Units 3&4 (Cambridge)', publisher: 'Cambridge University Press' },
    { name: 'General Maths Units 3&4 (Nelson)', publisher: 'Cengage / Nelson' },
    { name: 'Maths Quest General Mathematics Units 3&4', publisher: 'Jacaranda' },
  ],
}

const DURATIONS = [45, 60, 75, 90]
const LEVELS = ['Foundation', 'Mixed', 'Advanced']

interface GenerateParams {
  unit: string
  topic: string
  subtopic: string
  duration_mins: number
  student_level: string
  textbook: string
  extra: string
}

interface Props {
  onGenerate: (params: GenerateParams) => void
  loading: boolean
}

export default function LessonForm({ onGenerate, loading }: Props) {
  const [unit, setUnit] = useState(UNITS[0])
  const [topic, setTopic] = useState(TOPICS[UNITS[0]][0].label)
  const [subtopic, setSubtopic] = useState(TOPICS[UNITS[0]][0].subtopics[0])
  const [duration, setDuration] = useState(60)
  const [level, setLevel] = useState('Mixed')
  const [textbook, setTextbook] = useState('')
  const [extra, setExtra] = useState('')

  const currentTopicData = TOPICS[unit].find(t => t.label === topic) ?? TOPICS[unit][0]

  const handleUnitChange = (u: string) => {
    setUnit(u)
    const firstTopic = TOPICS[u][0]
    setTopic(firstTopic.label)
    setSubtopic(firstTopic.subtopics[0])
    setTextbook('')
  }

  const handleTopicChange = (t: string) => {
    setTopic(t)
    const topicData = TOPICS[unit].find(td => td.label === t)
    setSubtopic(topicData?.subtopics[0] ?? '')
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onGenerate({ unit, topic, subtopic, duration_mins: duration, student_level: level, textbook, extra })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">Unit</label>
        <select
          value={unit}
          onChange={e => handleUnitChange(e.target.value)}
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {UNITS.map(u => <option key={u}>{u}</option>)}
        </select>
      </div>

      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">Topic</label>
        <select
          value={topic}
          onChange={e => handleTopicChange(e.target.value)}
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {TOPICS[unit].map(t => <option key={t.label}>{t.label}</option>)}
        </select>
      </div>

      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">Subtopic</label>
        <select
          value={subtopic}
          onChange={e => setSubtopic(e.target.value)}
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {currentTopicData.subtopics.map(s => <option key={s}>{s}</option>)}
        </select>
      </div>

      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">Textbook (optional)</label>
        <select
          value={textbook}
          onChange={e => setTextbook(e.target.value)}
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">No textbook</option>
          {TEXTBOOKS[unit].map(tb => (
            <option key={tb.name} value={tb.name}>{tb.name}</option>
          ))}
        </select>
      </div>

      <div className="flex gap-3">
        <div className="flex-1">
          <label className="block text-xs font-medium text-gray-600 mb-1">Duration</label>
          <select
            value={duration}
            onChange={e => setDuration(Number(e.target.value))}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {DURATIONS.map(d => <option key={d} value={d}>{d} min</option>)}
          </select>
        </div>
        <div className="flex-1">
          <label className="block text-xs font-medium text-gray-600 mb-1">Student Level</label>
          <select
            value={level}
            onChange={e => setLevel(e.target.value)}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {LEVELS.map(l => <option key={l}>{l}</option>)}
          </select>
        </div>
      </div>

      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">
          Additional instructions <span className="text-gray-400">(optional)</span>
        </label>
        <textarea
          value={extra}
          onChange={e => setExtra(e.target.value)}
          rows={3}
          placeholder="e.g. Students have just learned about sequences. Focus on real-world contexts."
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium py-2.5 rounded-lg text-sm transition-colors"
      >
        {loading ? 'Generating...' : 'Generate Lesson Plan'}
      </button>
    </form>
  )
}
