import React, { useEffect, useState } from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { fetchMetrics, fetchRocData, healthCheck } from '../hooks/useApi'
import { MetricsResponse, RocDataResponse } from '../types'
import { Loader2, Wifi, WifiOff } from 'lucide-react'

const MODEL_ORDER = ['xgboost', 'rf', 'svm', 'knn', 'gnb']
const COLORS: Record<string, string> = {
  xgboost: '#F6C90E',
  rf:      '#FF6B6B',
  svm:     '#4EA8DE',
  knn:     '#56CFB2',
  gnb:     '#C77DFF',
}

const METRIC_LABELS: Record<string, string> = {
  accuracy:     'Accuracy',
  precision:    'Precision',
  recall:       'Recall',
  f1:           'F1',
  specificity:  'Specificity',
  roc_auc:      'ROC-AUC',
  infer_time_ms:'Infer (ms)',
}

function pct(v: number) { return (v * 100).toFixed(2) + '%' }

function MetricCell({ value, metricKey }: { value: number; metricKey: string }) {
  if (metricKey === 'infer_time_ms') return <span className="font-mono text-xs">{value.toFixed(3)}ms</span>
  const pct_val = value * 100
  const color = pct_val >= 80 ? '#3fb950' : pct_val >= 65 ? '#d29922' : '#f85149'
  return <span className="font-mono text-xs" style={{ color }}>{pct(value)}</span>
}

export default function Compare() {
  const [metrics, setMetrics] = useState<MetricsResponse | null>(null)
  const [roc, setRoc] = useState<RocDataResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [backendLive, setBackendLive] = useState<boolean | null>(null)

  useEffect(() => {
    Promise.all([fetchMetrics(), fetchRocData(), healthCheck()])
      .then(([m, r, alive]) => {
        setMetrics(m)
        setRoc(r)
        setBackendLive(alive)
      })
      .finally(() => setLoading(false))
  }, [])

  if (loading) return (
    <div className="flex items-center justify-center h-64 text-muted">
      <Loader2 className="w-5 h-5 animate-spin mr-2" />Loading metrics…
    </div>
  )

  // Build ROC chart data
  const rocChartData: any[] = []
  if (roc) {
    const n = 200
    MODEL_ORDER.forEach(key => {
      const entry = roc[key]
      if (!entry) return
      const step = Math.max(1, Math.floor(entry.fpr.length / n))
      for (let i = 0; i < entry.fpr.length; i += step) {
        rocChartData.push({ fpr: +entry.fpr[i].toFixed(4), [`${key}_tpr`]: +entry.tpr[i].toFixed(4) })
      }
    })
    rocChartData.sort((a, b) => a.fpr - b.fpr)
  }

  const bestKey = metrics
    ? Object.entries(metrics).reduce((b, [k, v]) => v.accuracy > (metrics[b]?.accuracy || 0) ? k : b, 'xgboost')
    : 'rf'

  return (
    <div className="max-w-5xl mx-auto px-6 py-10 space-y-12">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-white mb-1">Model Comparison</h1>
          <p className="text-muted text-sm">All metrics on a leakage-free test set of genuinely unseen patient source IDs. Positive class = Anemic.</p>
        </div>
        {backendLive !== null && (
          <div className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full ${
            backendLive
              ? 'bg-green/10 text-green border border-green/20'
              : 'bg-surface2 text-dim border border-border'
          }`}>
            {backendLive
              ? <><Wifi className="w-3 h-3" /> Live backend</>
              : <><WifiOff className="w-3 h-3" /> Showing pre-computed results</>
            }
          </div>
        )}
      </div>

      {/* Metrics table */}
      {metrics && (
        <div>
          <div className="text-xs text-dim font-semibold uppercase tracking-wider mb-4">Test Set Metrics</div>
          <div className="overflow-x-auto card">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left px-4 py-3 text-xs font-semibold text-dim uppercase tracking-wider">Model</th>
                  {Object.keys(METRIC_LABELS).map(k => (
                    <th key={k} className="text-right px-4 py-3 text-xs font-semibold text-dim uppercase tracking-wider whitespace-nowrap">
                      {METRIC_LABELS[k]}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {MODEL_ORDER.map(key => {
                  const m = metrics[key]
                  if (!m) return null
                  return (
                    <tr key={key} className="border-b border-border/50 hover:bg-surface2/50">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: COLORS[key] }} />
                          <span className="font-medium text-white text-sm">{m.name}</span>
                          {key === bestKey && <span className="tag text-[10px] bg-yellow/15 text-yellow ml-1">Best</span>}
                        </div>
                      </td>
                      {Object.keys(METRIC_LABELS).map(mk => (
                        <td key={mk} className="px-4 py-3 text-right">
                          <MetricCell value={(m as any)[mk]} metricKey={mk} />
                        </td>
                      ))}
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Confusion matrices */}
      {metrics && (
        <div>
          <div className="text-xs text-dim font-semibold uppercase tracking-wider mb-4">Confusion Matrices (Test Set)</div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
            {MODEL_ORDER.map(key => {
              const m = metrics[key]
              if (!m) return null
              return (
                <div key={key} className="card p-4" style={{ borderTop: `2px solid ${COLORS[key]}` }}>
                  <div className="text-xs font-semibold mb-3 text-center" style={{ color: COLORS[key] }}>{m.name}</div>
                  <div className="grid grid-cols-2 gap-1 text-center text-xs">
                    <div className="bg-green/20 text-green rounded px-1 py-2 font-mono font-bold">{m.tn}<div className="text-[9px] font-normal text-dim mt-0.5">TN</div></div>
                    <div className="bg-red/15 text-red rounded px-1 py-2 font-mono font-bold">{m.fp}<div className="text-[9px] font-normal text-dim mt-0.5">FP</div></div>
                    <div className="bg-red/15 text-red rounded px-1 py-2 font-mono font-bold">{m.fn}<div className="text-[9px] font-normal text-dim mt-0.5">FN</div></div>
                    <div className="bg-green/20 text-green rounded px-1 py-2 font-mono font-bold">{m.tp}<div className="text-[9px] font-normal text-dim mt-0.5">TP</div></div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* ROC curves */}
      {roc && (
        <div>
          <div className="text-xs text-dim font-semibold uppercase tracking-wider mb-4">ROC Curves</div>
          <div className="card p-5">
            <ResponsiveContainer width="100%" height={340}>
              <LineChart data={rocChartData} margin={{ top: 10, right: 20, left: 0, bottom: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#21262d" />
                <XAxis dataKey="fpr" type="number" domain={[0,1]} tickCount={6}
                  tick={{ fill: '#8b949e', fontSize: 11 }}
                  label={{ value: 'False Positive Rate', position: 'insideBottom', offset: -5, fill: '#8b949e', fontSize: 12 }} />
                <YAxis domain={[0,1]} tickCount={6}
                  tick={{ fill: '#8b949e', fontSize: 11 }}
                  label={{ value: 'True Positive Rate', angle: -90, position: 'insideLeft', fill: '#8b949e', fontSize: 12 }} />
                <Tooltip
                  contentStyle={{ background: '#161b22', border: '1px solid #30363d', borderRadius: 6, fontSize: 12 }}
                  labelStyle={{ color: '#8b949e' }}
                  formatter={(v: any, name: string) => [v?.toFixed(3), name.replace('_tpr','')]}
                />
                <Legend wrapperStyle={{ fontSize: 12, color: '#8b949e', paddingTop: 12 }}
                  formatter={(v) => {
                    const key = v.replace('_tpr','')
                    const entry = roc[key]
                    return entry ? `${entry.name} (AUC=${entry.auc.toFixed(3)})` : v
                  }} />
                {MODEL_ORDER.map(key => (
                  <Line key={key} type="monotone" dataKey={`${key}_tpr`}
                    stroke={COLORS[key]} dot={false} strokeWidth={2} name={key} />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Honest accuracy note */}
      <div className="card p-5 border-yellow/30">
        <div className="text-xs font-semibold text-yellow uppercase tracking-wider mb-2">📋 Why our accuracy is lower than the paper</div>
        <p className="text-sm text-muted leading-relaxed">
          The reference paper (Jayanth &amp; Aneetha, 2025) reports 99% accuracy using a CNN on the same dataset. However, their train/test split has 100% leakage — every test image is an augmented copy of a training image. Our split is grouped by source patient ID, so the test set contains genuinely unseen patients. Our numbers are honest. The Random Forest's ~78% accuracy on truly unseen patients is a meaningful, deployable result.
        </p>
      </div>
    </div>
  )
}
