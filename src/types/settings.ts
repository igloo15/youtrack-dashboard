export interface GlobalFilterField {
  name: string;
  label: string;
  enabled: boolean;
}

export interface DashboardSettings {
  dashboard: {
    title: string;
    subtitle: string;
  };
  globalFilters: {
    enabled: boolean;
    availableFields: GlobalFilterField[];
    allowMultiple: boolean; // If true, users can add multiple field filters
    defaultFilters: string[]; // Array of default field names to show on load
    dateFilter: {
      enabled: boolean;
      defaultRange: string; // 'all', 'last-week', 'last-month', 'last-3-months', 'last-year'
    };
  };
  charts: {
    matrix: {
      defaultXField: string;
      defaultYField: string;
    };
  };
}

export const DEFAULT_SETTINGS: DashboardSettings = {
  dashboard: {
    title: 'YouTrack Dashboard',
    subtitle: 'Project Issue Tracking',
  },
  globalFilters: {
    enabled: true,
    availableFields: [],
    allowMultiple: true,
    defaultFilters: [],
    dateFilter: {
      enabled: true,
      defaultRange: 'all',
    },
  },
  charts: {
    matrix: {
      defaultXField: 'State',
      defaultYField: 'Priority',
    },
  },
};
