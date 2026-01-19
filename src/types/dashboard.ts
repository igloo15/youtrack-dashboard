import { Issue } from './youtrack';

export interface ChartDataPoint {
  label: string;
  value: number;
  color?: string;
}

export interface TimeSeriesDataPoint {
  date: string;
  count: number;
}

export interface IssueFilters {
  search?: string;
  status?: string[];
  priority?: string[];
  type?: string[];
  reporter?: string;
  tags?: string[];
}

export interface DashboardStats {
  totalIssues: number;
  openIssues: number;
  resolvedIssues: number;
  inProgressIssues: number;
}

export interface IssueListState {
  issues: Issue[];
  loading: boolean;
  error: string | null;
  filters: IssueFilters;
}
