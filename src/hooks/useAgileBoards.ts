import { useState, useEffect } from 'react';
import { AgileBoard } from '@/types/youtrack';
import { youtrackService } from '@/services/api/youtrack';

export function useAgileBoards() {
  const [boards, setBoards] = useState<AgileBoard[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchBoards = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await youtrackService.getAgileBoards();
      setBoards(response.boards);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch agile boards');
      console.error('Error fetching agile boards:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBoards();
  }, []);

  return { boards, loading, error, refetch: fetchBoards };
}
