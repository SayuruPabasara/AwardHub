import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Eye, Download } from 'lucide-react';
import toast from 'react-hot-toast';
import { reportsApi, ROLE_REPORT_TYPE } from '../../api/reports';
import { categoriesApi } from '../../api/categories';
import { useAuth } from '../../hooks/useAuth';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import DataTable from '../../components/ui/DataTable';
import ReportViewModal from '../../components/reports/ReportViewModal';
import { formatDateTime } from '../../utils/formatters';
import { unwrapList, humanize, buildCategoryMap, downloadReport } from '../../utils/reportHelpers';
import styles from '../../components/reports/reports.module.css';

/**
 * Read-only reports for JUDGE / VOTER / NOMINEE.
 * Uses GET /api/reports/role/{role}; the backend decides which types are visible.
 */
export default function RoleReportsPage() {
  const { user } = useAuth();
  const role = user?.role;
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewing, setViewing] = useState(null);
  const [categories, setCategories] = useState([]);
  const categoryMap = useMemo(() => buildCategoryMap(categories), [categories]);

  useEffect(() => {
    categoriesApi
      .listPublic()
      .then((res) => setCategories(unwrapList(res)))
      .catch(() => setCategories([]));
  }, []);

  const load = useCallback(async () => {
    if (!role) return;
    setLoading(true);
    try {
      const list = unwrapList(await reportsApi.getForRole(role))
        .filter((r) => !r.archived)
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      setReports(list);
    } catch (err) {
      toast.error(err.message || 'Failed to load reports');
      setReports([]);
    } finally {
      setLoading(false);
    }
  }, [role]);

  useEffect(() => {
    load();
  }, [load]);

  const scope = ROLE_REPORT_TYPE[role];

  const columns = [
    {
      key: 'reportType',
      label: 'Report',
      render: (val, row) => (
        <div>
          <span className={styles.cellTitle}>
            {humanize(val)} report <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>#{row.id}</span>
          </span>
          <span className={styles.cellSub}>
            {row.categoryId ? categoryMap[row.categoryId] || `Category #${row.categoryId}` : 'All categories'}
          </span>
        </div>
      ),
    },
    { key: 'format', label: 'Format', render: (v) => v || '—' },
    { key: 'createdAt', label: 'Published', render: (v) => formatDateTime(v) },
    {
      key: 'actions',
      label: 'Actions',
      sortable: false,
      render: (_, row) => (
        <div className={styles.rowActions}>
          <Button id={`role-report-view-${row.id}`} size="sm" variant="ghost" icon={Eye} onClick={() => setViewing(row)}>
            View
          </Button>
          <Button
            id={`role-report-download-${row.id}`}
            size="sm"
            variant="outline"
            icon={Download}
            onClick={() => downloadReport(row, categoryMap[row.categoryId])}
          >
            Download
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}>Reports</h1>
          <p className={styles.pageSubtitle}>
            {scope
              ? `${humanize(scope)} reports published by the award committee`
              : 'Reports available to your role'}
          </p>
        </div>
      </div>

      <Card padding="none">
        <DataTable
          columns={columns}
          data={reports}
          loading={loading}
          emptyMessage="No reports available"
          emptyDescription="Reports relevant to your role will appear here once published."
        />
      </Card>

      <ReportViewModal
        report={viewing}
        categoryName={viewing ? categoryMap[viewing.categoryId] : undefined}
        onClose={() => setViewing(null)}
      />
    </div>
  );
}
