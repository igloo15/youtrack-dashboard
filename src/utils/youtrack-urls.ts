import env from '@/config/env';
import { shouldUseMockData } from '@/services/api/mockData';

/**
 * Get the public YouTrack URL for creating links
 * This is separate from the API URL to avoid CORS issues
 * API calls can use proxy mode, while links use the public URL
 */
export function getYouTrackPublicUrl(): string {
  // Don't generate links in demo mode (mock data)
  if (shouldUseMockData()) {
    return '';
  }

  const publicUrl = env.VITE_YOUTRACK_PUBLIC_URL;

  // If public URL is configured and not a placeholder, use it
  if (publicUrl && !publicUrl.includes('your-instance')) {
    return publicUrl.replace(/\/$/, ''); // Remove trailing slash
  }

  // Fall back to API URL if public URL not set
  const apiUrl = env.VITE_YOUTRACK_URL;
  if (apiUrl && !apiUrl.includes('your-instance')) {
    return apiUrl.replace(/\/$/, '');
  }

  return '';
}

/**
 * Generate a link to a specific issue in YouTrack
 * Uses the public URL, which doesn't have CORS restrictions for navigation
 */
export function getIssueUrl(issueId: string): string | null {
  const baseUrl = getYouTrackPublicUrl();
  if (!baseUrl) return null;

  return `${baseUrl}/issue/${issueId}`;
}

/**
 * Generate a link to a specific agile board in YouTrack
 * Uses the public URL, which doesn't have CORS restrictions for navigation
 */
export function getAgileBoardUrl(boardId: string): string | null {
  const baseUrl = getYouTrackPublicUrl();
  if (!baseUrl) return null;

  return `${baseUrl}/agiles/${boardId}`;
}

/**
 * Generate a link to the project in YouTrack
 * Uses the public URL, which doesn't have CORS restrictions for navigation
 */
export function getProjectUrl(): string | null {
  const baseUrl = getYouTrackPublicUrl();
  const projectId = env.VITE_YOUTRACK_PROJECT_ID;

  if (!baseUrl || projectId === 'YOUR-PROJECT') {
    return null;
  }

  return `${baseUrl}/projects/${projectId}`;
}
