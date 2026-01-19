import { useState, useMemo } from 'react';
import { Issue } from '@/types/youtrack';
import { IssueFilters } from '@/types/dashboard';

export function useIssueFilters(issues: Issue[]) {
  const [filters, setFilters] = useState<IssueFilters>({});

  const filteredIssues = useMemo(() => {
    return issues.filter(issue => {
      // Search filter
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        if (!issue.summary.toLowerCase().includes(searchLower) &&
            !issue.idReadable.toLowerCase().includes(searchLower)) {
          return false;
        }
      }

      // Status filter
      if (filters.status && filters.status.length > 0) {
        const stateField = issue.customFields?.find(f => f.name === 'State');
        const state = (stateField?.value as any)?.name;
        if (!state || !filters.status.includes(state)) {
          return false;
        }
      }

      // Priority filter
      if (filters.priority && filters.priority.length > 0) {
        const priorityField = issue.customFields?.find(f => f.name === 'Priority');
        const priority = (priorityField?.value as any)?.name;
        if (!priority || !filters.priority.includes(priority)) {
          return false;
        }
      }

      return true;
    });
  }, [issues, filters]);

  return { filters, setFilters, filteredIssues };
}
