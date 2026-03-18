import { useQuery } from '@tanstack/react-query';
import { getBatchStatus } from '../services/batchService';

type BatchStatusResponse = {
  status: 'queued' | 'processing' | 'complete' | 'failed';
  processed: number;
  total: number;
};

export function useBatchJob(batchId: string) {
  return useQuery<BatchStatusResponse, Error>({
    queryKey: ['batch', batchId, 'status'],
    queryFn: () => getBatchStatus(batchId),
    enabled: !!batchId,
    refetchInterval: (query) => {
      const status = query.state.data?.status;
      if (!status) return false;
      return status === 'queued' || status === 'processing' ? 3000 : false;
    },
  });
}
