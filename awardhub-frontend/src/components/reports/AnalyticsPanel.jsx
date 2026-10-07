import React, { useEffect, useMemo, useState, useCallback } from 'react';
import { Plus, Trash2, Activity, Hash, TrendingUp } from 'lucide-react';
import toast from 'react-hot-toast';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from 'recharts';
import { analyticsApi } from '../../api/reports';
import Card from '../ui/Card';
import Button from '../ui/Button';
import DataTable from '../ui/DataTable';
import Modal from '../ui/Modal';
import ConfirmDialog from '../ui/ConfirmDialog';
import StatCard from '../ui/StatCard';
import { formatDateTime, formatNumber } from '../../utils/formatters';
import { unwrapList } from '../../utils/reportHelpers';
import styles from './reports.module.css';
import { useChartPalette, chartTooltipStyle } from '../../utils/chartPalette';

const EMPTY_FORM = { metricName: '', metricValue: '', categoryId: '' };

/**
 * Analytics snapshots: covers every /api/analytics endpoint
 * (getAll, getByMetric, getByCategory, record, delete).
 */
export default function AnalyticsPanel({ categories = [], categoryMap = {} }) {
  const palette = useChartPalette();
  const [snapshots, setSnapshots] = useState([]);
  const [allMetricNames, setAllMetricNames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [metricFilter, setMetricFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');

  const [recordOpen, setRecordOpen] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  const [toDelete, setToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      let list;
      if (metricFilter) {
        list = unwrapList(await analyticsApi.getByMetric(encodeURIComponent(metricFilter)));
        if (categoryFilter) list = list.filter((s) => String(s.categoryId) === String(categoryFilter));
      } else if (categoryFilter) {
        list = unwrapList(await analyticsApi.getByCategory(categoryFilter));
      } else {
        list = unwrapList(await analyticsApi.getAll());
        setAllMetricNames([...new Set(list.map((s) => s.metricName))].sort());
      }
      setSnapshots(list);
    } catch (err) {
      toast.error(err.message || 'Failed to load analytics');
      setSnapshots([]);
    } finally {
      setLoading(false);
    }
  }, [metricFilter, categoryFilter]);

  useEffect(() => {
    load();
  }, [load]);

  /* Pivot snapshots into recharts rows: { t, label, [metricName]: value } */
  const { chartData, chartMetrics } = useMemo(() => {
    const sorted = [...snapshots].sort((a, b) => new Date(a.capturedAt) - new Date(b.capturedAt));
    const metrics = [...new Set(sorted.map((s) => s.metricName))];
    const rows = sorted.map((s) => ({
      t: s.capturedAt,
      label: formatDateTime(s.capturedAt),
      [s.metricName]: s.metricValue,
    }));
    return { chartData: rows, chartMetrics: metrics };
  }, [snapshots]);

  const latest = useMemo(() => {
    if (!snapshots.length) return null;
    return [...snapshots].sort((a, b) => new Date(b.capturedAt) - new Date(a.capturedAt))[0];
  }, [snapshots]);

  const handleRecord = async (e) => {
    e?.preventDefault();
    const name = form.metricName.trim();
    const value = Number(form.metricValue);
    if (!name) return toast.error('Metric name is required');
    if (form.metricValue === '' || Number.isNaN(value)) return toast.error('Metric value must be a number');

    setSaving(true);
    try {
      await analyticsApi.record({
        metricName: name,
        metricValue: value,
        categoryId: form.categoryId ? Number(form.categoryId) : null,
      });
      toast.success('Snapshot recorded');
      setRecordOpen(false);
      setForm(EMPTY_FORM);
      if (!allMetricNames.includes(name)) setAllMetricNames((m) => [...m, name].sort());
      load();
    } catch (err) {
      toast.error(err.message || 'Failed to record snapshot');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!toDelete) return;
    setDeleting(true);
    try {
      await analyticsApi.delete(toDelete.id);
      toast.success('Snapshot deleted');
      setToDelete(null);
      load();
    } catch (err) {
      toast.error(err.message || 'Failed to delete snapshot');
    } finally {
      setDeleting(false);
    }
  };

  const columns = [
    {
      key: 'metricName',
      label: 'Metric',
      render: (v) => <span className={styles.cellTitle}>{v}</span>,
    },
    {
      key: 'metricValue',
      label: 'Value',
      render: (v) => <span style={{ fontVariantNumeric: 'tabular-nums' }}>{formatNumber(v)}</span>,
    },
    {
      key: 'categoryId',
      label: 'Category',
      render: (v) => (v ? categoryMap[v] || `#${v}` : 'Global'),
    },
    { key: 'capturedAt', label: 'Captured', render: (v) => formatDateTime(v) },
    {
      key: 'actions',
      label: '',
      sortable: false,
      render: (_, row) => (
        <Button
          id={`analytics-delete-${row.id}`}
          size="sm"
          variant="ghost"
          icon={Trash2}
          onClick={() => setToDelete(row)}
          aria-label="Delete snapshot"
        >
          Delete
        </Button>
      ),
    },
  ];

  return (
    <div className={styles.page}>
      <div className={styles.statsRow}>
        <StatCard title="Snapshots" value={snapshots.length} icon={Hash} accent="indigo" subtitle="in current view" />
        <StatCard
          title="Distinct metrics"
          value={chartMetrics.length}
          icon={Activity}
          accent="green"
          subtitle="in current view"
        />
        <StatCard
          title="Latest reading"
          value={latest ? formatNumber(latest.metricValue) : '—'}
          icon={TrendingUp}
          accent="amber"
          subtitle={latest ? `${latest.metricName} · ${formatDateTime(latest.capturedAt)}` : 'No data'}
        />
      </div>

      <Card
        title="Metric trends"
        subtitle="Time-series of recorded analytics snapshots"
        actions={
          <Button id="analytics-record-btn" variant="primary" icon={Plus} onClick={() => setRecordOpen(true)}>
            Record snapshot
          </Button>
        }
      >
        <div className={styles.grid2} style={{ marginBottom: '1rem' }}>
          <div>
            <label className={styles.label} htmlFor="analytics-metric-filter">Metric</label>
            <select
              id="analytics-metric-filter"
              className={styles.select}
              value={metricFilter}
              onChange={(e) => setMetricFilter(e.target.value)}
            >
              <option value="">All metrics</option>
              {allMetricNames.map((m) => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
          </div>
          <div>
            <label className={styles.label} htmlFor="analytics-category-filter">Category</label>
            <select
              id="analytics-category-filter"
              className={styles.select}
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
            >
              <option value="">All categories</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{categoryMap[c.id]}</option>
              ))}
            </select>
          </div>
        </div>

        {chartData.length === 0 ? (
          <p className={styles.hint} style={{ textAlign: 'center', padding: '3rem 0' }}>
            No snapshots to chart. Record one to get started.
          </p>
        ) : (
          <div className={styles.chartWrap}>
            <ResponsiveContainer>
              <LineChart data={chartData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={palette.grid} vertical={false} />
                <XAxis dataKey="label" tick={{ fontSize: 11, fill: palette.axis }} stroke={palette.grid} minTickGap={24} />
                <YAxis tick={{ fontSize: 11, fill: palette.axis }} stroke={palette.grid} />
                <Tooltip contentStyle={{ ...chartTooltipStyle, fontSize: 12 }} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                {chartMetrics.map((m, i) => (
                  <Line
                    key={m}
                    type="monotone"
                    dataKey={m}
                    stroke={palette.series[i % palette.series.length]}
                    strokeWidth={2.5}
                    dot={{ r: 3 }}
                    activeDot={{ r: 6 }}
                    connectNulls
                    isAnimationActive
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </Card>

      <Card padding="none">
        <DataTable
          columns={columns}
          data={snapshots}
          loading={loading}
          emptyMessage="No analytics snapshots"
          emptyDescription="Use 'Record snapshot' to capture a metric value."
        />
      </Card>

      <Modal
        isOpen={recordOpen}
        onClose={() => setRecordOpen(false)}
        title="Record analytics snapshot"
        subtitle="Captured timestamp is set by the server"
        footer={
          <>
            <Button variant="secondary" onClick={() => setRecordOpen(false)}>Cancel</Button>
            <Button id="analytics-record-submit" variant="primary" onClick={handleRecord} loading={saving}>
              Record
            </Button>
          </>
        }
      >
        <form className={styles.form} onSubmit={handleRecord}>
          <div>
            <label className={styles.label} htmlFor="analytics-metric-name">Metric name *</label>
            <input
              id="analytics-metric-name"
              className={styles.input}
              list="analytics-metric-suggestions"
              value={form.metricName}
              onChange={(e) => setForm({ ...form, metricName: e.target.value })}
              placeholder="e.g. total_votes"
              required
            />
            <datalist id="analytics-metric-suggestions">
              {allMetricNames.map((m) => <option key={m} value={m} />)}
            </datalist>
          </div>
          <div className={styles.grid2}>
            <div>
              <label className={styles.label} htmlFor="analytics-metric-value">Value *</label>
              <input
                id="analytics-metric-value"
                className={styles.input}
                type="number"
                step="any"
                value={form.metricValue}
                onChange={(e) => setForm({ ...form, metricValue: e.target.value })}
                required
              />
            </div>
            <div>
              <label className={styles.label} htmlFor="analytics-metric-category">Category</label>
              <select
                id="analytics-metric-category"
                className={styles.select}
                value={form.categoryId}
                onChange={(e) => setForm({ ...form, categoryId: e.target.value })}
              >
                <option value="">Global (no category)</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>{categoryMap[c.id]}</option>
                ))}
              </select>
            </div>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={!!toDelete}
        onClose={() => setToDelete(null)}
        onConfirm={handleDelete}
        loading={deleting}
        title="Delete snapshot"
        message={toDelete ? `Delete "${toDelete.metricName}" = ${toDelete.metricValue}? This cannot be undone.` : ''}
        confirmText="Delete"
      />
    </div>
  );
}
