import { youtrackApi } from './config';
import { Issue, IssuesResponse, IssueQueryParams, AgileBoard, AgileBoardsResponse } from '@/types/youtrack';
import { TimeSeriesDataPoint } from '@/types/dashboard';
import env from '@/config/env';
import { mockIssues, mockAgileBoards, shouldUseMockData } from './mockData';

export const youtrackService = {
  // Fetch issues with filters
  async getIssues(params: IssueQueryParams = {}): Promise<IssuesResponse> {
    // Use mock data if credentials are invalid
    if (shouldUseMockData()) {
      console.info('🔧 Using mock data (invalid API credentials detected)');
      return {
        issues: mockIssues,
        total: mockIssues.length,
      };
    }

    try {
      const queryString = params.query || `project: ${env.VITE_YOUTRACK_PROJECT_ID}`;

      const response = await youtrackApi.get<Issue[]>('/issues', {
        params: {
          query: queryString,
          fields: params.fields || 'id,idReadable,summary,description,created,updated,resolved,customFields(name,value(name)),reporter(login,fullName),tags(name)',
          $top: params.$top || 100,
          $skip: params.$skip || 0,
        },
      });

      return {
        issues: response.data,
        total: response.data.length,
      };
    } catch (error) {
      console.warn('⚠️ API request failed, falling back to mock data:', error);
      return {
        issues: mockIssues,
        total: mockIssues.length,
      };
    }
  },

  // Fetch a single issue by ID
  async getIssue(issueId: string): Promise<Issue> {
    const response = await youtrackApi.get<Issue>(`/issues/${issueId}`, {
      params: {
        fields: 'id,idReadable,summary,description,created,updated,resolved,customFields(name,value(name)),reporter(login,fullName),tags(name),comments(text,created,author(login,fullName))',
      },
    });

    return response.data;
  },

  // Get issues grouped by status for charts
  async getIssuesByStatus(): Promise<Record<string, number>> {
    const issues = await this.getIssues({
      fields: 'customFields(name,value(name))',
    });

    // Process issues to count by status
    const statusCounts: Record<string, number> = {};

    issues.issues.forEach((issue) => {
      const statusField = issue.customFields?.find(f => f.name === 'State');
      const status = (statusField?.value as any)?.name || 'Unknown';
      statusCounts[status] = (statusCounts[status] || 0) + 1;
    });

    return statusCounts;
  },

  // Get completed tasks over time
  async getCompletedTasksTimeline(): Promise<TimeSeriesDataPoint[]> {
    const issues = await this.getIssues({
      query: `project: ${env.VITE_YOUTRACK_PROJECT_ID} #Resolved`,
      fields: 'resolved',
    });

    // Group by date
    const dateMap = new Map<string, number>();

    issues.issues.forEach((issue) => {
      if (issue.resolved) {
        const date = new Date(issue.resolved).toISOString().split('T')[0];
        dateMap.set(date, (dateMap.get(date) || 0) + 1);
      }
    });

    return Array.from(dateMap.entries())
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => a.date.localeCompare(b.date));
  },

  // Fetch agile boards linked to the project
  async getAgileBoards(): Promise<AgileBoardsResponse> {
    // Use mock data if credentials are invalid
    if (shouldUseMockData()) {
      console.info('🔧 Using mock agile boards data');
      return {
        boards: mockAgileBoards,
        total: mockAgileBoards.length,
      };
    }

    try {
      const response = await youtrackApi.get<AgileBoard[]>('/agiles', {
        params: {
          fields: 'id,name,owner(login,fullName),projects(id,name,shortName),sprints(id,name,goal,start,finish,isDefault),currentSprint(id,name,goal,start,finish),sprintsSettings(disableSprints)',
          $top: 50,
        },
      });

      // Filter boards that are linked to the current project
      const projectId = env.VITE_YOUTRACK_PROJECT_ID;
      const filteredBoards = response.data.filter(board =>
        board.projects?.some(project => project.shortName === projectId || project.id === projectId)
      );

      return {
        boards: filteredBoards,
        total: filteredBoards.length,
      };
    } catch (error) {
      console.warn('⚠️ Agile boards API request failed, falling back to mock data:', error);
      return {
        boards: mockAgileBoards,
        total: mockAgileBoards.length,
      };
    }
  },
};
