export interface FeatureImportance {
  feature: string
  importance: number
}

export interface ModelResult {
  key: string
  name: string
  family: string
  color: string
  label: number
  label_text: 'Anemic' | 'Non-Anemic'
  probability: number
  infer_ms: number
  feature_importance: FeatureImportance[] | null
}

export interface PredictResponse {
  consensus: number
  consensus_text: 'Anemic' | 'Non-Anemic'
  votes_anemic: number
  feat_time_ms: number
  models: ModelResult[]
}

export interface ModelMetrics {
  name: string
  accuracy: number
  precision: number
  recall: number
  f1: number
  specificity: number
  roc_auc: number
  tp: number
  tn: number
  fp: number
  fn: number
  train_time_s: number
  infer_time_ms: number
}

export interface MetricsResponse {
  [key: string]: ModelMetrics
}

export interface RocEntry {
  fpr: number[]
  tpr: number[]
  name: string
  auc: number
}

export interface RocDataResponse {
  [key: string]: RocEntry
}
