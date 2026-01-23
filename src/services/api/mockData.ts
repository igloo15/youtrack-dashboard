import { Issue, AgileBoard } from '@/types/youtrack';

// Mock data for testing without valid API credentials
export const mockIssues: Issue[] = [
  {
    $type: 'Issue',
    id: '1',
    idReadable: 'PROJ-1',
    summary: 'Implement user authentication system',
    description: 'Add JWT-based authentication with secure token storage',
    created: Date.now() - 30 * 24 * 60 * 60 * 1000, // 30 days ago
    updated: Date.now() - 2 * 24 * 60 * 60 * 1000, // 2 days ago
    resolved: Date.now() - 1 * 24 * 60 * 60 * 1000, // 1 day ago
    reporter: {
      $type: 'User',
      id: 'user1',
      login: 'john.doe',
      fullName: 'John Doe',
    },
    customFields: [
      {
        $type: 'CustomField',
        id: 'state1',
        name: 'State',
        value: {
          $type: 'StateValue',
          id: 'resolved',
          name: 'Resolved',
        },
      },
      {
        $type: 'CustomField',
        id: 'priority1',
        name: 'Priority',
        value: {
          $type: 'PriorityValue',
          id: 'high',
          name: 'High',
        },
      },
    ],
    tags: [
      {
        $type: 'Tag',
        id: 'tag1',
        name: 'backend',
      },
    ],
  },
  {
    $type: 'Issue',
    id: '2',
    idReadable: 'PROJ-2',
    summary: 'Design responsive dashboard layout',
    description: 'Create mobile-friendly dashboard with Tailwind CSS',
    created: Date.now() - 25 * 24 * 60 * 60 * 1000,
    updated: Date.now() - 1 * 24 * 60 * 60 * 1000,
    reporter: {
      $type: 'User',
      id: 'user2',
      login: 'jane.smith',
      fullName: 'Jane Smith',
    },
    customFields: [
      {
        $type: 'CustomField',
        id: 'state2',
        name: 'State',
        value: {
          $type: 'StateValue',
          id: 'inprogress',
          name: 'In Progress',
        },
      },
      {
        $type: 'CustomField',
        id: 'priority2',
        name: 'Priority',
        value: {
          $type: 'PriorityValue',
          id: 'normal',
          name: 'Normal',
        },
      },
    ],
    tags: [
      {
        $type: 'Tag',
        id: 'tag2',
        name: 'frontend',
      },
    ],
  },
  {
    $type: 'Issue',
    id: '3',
    idReadable: 'PROJ-3',
    summary: 'Fix memory leak in data processing',
    description: 'Optimize memory usage in large dataset processing',
    created: Date.now() - 20 * 24 * 60 * 60 * 1000,
    updated: Date.now() - 5 * 24 * 60 * 60 * 1000,
    resolved: Date.now() - 3 * 24 * 60 * 60 * 1000,
    reporter: {
      $type: 'User',
      id: 'user3',
      login: 'bob.wilson',
      fullName: 'Bob Wilson',
    },
    customFields: [
      {
        $type: 'CustomField',
        id: 'state3',
        name: 'State',
        value: {
          $type: 'StateValue',
          id: 'resolved',
          name: 'Resolved',
        },
      },
      {
        $type: 'CustomField',
        id: 'priority3',
        name: 'Priority',
        value: {
          $type: 'PriorityValue',
          id: 'critical',
          name: 'Critical',
        },
      },
    ],
  },
  {
    $type: 'Issue',
    id: '4',
    idReadable: 'PROJ-4',
    summary: 'Add dark mode support',
    description: 'Implement theme switching with dark mode',
    created: Date.now() - 18 * 24 * 60 * 60 * 1000,
    updated: Date.now() - 3 * 24 * 60 * 60 * 1000,
    reporter: {
      $type: 'User',
      id: 'user1',
      login: 'john.doe',
      fullName: 'John Doe',
    },
    customFields: [
      {
        $type: 'CustomField',
        id: 'state4',
        name: 'State',
        value: {
          $type: 'StateValue',
          id: 'open',
          name: 'Open',
        },
      },
      {
        $type: 'CustomField',
        id: 'priority4',
        name: 'Priority',
        value: {
          $type: 'PriorityValue',
          id: 'normal',
          name: 'Normal',
        },
      },
    ],
    tags: [
      {
        $type: 'Tag',
        id: 'tag3',
        name: 'frontend',
      },
      {
        $type: 'Tag',
        id: 'tag4',
        name: 'enhancement',
      },
    ],
  },
  {
    $type: 'Issue',
    id: '5',
    idReadable: 'PROJ-5',
    summary: 'Write API documentation',
    description: 'Document all REST API endpoints with examples',
    created: Date.now() - 15 * 24 * 60 * 60 * 1000,
    updated: Date.now() - 4 * 24 * 60 * 60 * 1000,
    resolved: Date.now() - 2 * 24 * 60 * 60 * 1000,
    reporter: {
      $type: 'User',
      id: 'user2',
      login: 'jane.smith',
      fullName: 'Jane Smith',
    },
    customFields: [
      {
        $type: 'CustomField',
        id: 'state5',
        name: 'State',
        value: {
          $type: 'StateValue',
          id: 'resolved',
          name: 'Resolved',
        },
      },
      {
        $type: 'CustomField',
        id: 'priority5',
        name: 'Priority',
        value: {
          $type: 'PriorityValue',
          id: 'low',
          name: 'Low',
        },
      },
    ],
    tags: [
      {
        $type: 'Tag',
        id: 'tag5',
        name: 'documentation',
      },
    ],
  },
  {
    $type: 'Issue',
    id: '6',
    idReadable: 'PROJ-6',
    summary: 'Implement file upload feature',
    description: 'Allow users to upload and manage files',
    created: Date.now() - 12 * 24 * 60 * 60 * 1000,
    updated: Date.now() - 1 * 24 * 60 * 60 * 1000,
    reporter: {
      $type: 'User',
      id: 'user3',
      login: 'bob.wilson',
      fullName: 'Bob Wilson',
    },
    customFields: [
      {
        $type: 'CustomField',
        id: 'state6',
        name: 'State',
        value: {
          $type: 'StateValue',
          id: 'inprogress',
          name: 'In Progress',
        },
      },
      {
        $type: 'CustomField',
        id: 'priority6',
        name: 'Priority',
        value: {
          $type: 'PriorityValue',
          id: 'high',
          name: 'High',
        },
      },
    ],
    tags: [
      {
        $type: 'Tag',
        id: 'tag6',
        name: 'backend',
      },
      {
        $type: 'Tag',
        id: 'tag7',
        name: 'feature',
      },
    ],
  },
  {
    $type: 'Issue',
    id: '7',
    idReadable: 'PROJ-7',
    summary: 'Optimize database queries',
    description: 'Improve query performance with proper indexing',
    created: Date.now() - 10 * 24 * 60 * 60 * 1000,
    updated: Date.now() - 6 * 24 * 60 * 60 * 1000,
    resolved: Date.now() - 5 * 24 * 60 * 60 * 1000,
    reporter: {
      $type: 'User',
      id: 'user1',
      login: 'john.doe',
      fullName: 'John Doe',
    },
    customFields: [
      {
        $type: 'CustomField',
        id: 'state7',
        name: 'State',
        value: {
          $type: 'StateValue',
          id: 'resolved',
          name: 'Resolved',
        },
      },
      {
        $type: 'CustomField',
        id: 'priority7',
        name: 'Priority',
        value: {
          $type: 'PriorityValue',
          id: 'high',
          name: 'High',
        },
      },
    ],
  },
  {
    $type: 'Issue',
    id: '8',
    idReadable: 'PROJ-8',
    summary: 'Setup CI/CD pipeline',
    description: 'Configure automated testing and deployment',
    created: Date.now() - 8 * 24 * 60 * 60 * 1000,
    updated: Date.now() - 2 * 24 * 60 * 60 * 1000,
    reporter: {
      $type: 'User',
      id: 'user2',
      login: 'jane.smith',
      fullName: 'Jane Smith',
    },
    customFields: [
      {
        $type: 'CustomField',
        id: 'state8',
        name: 'State',
        value: {
          $type: 'StateValue',
          id: 'open',
          name: 'Open',
        },
      },
      {
        $type: 'CustomField',
        id: 'priority8',
        name: 'Priority',
        value: {
          $type: 'PriorityValue',
          id: 'normal',
          name: 'Normal',
        },
      },
    ],
    tags: [
      {
        $type: 'Tag',
        id: 'tag8',
        name: 'devops',
      },
    ],
  },
  {
    $type: 'Issue',
    id: '9',
    idReadable: 'PROJ-9',
    summary: 'Add email notifications',
    description: 'Send notifications for important events',
    created: Date.now() - 7 * 24 * 60 * 60 * 1000,
    updated: Date.now() - 1 * 24 * 60 * 60 * 1000,
    reporter: {
      $type: 'User',
      id: 'user3',
      login: 'bob.wilson',
      fullName: 'Bob Wilson',
    },
    customFields: [
      {
        $type: 'CustomField',
        id: 'state9',
        name: 'State',
        value: {
          $type: 'StateValue',
          id: 'inprogress',
          name: 'In Progress',
        },
      },
      {
        $type: 'CustomField',
        id: 'priority9',
        name: 'Priority',
        value: {
          $type: 'PriorityValue',
          id: 'low',
          name: 'Low',
        },
      },
    ],
  },
  {
    $type: 'Issue',
    id: '10',
    idReadable: 'PROJ-10',
    summary: 'Update security dependencies',
    description: 'Upgrade packages with security vulnerabilities',
    created: Date.now() - 5 * 24 * 60 * 60 * 1000,
    updated: Date.now() - 4 * 24 * 60 * 60 * 1000,
    resolved: Date.now() - 4 * 24 * 60 * 60 * 1000,
    reporter: {
      $type: 'User',
      id: 'user1',
      login: 'john.doe',
      fullName: 'John Doe',
    },
    customFields: [
      {
        $type: 'CustomField',
        id: 'state10',
        name: 'State',
        value: {
          $type: 'StateValue',
          id: 'resolved',
          name: 'Resolved',
        },
      },
      {
        $type: 'CustomField',
        id: 'priority10',
        name: 'Priority',
        value: {
          $type: 'PriorityValue',
          id: 'critical',
          name: 'Critical',
        },
      },
    ],
    tags: [
      {
        $type: 'Tag',
        id: 'tag9',
        name: 'security',
      },
    ],
  },
];

// Mock agile boards data
export const mockAgileBoards: AgileBoard[] = [
  {
    $type: 'AgileBoard',
    id: 'board1',
    name: 'Sprint Board',
    owner: {
      $type: 'User',
      id: 'user1',
      login: 'john.doe',
      fullName: 'John Doe',
    },
    projects: [
      {
        id: 'proj1',
        name: 'Platform Project',
        shortName: 'PROJ',
      },
    ],
    currentSprint: {
      $type: 'Sprint',
      id: 'sprint1',
      name: 'Sprint 15',
      goal: 'Complete authentication and user management features',
      start: Date.now() - 7 * 24 * 60 * 60 * 1000, // Started 7 days ago
      finish: Date.now() + 7 * 24 * 60 * 60 * 1000, // Ends in 7 days
      isDefault: false,
    },
    sprints: [
      {
        $type: 'Sprint',
        id: 'sprint1',
        name: 'Sprint 15',
        goal: 'Complete authentication and user management features',
        start: Date.now() - 7 * 24 * 60 * 60 * 1000,
        finish: Date.now() + 7 * 24 * 60 * 60 * 1000,
        isDefault: false,
      },
      {
        $type: 'Sprint',
        id: 'sprint2',
        name: 'Sprint 16',
        goal: 'Dashboard improvements and analytics',
        start: Date.now() + 7 * 24 * 60 * 60 * 1000,
        finish: Date.now() + 21 * 24 * 60 * 60 * 1000,
        isDefault: false,
      },
    ],
    sprintsSettings: {
      disableSprints: false,
    },
  },
  {
    $type: 'AgileBoard',
    id: 'board2',
    name: 'Kanban Board',
    owner: {
      $type: 'User',
      id: 'user2',
      login: 'jane.smith',
      fullName: 'Jane Smith',
    },
    projects: [
      {
        id: 'proj1',
        name: 'Platform Project',
        shortName: 'PROJ',
      },
    ],
    sprintsSettings: {
      disableSprints: true,
    },
  },
  {
    $type: 'AgileBoard',
    id: 'board3',
    name: 'Bug Tracking Board',
    owner: {
      $type: 'User',
      id: 'user3',
      login: 'bob.wilson',
      fullName: 'Bob Wilson',
    },
    projects: [
      {
        id: 'proj1',
        name: 'Platform Project',
        shortName: 'PROJ',
      },
    ],
    sprintsSettings: {
      disableSprints: true,
    },
  },
];

// Check if we should use mock data (invalid API credentials)
export const shouldUseMockData = (): boolean => {
  const url = import.meta.env.VITE_YOUTRACK_URL;
  const token = import.meta.env.VITE_YOUTRACK_TOKEN;
  const projectId = import.meta.env.VITE_YOUTRACK_PROJECT_ID;

  // Use mock data if credentials are default/placeholder values
  // Note: Empty URL is OK (uses proxy), but check token and project ID
  return (
    !token ||
    !projectId ||
    (url && url.includes('your-instance')) ||
    token.includes('your-token') ||
    projectId === 'YOUR-PROJECT'
  );
};
