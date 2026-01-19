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
    defaultField: string;
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
    defaultField: '',
  },
  charts: {
    matrix: {
      defaultXField: 'State',
      defaultYField: 'Priority',
    },
  },
};
