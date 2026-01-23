// Base types from YouTrack API
export interface YouTrackEntity {
  $type: string;
  id: string;
}

export interface User extends YouTrackEntity {
  login: string;
  fullName: string;
  email?: string;
  avatarUrl?: string;
}

export interface Tag extends YouTrackEntity {
  name: string;
  color?: {
    id: string;
    background: string;
    foreground: string;
  };
}

export interface CustomFieldValue extends YouTrackEntity {
  name: string;
  color?: {
    id: string;
    background: string;
    foreground: string;
  };
}

export interface CustomField extends YouTrackEntity {
  name: string;
  value: CustomFieldValue | CustomFieldValue[] | string | number | null;
}

export interface Comment extends YouTrackEntity {
  text: string;
  created: number;
  updated?: number;
  author: User;
}

export interface Issue extends YouTrackEntity {
  idReadable: string;
  summary: string;
  description?: string;
  created: number;
  updated: number;
  resolved?: number;
  reporter: User;
  customFields?: CustomField[];
  tags?: Tag[];
  comments?: Comment[];
}

// API request/response types
export interface IssueQueryParams {
  query?: string;
  fields?: string;
  $top?: number;
  $skip?: number;
}

export interface IssuesResponse {
  issues: Issue[];
  total: number;
}

// Helper types for custom fields
export type IssueState = 'Open' | 'In Progress' | 'Resolved' | 'Closed' | 'Verified';
export type IssuePriority = 'Critical' | 'High' | 'Normal' | 'Low';
export type IssueType = 'Bug' | 'Feature' | 'Task' | 'Epic';

// Agile Board types
export interface AgileColumn extends YouTrackEntity {
  name: string;
  isResolved?: boolean;
  ordinal?: number;
}

export interface AgileSprint extends YouTrackEntity {
  name: string;
  goal?: string;
  start?: number;
  finish?: number;
  isDefault?: boolean;
}

export interface AgileBoard extends YouTrackEntity {
  name: string;
  owner?: User;
  createdBy?: User;
  projects?: Array<{
    id: string;
    name: string;
    shortName: string;
  }>;
  columns?: AgileColumn[];
  sprints?: AgileSprint[];
  currentSprint?: AgileSprint;
  sprintsSettings?: {
    disableSprints?: boolean;
  };
}

export interface AgileBoardsResponse {
  boards: AgileBoard[];
  total: number;
}
