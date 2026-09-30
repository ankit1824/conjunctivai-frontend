import React, { useState, useRef, useCallback } from 'react'
import { Upload, AlertTriangle, CheckCircle2, XCircle, Loader2, ChevronDown, ChevronUp } from 'lucide-react'
import { predict } from '../hooks/useApi'
import { PredictResponse, ModelResult } from '../types'

const MODEL_ORDER = ['xgboost', 'rf', 'svm', 'knn', 'gnb']

function ConfidenceBar({ value, color }: { value: number; color: string }) {
  return (
    <div className="w-full h-1.5 bg-surface2 rounded-full overflow-hidden">
      <div
        className="h-full rounded-full transition-all duration-700"
        style={{ width: `${value * 100}%`, backgroundColor: color }}
      />
    </div>
  )
}

function ModelCard({ m, expanded, onToggle }: { m: ModelResult; expanded: boolean; onToggle: () => void }) {
  const isAnemic = m.label === 1
  return (
    <div className="card p-4" style={{ borderLeft: `3px solid ${m.color}` }}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-sm text-white">{m.name}</span>
            <span className="text-xs text-dim">{m.family}</span>
          </div>
          <div className="flex items-center gap-3 mt-2">
            <span
              className={`tag text-xs font-semibold ${
                isAnemic ? 'bg-red/15 text-red' : 'bg-green/15 text-green'
              }`}
            >
              {m.label_text}
            </span>
            <span className="text-xs text-muted">
              {(m.probability * 100).toFixed(1)}% anemia prob.
            </span>
            <span className="text-xs text-dim">{m.infer_ms.toFixed(1)}ms</span>
          </div>
        </div>
        {m.feature_importance && (
          <button onClick={onToggle} className="text-dim hover:text-muted flex-shrink-0 mt-1">
            {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        )}
      </div>

      <div className="mt-3">
        <ConfidenceBar value={m.probability} color={m.color} />
      </div>

      {expanded && m.feature_importance && (
        <div className="mt-4 pt-4 border-t border-border">
          <div className="text-xs text-dim mb-3 font-semibold uppercase tracking-wider">Top 5 Features</div>
          <div className="space-y-2">
            {m.feature_importance.map(fi => (
              <div key={fi.feature} className="flex items-center gap-3">
                <span className="text-xs text-muted w-36 truncate flex-shrink-0">{fi.feature}</span>
                <div className="flex-1 h-1.5 bg-surface2 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: `${(fi.importance / m.feature_importance![0].importance) * 100}%`,
                      backgroundColor: m.color,
                      opacity: 0.7,
                    }}
                  />
                </div>
                <span className="text-xs text-dim font-mono w-14 text-right">{fi.importance.toFixed(4)}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default function Predict() {
  const [dragging, setDragging] = useState(false)
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<PredictResponse | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [expanded, setExpanded] = useState<Record<string, boolean>>({})
  const inputRef = useRef<HTMLInputElement>(null)

  const handleFile = useCallback((f: File) => {
    if (!f.type.startsWith('image/')) {
      setError('Please upload an image file (PNG or JPG).')
      return
    }
    setFile(f)
    setResult(null)
    setError(null)
    const url = URL.createObjectURL(f)
    setPreview(url)
  }, [])

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragging(false)
    const f = e.dataTransfer.files[0]
    if (f) handleFile(f)
  }, [handleFile])

  const onAnalyse = async () => {
    if (!file) return
    setLoading(true)
    setError(null)
    try {
      const res = await predict(file)
      setResult(res)
    } catch (e: any) {
      setError(e?.response?.data?.detail || 'Server error. Make sure the backend is running.')
    } finally {
      setLoading(false)
    }
  }

  const consensus = result?.consensus === 1

  return (
    <div className="max-w-3xl mx-auto px-6 py-10">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white mb-1">Analyse Image</h1>
        <p className="text-muted text-sm">Upload a pre-segmented palpebral conjunctiva crop. All 5 models run in parallel and return individual predictions.</p>
      </div>

      {/* Upload zone */}
      <div
        onDragOver={e => { e.preventDefault(); setDragging(true) }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        onClick={() => !file && inputRef.current?.click()}
        className={`relative border-2 border-dashed rounded-xl transition-all cursor-pointer ${
          dragging ? 'border-accent bg-accent/5' : 'border-border hover:border-accent/50 hover:bg-surface/50'
        } ${file ? 'cursor-default' : ''}`}
      >
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={e => e.target.files?.[0] && handleFile(e.target.files[0])}
        />

        {preview ? (
          <div className="flex items-center gap-5 p-5">
            <img src={preview} alt="preview" className="w-28 h-28 object-cover rounded-lg bg-surface2" />
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium text-white truncate">{file?.name}</div>
              <div className="text-xs text-muted mt-1">{((file?.size || 0) / 1024).toFixed(1)} KB</div>
              <button
                onClick={e => { e.stopPropagation(); setFile(null); setPreview(null); setResult(null); inputRef.current?.click() }}
                className="mt-3 text-xs text-accent hover:underline"
              >
                Change image
              </button>
            </div>
          </div>
        ) : (
          <div className="py-14 flex flex-col items-center gap-3 text-center px-6">
            <div className="w-12 h-12 rounded-xl bg-surface2 flex items-center justify-center">
              <Upload className="w-5 h-5 text-muted" />
            </div>
            <div>
              <div className="text-sm font-medium text-white">Drop image here or click to browse</div>
              <div className="text-xs text-dim mt-1">PNG or JPG · 224×224 conjunctiva crop</div>
            </div>
          </div>
        )}
      </div>

      {error && (
        <div className="mt-4 flex items-start gap-2 text-red text-sm bg-red/10 border border-red/20 rounded-lg px-4 py-3">
          <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
          {error}
        </div>
      )}

      {file && !result && (
        <button onClick={onAnalyse} disabled={loading} className="btn-primary mt-4 w-full flex items-center justify-center gap-2">
          {loading ? <><Loader2 className="w-4 h-4 animate-spin" />Analysing…</> : 'Analyse Image'}
        </button>
      )}

      {/* Results */}
      {result && (
        <div className="mt-8 space-y-6">
          {/* Consensus */}
          <div className={`card p-5 ${consensus ? 'border-red/40' : 'border-green/40'}`}>
            <div className="flex items-center gap-4">
              <div className={`w-14 h-14 rounded-full flex items-center justify-center flex-shrink-0 ${consensus ? 'bg-red/15' : 'bg-green/15'}`}>
                {consensus
                  ? <XCircle className="w-7 h-7 text-red" />
                  : <CheckCircle2 className="w-7 h-7 text-green" />}
              </div>
              <div>
                <div className="text-xs text-dim font-semibold uppercase tracking-wider mb-1">Consensus (majority vote)</div>
                <div className={`text-2xl font-bold ${consensus ? 'text-red' : 'text-green'}`}>
                  {result.consensus_text}
                </div>
                <div className="text-xs text-muted mt-1">
                  {result.votes_anemic} of 5 models predict anemia ·{' '}
                  features extracted in {result.feat_time_ms}ms
                </div>
              </div>
            </div>
          </div>

          {/* Per-model */}
          <div>
            <div className="text-xs text-dim font-semibold uppercase tracking-wider mb-3">Per-Model Results</div>
            <div className="space-y-3">
              {MODEL_ORDER.map(key => {
                const m = result.models.find(x => x.key === key)
                if (!m) return null
                return (
                  <ModelCard
                    key={key}
                    m={m}
                    expanded={!!expanded[key]}
                    onToggle={() => setExpanded(p => ({ ...p, [key]: !p[key] }))}
                  />
                )
              })}
            </div>
          </div>

          <p className="text-xs text-dim border border-border rounded-lg px-4 py-3">
            ⚠️ This tool is for research and academic purposes only. It is not a substitute for clinical diagnosis.
          </p>
        </div>
      )}
    </div>
  )
}
