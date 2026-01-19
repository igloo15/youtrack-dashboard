import { useMemo } from 'react';
import { Issue } from '@/types/youtrack';

interface IssueMatrixChartProps {
  issues: Issue[];
  xField?: string;
  yField?: string;
}

export function IssueMatrixChart({
  issues,
  xField = 'State',
  yField = 'Priority'
}: IssueMatrixChartProps) {
  const matrixData = useMemo(() => {
    // Get unique values for both fields
    const xValues = new Set<string>();
    const yValues = new Set<string>();

    issues.forEach(issue => {
      const xFieldData = issue.customFields?.find(f => f.name === xField);
      const yFieldData = issue.customFields?.find(f => f.name === yField);

      if (xFieldData?.value && typeof xFieldData.value === 'object' && 'name' in xFieldData.value) {
        xValues.add(xFieldData.value.name as string);
      }
      if (yFieldData?.value && typeof yFieldData.value === 'object' && 'name' in yFieldData.value) {
        yValues.add(yFieldData.value.name as string);
      }
    });

    const xArray = Array.from(xValues).sort();
    const yArray = Array.from(yValues).sort();

    // Build the matrix
    const matrix: { [key: string]: { [key: string]: number } } = {};

    yArray.forEach(y => {
      matrix[y] = {};
      xArray.forEach(x => {
        matrix[y][x] = 0;
      });
    });

    // Count issues in each cell
    issues.forEach(issue => {
      const xFieldData = issue.customFields?.find(f => f.name === xField);
      const yFieldData = issue.customFields?.find(f => f.name === yField);

      const xValue = (xFieldData?.value && typeof xFieldData.value === 'object' && 'name' in xFieldData.value)
        ? xFieldData.value.name as string
        : null;
      const yValue = (yFieldData?.value && typeof yFieldData.value === 'object' && 'name' in yFieldData.value)
        ? yFieldData.value.name as string
        : null;

      if (xValue && yValue && matrix[yValue]?.[xValue] !== undefined) {
        matrix[yValue][xValue]++;
      }
    });

    return { xArray, yArray, matrix };
  }, [issues, xField, yField]);

  const getColorIntensity = (count: number, max: number) => {
    if (count === 0) return 'bg-gray-50 dark:bg-gray-900';
    const intensity = Math.ceil((count / max) * 5);

    const colors = [
      'bg-blue-100 dark:bg-blue-950',
      'bg-blue-200 dark:bg-blue-900',
      'bg-blue-300 dark:bg-blue-800',
      'bg-blue-400 dark:bg-blue-700',
      'bg-blue-500 dark:bg-blue-600',
      'bg-blue-600 dark:bg-blue-500',
    ];

    return colors[Math.min(intensity, colors.length - 1)];
  };

  const maxCount = Math.max(
    ...Object.values(matrixData.matrix).flatMap(row => Object.values(row))
  );

  if (matrixData.xArray.length === 0 || matrixData.yArray.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center text-muted-foreground">
        No data available for matrix visualization
      </div>
    );
  }

  return (
    <>
      <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr>
                <th className="border border-border bg-muted p-2 text-left text-sm font-medium">
                  {yField} \ {xField}
                </th>
                {matrixData.xArray.map(x => (
                  <th
                    key={x}
                    className="border border-border bg-muted p-2 text-center text-sm font-medium"
                  >
                    {x}
                  </th>
                ))}
                <th className="border border-border bg-muted p-2 text-center text-sm font-medium">
                  Total
                </th>
              </tr>
            </thead>
            <tbody>
              {matrixData.yArray.map(y => {
                const rowTotal = Object.values(matrixData.matrix[y]).reduce((a, b) => a + b, 0);
                return (
                  <tr key={y}>
                    <td className="border border-border bg-muted p-2 text-sm font-medium">
                      {y}
                    </td>
                    {matrixData.xArray.map(x => {
                      const count = matrixData.matrix[y][x];
                      return (
                        <td
                          key={`${y}-${x}`}
                          className={`border border-border p-2 text-center transition-colors ${getColorIntensity(count, maxCount)}`}
                        >
                          <span className={`text-sm font-semibold ${count > maxCount / 2 ? 'text-white' : 'text-gray-900 dark:text-gray-100'}`}>
                            {count > 0 ? count : '—'}
                          </span>
                        </td>
                      );
                    })}
                    <td className="border border-border bg-muted p-2 text-center text-sm font-semibold">
                      {rowTotal}
                    </td>
                  </tr>
                );
              })}
              <tr>
                <td className="border border-border bg-muted p-2 text-sm font-medium">
                  Total
                </td>
                {matrixData.xArray.map(x => {
                  const colTotal = matrixData.yArray.reduce(
                    (sum, y) => sum + matrixData.matrix[y][x],
                    0
                  );
                  return (
                    <td
                      key={`total-${x}`}
                      className="border border-border bg-muted p-2 text-center text-sm font-semibold"
                    >
                      {colTotal}
                    </td>
                  );
                })}
                <td className="border border-border bg-muted p-2 text-center text-sm font-semibold">
                  {issues.length}
                </td>
              </tr>
            </tbody>
          </table>

          {/* Legend */}
          <div className="mt-4 flex items-center justify-center gap-2 text-xs text-muted-foreground">
            <span>Intensity:</span>
            <div className="flex gap-1">
              <div className="h-4 w-4 rounded bg-gray-50 dark:bg-gray-900 border border-border" title="0 issues" />
              <div className="h-4 w-4 rounded bg-blue-100 dark:bg-blue-950 border border-border" title="Low" />
              <div className="h-4 w-4 rounded bg-blue-300 dark:bg-blue-800 border border-border" title="Medium" />
              <div className="h-4 w-4 rounded bg-blue-500 dark:bg-blue-600 border border-border" title="High" />
              <div className="h-4 w-4 rounded bg-blue-600 dark:bg-blue-500 border border-border" title="Very High" />
            </div>
        </div>
      </div>
    </>
  );
}
