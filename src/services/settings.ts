import { DashboardSettings, DEFAULT_SETTINGS } from '@/types/settings';

let cachedSettings: DashboardSettings | null = null;

export const settingsService = {
  /**
   * Load dashboard settings from JSON file
   */
  async loadSettings(): Promise<DashboardSettings> {
    // Return cached settings if already loaded
    if (cachedSettings) {
      return cachedSettings;
    }

    try {
      const response = await fetch('/dashboard-settings.json');

      if (!response.ok) {
        console.warn('Failed to load dashboard settings, using defaults');
        cachedSettings = DEFAULT_SETTINGS;
        return DEFAULT_SETTINGS;
      }

      const settings = await response.json() as DashboardSettings;

      // Validate and merge with defaults to ensure all required fields exist
      cachedSettings = {
        dashboard: {
          title: settings.dashboard?.title || DEFAULT_SETTINGS.dashboard.title,
          subtitle: settings.dashboard?.subtitle || DEFAULT_SETTINGS.dashboard.subtitle,
        },
        globalFilters: {
          enabled: settings.globalFilters?.enabled ?? DEFAULT_SETTINGS.globalFilters.enabled,
          availableFields: settings.globalFilters?.availableFields || DEFAULT_SETTINGS.globalFilters.availableFields,
          defaultField: settings.globalFilters?.defaultField || DEFAULT_SETTINGS.globalFilters.defaultField,
        },
        charts: {
          matrix: {
            defaultXField: settings.charts?.matrix?.defaultXField || DEFAULT_SETTINGS.charts.matrix.defaultXField,
            defaultYField: settings.charts?.matrix?.defaultYField || DEFAULT_SETTINGS.charts.matrix.defaultYField,
          },
        },
      };

      console.info('✓ Dashboard settings loaded successfully');
      return cachedSettings;
    } catch (error) {
      console.error('Error loading dashboard settings:', error);
      cachedSettings = DEFAULT_SETTINGS;
      return DEFAULT_SETTINGS;
    }
  },

  /**
   * Get cached settings (returns null if not loaded yet)
   */
  getCachedSettings(): DashboardSettings | null {
    return cachedSettings;
  },

  /**
   * Clear cached settings (useful for testing)
   */
  clearCache(): void {
    cachedSettings = null;
  },
};
