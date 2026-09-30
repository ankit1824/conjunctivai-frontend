import axios from 'axios'
import { PredictResponse, MetricsResponse, RocDataResponse } from '../types'

const API = (import.meta as any).env?.VITE_API_URL || ''

export async function predict(file: File): Promise<PredictResponse> {
  const form = new FormData()
  form.append('file', file)
  const { data } = await axios.post<PredictResponse>(`${API}/predict`, form)
  return data
}

export async function fetchMetrics(): Promise<MetricsResponse> {
  const { data } = await axios.get<MetricsResponse>(`${API}/metrics`)
  return data
}

export async function fetchRocData(): Promise<RocDataResponse> {
  const { data } = await axios.get<RocDataResponse>(`${API}/roc_data`)
  return data
}

export async function healthCheck(): Promise<boolean> {
  try {
    await axios.get(`${API}/health`, { timeout: 3000 })
    return true
  } catch {
    return false
  }
}
