import { ScoreResult } from '../types/score';
import { sampleVehicleScores } from './mockData';
import { calculateScoreFromViolations } from '../utils/dbsScoring';

export interface BatchRow {
  reg_no: string;
  policy_id?: string;
  vehicle_type?: string;
}

export interface BatchResult {
  id: string;
  rows: Array<{ reg_no: string; score: number | null; band: string; tpLoading: number }>; 
  status: 'queued' | 'processing' | 'complete' | 'failed';
}

const batchStore: Record<string, BatchResult> = {};

export async function submitBatch(rows: BatchRow[]): Promise<{ batchId: string }> {
  const batchId = `BATCH-${Date.now()}`;
  batchStore[batchId] = {
    id: batchId,
    status: 'queued',
    rows: rows.map((r) => {
      const entry = sampleVehicleScores[r.reg_no.toUpperCase().replace(/\s+/g, '')];
      const computed = entry ? calculateScoreFromViolations(entry.violations) : null;
      return {
        reg_no: r.reg_no,
        score: computed?.score ?? null,
        band: computed?.band ?? 'NOT_FOUND',
        tpLoading: entry?.tpLoading ?? 0
      };
    })
  };
  setTimeout(() => {
    const current = batchStore[batchId];
    if (current) {
      current.status = 'processing';
      setTimeout(() => {
        current.status = 'complete';
      }, 1200);
    }
  }, 500);
  return { batchId };
}

export async function getBatchStatus(batchId: string): Promise<{ status: BatchResult['status']; processed: number; total: number }> {
  const batch = batchStore[batchId];
  if (!batch) throw new Error('batch_not_found');
  const total = batch.rows.length;
  const processed = batch.status === 'complete' ? total : Math.floor(total * (batch.status === 'processing' ? 0.6 : 0.1));
  return { status: batch.status, processed, total };
}

export async function getBatchResults(batchId: string): Promise<BatchResult> {
  const batch = batchStore[batchId];
  if (!batch) throw new Error('batch_not_found');
  return batch;
}
