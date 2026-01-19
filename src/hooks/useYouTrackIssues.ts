import { useState, useEffect } from 'react';
import { Issue, IssueQueryParams } from '@/types/youtrack';
import { youtrackService } from '@/services/api/youtrack';

export function useYouTrackIssues(params?: IssueQueryParams) {
  const [issues, setIssues] = useState<Issue[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchIssues = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await youtrackService.getIssues(params || {});
      setIssues(response.issues);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch issues');
      console.error('Error fetching issues:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIssues();
  }, [JSON.stringify(params)]); // Re-fetch when params change

  return { issues, loading, error, refetch: fetchIssues };
}
