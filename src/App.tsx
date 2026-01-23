import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useYouTrackIssues } from '@/hooks/useYouTrackIssues';
import { useAgileBoards } from '@/hooks/useAgileBoards';
import { useIssueFilters } from '@/hooks/useIssueFilters';
import { youtrackService } from '@/services/api/youtrack';
import { TimeSeriesDataPoint, ChartDataPoint } from '@/types/dashboard';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { shouldUseMockData } from '@/services/api/mockData';
import { IssueMatrixChart } from '@/components/charts/IssueMatrixChart';
import { settingsService } from '@/services/settings';
import { DashboardSettings, DEFAULT_SETTINGS } from '@/types/settings';
import { getIssueUrl, getAgileBoardUrl } from '@/utils/youtrack-urls';

const CHART_COLORS = [
  'hsl(221, 83%, 53%)',
  'hsl(212, 95%, 68%)',
  'hsl(216, 92%, 60%)',
  'hsl(210, 98%, 78%)',
  'hsl(212, 97%, 87%)',
];

function App() {
  const { issues, loading, error, refetch } = useYouTrackIssues();
  const { boards, loading: boardsLoading, error: boardsError } = useAgileBoards();
  const usingMockData = shouldUseMockData();

  const [settings, setSettings] = useState<DashboardSettings>(DEFAULT_SETTINGS);
  const [settingsLoading, setSettingsLoading] = useState(true);

  const [darkMode, setDarkMode] = useState(() => {
    // Check localStorage or system preference
    const stored = localStorage.getItem('darkMode');
    if (stored !== null) {
      return stored === 'true';
    }
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  // Multiple global filters support
  interface ActiveFilter {
    id: string;
    field: string;
    value: string;
  }

  // Initialize filters from localStorage or empty array
  const [activeFilters, setActiveFilters] = useState<ActiveFilter[]>(() => {
    const saved = localStorage.getItem('dashboardActiveFilters');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return [];
      }
    }
    return [];
  });

  // Initialize date filter from localStorage
  const [dateFilterRange, setDateFilterRange] = useState<string>(() => {
    return localStorage.getItem('dashboardDateFilter') || 'all';
  });
  const [completedTasksData, setCompletedTasksData] = useState<TimeSeriesDataPoint[]>([]);
  const [statusChartData, setStatusChartData] = useState<ChartDataPoint[]>([]);
  const [matrixXField, setMatrixXField] = useState('State');
  const [matrixYField, setMatrixYField] = useState('Priority');

  // Load dashboard settings on mount
  useEffect(() => {
    const loadSettings = async () => {
      const loadedSettings = await settingsService.loadSettings();
      setSettings(loadedSettings);

      // Only apply default values if nothing is saved in localStorage
      const hasStoredFilters = localStorage.getItem('dashboardActiveFilters');
      const hasStoredDateFilter = localStorage.getItem('dashboardDateFilter');

      if (!hasStoredFilters && loadedSettings.globalFilters.defaultFilters && loadedSettings.globalFilters.defaultFilters.length > 0) {
        const defaultFilters = loadedSettings.globalFilters.defaultFilters.map((field, index) => ({
          id: `filter-${Date.now()}-${index}`,
          field,
          value: 'all',
        }));
        setActiveFilters(defaultFilters);
      }

      if (!hasStoredDateFilter && loadedSettings.globalFilters.dateFilter.defaultRange) {
        setDateFilterRange(loadedSettings.globalFilters.dateFilter.defaultRange);
      }

      setMatrixXField(loadedSettings.charts.matrix.defaultXField);
      setMatrixYField(loadedSettings.charts.matrix.defaultYField);

      setSettingsLoading(false);
    };

    loadSettings();
  }, []);

  // Apply dark mode class to document root
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('darkMode', darkMode.toString());
  }, [darkMode]);

  // Save active filters to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('dashboardActiveFilters', JSON.stringify(activeFilters));
  }, [activeFilters]);

  // Save date filter to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('dashboardDateFilter', dateFilterRange);
  }, [dateFilterRange]);

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  // Helper function to get date range cutoff
  const getDateCutoff = (range: string): number | null => {
    if (range === 'all') return null;

    const now = Date.now();
    const msPerDay = 24 * 60 * 60 * 1000;

    switch (range) {
      case 'last-week':
        return now - (7 * msPerDay);
      case 'last-month':
        return now - (30 * msPerDay);
      case 'last-3-months':
        return now - (90 * msPerDay);
      case 'last-year':
        return now - (365 * msPerDay);
      default:
        return null;
    }
  };

  // Apply global filters to issues (multiple field filters + date filter)
  const globallyFilteredIssues = useMemo(() => {
    let filtered = issues;

    // Apply each active custom field filter
    activeFilters.forEach(filter => {
      if (filter.field && filter.value !== 'all') {
        filtered = filtered.filter(issue => {
          const fieldData = issue.customFields?.find(f => f.name === filter.field);
          if (!fieldData?.value) return false;

          if (typeof fieldData.value === 'object' && 'name' in fieldData.value) {
            return fieldData.value.name === filter.value;
          }
          return false;
        });
      }
    });

    // Apply date filter
    if (dateFilterRange && dateFilterRange !== 'all') {
      const cutoff = getDateCutoff(dateFilterRange);
      if (cutoff !== null) {
        filtered = filtered.filter(issue => issue.updated >= cutoff);
      }
    }

    return filtered;
  }, [issues, activeFilters, dateFilterRange]);

  const { filters, setFilters, filteredIssues } = useIssueFilters(globallyFilteredIssues);

  // Calculate dashboard stats
  const stats = useMemo(() => {
    const getStatusCount = (statusName: string) => {
      return globallyFilteredIssues.filter(issue => {
        const stateField = issue.customFields?.find(f => f.name === 'State');
        return (stateField?.value as any)?.name === statusName;
      }).length;
    };

    return {
      totalIssues: globallyFilteredIssues.length,
      openIssues: getStatusCount('Open'),
      inProgressIssues: getStatusCount('In Progress'),
      resolvedIssues: getStatusCount('Resolved'),
    };
  }, [globallyFilteredIssues]);

  // Calculate chart data from globally filtered issues
  useEffect(() => {
    if (!loading && !error) {
      // Calculate completed tasks timeline
      const dateMap = new Map<string, number>();
      globallyFilteredIssues.forEach((issue) => {
        if (issue.resolved) {
          const date = new Date(issue.resolved).toISOString().split('T')[0];
          dateMap.set(date, (dateMap.get(date) || 0) + 1);
        }
      });

      const timeline = Array.from(dateMap.entries())
        .map(([date, count]) => ({ date, count }))
        .sort((a, b) => a.date.localeCompare(b.date));

      // Calculate status counts
      const statusCounts: Record<string, number> = {};
      globallyFilteredIssues.forEach((issue) => {
        const statusField = issue.customFields?.find(f => f.name === 'State');
        const status = (statusField?.value as any)?.name || 'Unknown';
        statusCounts[status] = (statusCounts[status] || 0) + 1;
      });

      setCompletedTasksData(timeline);
      setStatusChartData(
        Object.entries(statusCounts).map(([label, value]) => ({ label, value }))
      );
    }
  }, [loading, error, globallyFilteredIssues]);

  // Get available filter options
  const availableStatuses = useMemo(() => {
    const statuses = new Set<string>();
    globallyFilteredIssues.forEach(issue => {
      const stateField = issue.customFields?.find(f => f.name === 'State');
      if ((stateField?.value as any)?.name) {
        statuses.add((stateField.value as any).name);
      }
    });
    return Array.from(statuses).sort();
  }, [globallyFilteredIssues]);

  // Get available custom field names for matrix chart and global filter
  const availableCustomFields = useMemo(() => {
    const fields = new Set<string>();
    issues.forEach(issue => {
      issue.customFields?.forEach(field => {
        if (field.value && typeof field.value === 'object' && 'name' in field.value) {
          fields.add(field.name);
        }
      });
    });
    return Array.from(fields).sort();
  }, [issues]);

  // Get available values for a specific filter field
  const getAvailableValuesForField = (fieldName: string): string[] => {
    if (!fieldName) return [];

    const values = new Set<string>();
    issues.forEach(issue => {
      const fieldData = issue.customFields?.find(f => f.name === fieldName);
      if (fieldData?.value && typeof fieldData.value === 'object' && 'name' in fieldData.value) {
        values.add(fieldData.value.name as string);
      }
    });
    return Array.from(values).sort();
  };

  // Helper functions for managing filters
  const addNewFilter = () => {
    const newFilter: ActiveFilter = {
      id: `filter-${Date.now()}`,
      field: '',
      value: 'all',
    };
    setActiveFilters([...activeFilters, newFilter]);
  };

  const updateFilter = (id: string, field: string, value: string) => {
    setActiveFilters(activeFilters.map(filter =>
      filter.id === id ? { ...filter, field, value } : filter
    ));
  };

  const removeFilter = (id: string) => {
    setActiveFilters(activeFilters.filter(filter => filter.id !== id));
  };

  const clearAllFilters = () => {
    setActiveFilters([]);
    setDateFilterRange('all');
  };

  // Check if any filters are active
  const hasActiveFilters = activeFilters.some(f => f.field && f.value !== 'all') || dateFilterRange !== 'all';

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="container mx-auto flex items-center justify-between p-6">
          <div>
            <h1 className="text-3xl font-bold">{settings.dashboard.title}</h1>
            <p className="text-muted-foreground">{settings.dashboard.subtitle}</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={toggleDarkMode}
              className="rounded-md border border-input bg-background px-4 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground"
              title={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {darkMode ? (
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              ) : (
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                </svg>
              )}
            </button>
            <button
              onClick={refetch}
              className="rounded-md border border-input bg-background px-4 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground"
            >
              Refresh
            </button>
          </div>
        </div>
      </header>

      {usingMockData && (
        <div className="bg-blue-50 border-b border-blue-200 dark:bg-blue-950 dark:border-blue-800">
          <div className="container mx-auto p-4">
            <div className="flex items-start gap-3">
              <span className="text-2xl">🔧</span>
              <div>
                <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
                  Demo Mode - Using Mock Data
                </p>
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  Configure your YouTrack API credentials in the <code className="bg-blue-100 dark:bg-blue-900 px-1 rounded">.env</code> file to connect to real data.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Global Filter Section */}
      {settings.globalFilters.enabled && availableCustomFields.length > 0 && (
        <div className="border-b bg-card">
          <div className="container mx-auto p-4">
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-4">
                <span className="text-sm font-medium text-muted-foreground">Filter All Data:</span>
              </div>

              {/* Active Filters */}
              <div className="flex flex-wrap items-start gap-3">
                {activeFilters.map((filter) => {
                  const availableFields = settings.globalFilters.availableFields
                    .filter(field => field.enabled && availableCustomFields.includes(field.name));
                  const fieldValues = getAvailableValuesForField(filter.field);

                  return (
                    <div key={filter.id} className="flex items-center gap-2 rounded-lg border border-input bg-background p-2">
                      <select
                        value={filter.field}
                        onChange={(e) => updateFilter(filter.id, e.target.value, 'all')}
                        className="flex h-9 rounded-md border border-input bg-background px-3 text-sm"
                      >
                        <option value="">Select Field...</option>
                        {availableFields.map(field => (
                          <option key={field.name} value={field.name}>{field.label}</option>
                        ))}
                      </select>

                      {filter.field && (
                        <>
                          <span className="text-sm text-muted-foreground">=</span>
                          <select
                            value={filter.value}
                            onChange={(e) => updateFilter(filter.id, filter.field, e.target.value)}
                            className="flex h-9 rounded-md border border-input bg-background px-3 text-sm"
                          >
                            <option value="all">All Values</option>
                            {fieldValues.map(value => (
                              <option key={value} value={value}>{value}</option>
                            ))}
                          </select>
                        </>
                      )}

                      <button
                        onClick={() => removeFilter(filter.id)}
                        className="flex h-9 w-9 items-center justify-center rounded-md border border-input bg-background text-sm hover:bg-destructive hover:text-destructive-foreground"
                        title="Remove filter"
                      >
                        ×
                      </button>
                    </div>
                  );
                })}

                {/* Add Filter Button */}
                {settings.globalFilters.allowMultiple && (
                  <button
                    onClick={addNewFilter}
                    className="flex h-9 items-center gap-2 rounded-md border border-dashed border-input bg-background px-3 text-sm hover:bg-accent"
                  >
                    <span>+ Add Filter</span>
                  </button>
                )}
              </div>

              {/* Date Filter and Actions */}
              <div className="flex flex-wrap items-center gap-4">
                {settings.globalFilters.dateFilter.enabled && (
                  <div className="flex items-center gap-2">
                    <label className="text-sm text-muted-foreground">Updated:</label>
                    <select
                      value={dateFilterRange}
                      onChange={(e) => setDateFilterRange(e.target.value)}
                      className="flex h-9 rounded-md border border-input bg-background px-3 text-sm"
                    >
                      <option value="all">All Time</option>
                      <option value="last-week">Last Week</option>
                      <option value="last-month">Last Month</option>
                      <option value="last-3-months">Last 3 Months</option>
                      <option value="last-year">Last Year</option>
                    </select>
                  </div>
                )}

                {hasActiveFilters && (
                  <>
                    <button
                      onClick={clearAllFilters}
                      className="rounded-md border border-input bg-background px-3 py-1.5 text-sm hover:bg-accent"
                    >
                      Clear All Filters
                    </button>
                    <span className="text-sm text-muted-foreground">
                      Showing {globallyFilteredIssues.length} of {issues.length} issues
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      <main className="container mx-auto p-6">
        {error && (
          <div className="mb-6 rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-destructive">
            {error}
          </div>
        )}

        <div className="space-y-6">
          {/* Stats Section */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {[
              { title: 'Total Issues', value: stats.totalIssues, color: 'text-blue-600' },
              { title: 'Open', value: stats.openIssues, color: 'text-yellow-600' },
              { title: 'In Progress', value: stats.inProgressIssues, color: 'text-purple-600' },
              { title: 'Resolved', value: stats.resolvedIssues, color: 'text-green-600' },
            ].map((stat) => (
              <Card key={stat.title}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    {stat.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className={`text-3xl font-bold ${stat.color}`}>
                    {loading ? '...' : stat.value}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Agile Boards Section */}
          {boards.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Agile Boards</CardTitle>
              </CardHeader>
              <CardContent>
                {boardsLoading ? (
                  <div className="flex h-32 items-center justify-center text-muted-foreground">
                    Loading agile boards...
                  </div>
                ) : boardsError ? (
                  <div className="text-sm text-destructive">{boardsError}</div>
                ) : (
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {boards.map((board) => {
                      const boardUrl = getAgileBoardUrl(board.id);

                      return (
                        <div
                          key={board.id}
                          className="rounded-lg border border-input bg-card p-4 hover:shadow-md transition-shadow"
                        >
                          <div className="flex items-start justify-between mb-2">
                            <h3 className="text-lg font-semibold">{board.name}</h3>
                            {boardUrl && (
                              <a
                                href={boardUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                                title="Open in YouTrack"
                              >
                                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                </svg>
                              </a>
                            )}
                          </div>

                          {board.owner && (
                            <p className="text-sm text-muted-foreground mb-2">
                              Owner: {board.owner.fullName}
                            </p>
                          )}

                          {board.projects && board.projects.length > 0 && (
                            <div className="flex flex-wrap gap-1 mb-3">
                              {board.projects.map((project) => (
                                <span
                                  key={project.id}
                                  className="inline-flex items-center rounded-md bg-blue-100 dark:bg-blue-900 px-2 py-1 text-xs font-medium text-blue-800 dark:text-blue-100"
                                >
                                  {project.shortName}
                                </span>
                              ))}
                            </div>
                          )}

                          {board.currentSprint && !board.sprintsSettings?.disableSprints && (
                            <div className="mt-3 pt-3 border-t border-border">
                              <p className="text-sm font-medium mb-1">Current Sprint:</p>
                              <p className="text-sm text-muted-foreground mb-1">{board.currentSprint.name}</p>
                              {board.currentSprint.goal && (
                                <p className="text-xs text-muted-foreground italic">{board.currentSprint.goal}</p>
                              )}
                              {board.currentSprint.start && board.currentSprint.finish && (
                                <div className="mt-2 text-xs text-muted-foreground">
                                  {new Date(board.currentSprint.start).toLocaleDateString()} - {new Date(board.currentSprint.finish).toLocaleDateString()}
                                </div>
                              )}
                            </div>
                          )}

                          {board.sprintsSettings?.disableSprints && (
                            <div className="mt-3 pt-3 border-t border-border">
                              <span className="inline-flex items-center rounded-md bg-gray-100 dark:bg-gray-800 px-2 py-1 text-xs font-medium text-gray-600 dark:text-gray-300">
                                Kanban Board
                              </span>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Charts Section */}
          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Completed Tasks Over Time</CardTitle>
              </CardHeader>
              <CardContent className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={completedTasksData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                      dataKey="date"
                      tickFormatter={(value) => new Date(value).toLocaleDateString()}
                    />
                    <YAxis />
                    <Tooltip
                      labelFormatter={(value) => new Date(value).toLocaleDateString()}
                    />
                    <Line
                      type="monotone"
                      dataKey="count"
                      stroke={CHART_COLORS[0]}
                      strokeWidth={2}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Issues by Status</CardTitle>
              </CardHeader>
              <CardContent className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={statusChartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="label" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                      {statusChartData.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Matrix Chart Section */}
          <Card>
            <CardHeader>
              <CardTitle>Issue Matrix</CardTitle>
              <div className="mt-2 flex flex-wrap gap-4">
                <div className="flex items-center gap-2">
                  <label className="text-sm text-muted-foreground">Rows (Y-axis):</label>
                  <select
                    value={matrixYField}
                    onChange={(e) => setMatrixYField(e.target.value)}
                    className="flex h-9 rounded-md border border-input bg-background px-3 text-sm"
                  >
                    {availableCustomFields.map(field => (
                      <option key={field} value={field}>{field}</option>
                    ))}
                  </select>
                </div>
                <div className="flex items-center gap-2">
                  <label className="text-sm text-muted-foreground">Columns (X-axis):</label>
                  <select
                    value={matrixXField}
                    onChange={(e) => setMatrixXField(e.target.value)}
                    className="flex h-9 rounded-md border border-input bg-background px-3 text-sm"
                  >
                    {availableCustomFields.map(field => (
                      <option key={field} value={field}>{field}</option>
                    ))}
                  </select>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <IssueMatrixChart issues={globallyFilteredIssues} xField={matrixXField} yField={matrixYField} />
            </CardContent>
          </Card>

          {/* Issues List Section */}
          <Card>
            <CardHeader>
              <CardTitle>Issues</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Filters */}
              <div className="flex flex-col gap-4 md:flex-row md:items-center">
                <input
                  type="text"
                  placeholder="Search issues..."
                  value={filters.search || ''}
                  onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background md:w-64"
                />

                <select
                  value={filters.status?.[0] || 'all'}
                  onChange={(e) =>
                    setFilters({ ...filters, status: e.target.value === 'all' ? undefined : [e.target.value] })
                  }
                  className="flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm md:w-40"
                >
                  <option value="all">All Statuses</option>
                  {availableStatuses.map(status => (
                    <option key={status} value={status}>{status}</option>
                  ))}
                </select>

                <button
                  onClick={() => setFilters({})}
                  className="rounded-md border border-input bg-background px-4 py-2 text-sm hover:bg-accent"
                >
                  Clear Filters
                </button>
              </div>

              {/* Issues Table */}
              {loading ? (
                <div className="flex h-32 items-center justify-center text-muted-foreground">
                  Loading issues...
                </div>
              ) : filteredIssues.length === 0 ? (
                <div className="flex h-32 items-center justify-center text-muted-foreground">
                  No issues found
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="p-2 text-left text-sm font-medium">ID</th>
                        <th className="p-2 text-left text-sm font-medium">Summary</th>
                        <th className="p-2 text-left text-sm font-medium">Status</th>
                        <th className="p-2 text-left text-sm font-medium">Reporter</th>
                        <th className="p-2 text-left text-sm font-medium">Updated</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredIssues.map((issue) => {
                        const stateField = issue.customFields?.find(f => f.name === 'State');
                        const status = (stateField?.value as any)?.name || 'Unknown';
                        const issueUrl = getIssueUrl(issue.idReadable);

                        return (
                          <tr key={issue.id} className="border-b hover:bg-muted/50">
                            <td className="p-2 text-sm font-mono">
                              {issueUrl ? (
                                <a
                                  href={issueUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 hover:underline"
                                >
                                  {issue.idReadable}
                                </a>
                              ) : (
                                issue.idReadable
                              )}
                            </td>
                            <td className="p-2 text-sm font-medium">{issue.summary}</td>
                            <td className="p-2 text-sm">
                              <span className="inline-flex items-center rounded-md bg-blue-100 px-2 py-1 text-xs font-medium text-blue-800 dark:bg-blue-900 dark:text-blue-100">
                                {status}
                              </span>
                            </td>
                            <td className="p-2 text-sm">{issue.reporter.fullName}</td>
                            <td className="p-2 text-sm">
                              {new Date(issue.updated).toLocaleDateString()}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}

export default App;
