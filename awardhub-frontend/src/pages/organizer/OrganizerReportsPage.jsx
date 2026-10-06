import React, { useState, useEffect } from 'react';
import { Download, Plus } from 'lucide-react';
import toast from 'react-hot-toast';
import { reportsApi } from '../../api/reports';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import DataTable from '../../components/ui/DataTable';
import StatusBadge from '../../components/ui/StatusBadge';
import Modal from '../../components/ui/Modal';
import { formatDate } from '../../utils/formatters';

export default function OrganizerReportsPage() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [generateModalOpen, setGenerateModalOpen] = useState(false);
  const [form, setForm] = useState({
    title: '',
    reportType: 'FINAL_RESULTS',
    format: 'PDF',
    roleScope: 'ORGANIZER',
  });
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    loadReports();
  }, []);

  const loadReports = async () => {
    setLoading(true);
    try {
      const res = await reportsApi.getAll();
      const list = res?.data || (Array.isArray(res) ? res : []);
      setReports(list);
    } catch (err) {
      setReports([]);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerate = async (e) => {
    e.preventDefault();
    if (!form.title) {
      toast.error('Report Title is required');
      return;
    }
    setGenerating(true);
    try {
      await reportsApi.generate(form);
      toast.success('Report successfully generated and stored in database!');
      setGenerateModalOpen(false);
      setForm({ title: '', reportType: 'FINAL_RESULTS', format: 'PDF', roleScope: 'ORGANIZER' });
      loadReports();
    } catch (err) {
      toast.error(err.message || 'Report generation failed');
    } finally {
      setGenerating(false);
    }
  };

  const handleDownload = (report) => {
    toast.success(`Preparing ${report.title || 'report'} for download...`);
  };

  const columns = [
    {
      key: 'title',
      label: 'Report Document',
      render: (val, row) => (
        <div>
          <span style={{ fontWeight: 600 }}>{val || row.reportType || 'Award Report'}</span>
          <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            Type: {row.type || row.reportType || 'GENERAL'} • Format: {row.format || 'PDF'}
          </span>
        </div>
      ),
    },
    {
      key: 'generatedAt',
      label: 'Generated At',
      render: (val, row) => formatDate(val || row.createdAt),
    },
    {
      key: 'status',
      label: 'Database Status',
      render: (val) => <StatusBadge status={val || 'COMPLETED'} />,
    },
    {
      key: 'actions',
      label: 'Action',
      sortable: false,
      render: (_, row) => (
        <Button
          size="sm"
          variant="outline"
          icon={Download}
          onClick={() => handleDownload(row)}
        >
          Download
        </Button>
      ),
    },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem',
        }}
      >
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 700, margin: 0 }}>
            Reports & Analytics Exports
          </h1>
          <p style={{ color: 'var(--text-muted)', margin: '0.25rem 0 0 0', fontSize: '0.875rem' }}>
            Generate and download reports queried from the MS SQL database
          </p>
        </div>
        <Button variant="primary" icon={Plus} onClick={() => setGenerateModalOpen(true)}>
          Generate Report
        </Button>
      </div>

      <Card padding="none">
        <DataTable
          columns={columns}
          data={reports}
          loading={loading}
          emptyMessage="No reports found in database"
          emptyDescription="Click 'Generate Report' to synthesize your first summary document from current database records."
        />
      </Card>

      <Modal
        isOpen={generateModalOpen}
        onClose={() => setGenerateModalOpen(false)}
        title="Generate New Report"
        subtitle="Select dataset type, format, and role scope"
        footer={
          <>
            <Button variant="secondary" onClick={() => setGenerateModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleGenerate} loading={generating}>
              Synthesize Report
            </Button>
          </>
        }
      >
        <form onSubmit={handleGenerate} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, marginBottom: '0.4rem' }}>
              Report Title *
            </label>
            <input
              type="text"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="e.g. Q4 Executive Voting Audit Summary"
              style={{
                width: '100%',
                padding: '0.65rem 1rem',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-color)',
                background: 'var(--bg-input)',
                color: 'var(--text-primary)',
                fontSize: '0.875rem',
                outline: 'none',
              }}
              required
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, marginBottom: '0.4rem' }}>
                Report Dataset Type
              </label>
              <select
                value={form.reportType}
                onChange={(e) => setForm({ ...form, reportType: e.target.value })}
                style={{
                  width: '100%',
                  padding: '0.65rem 1rem',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-color)',
                  background: 'var(--bg-input)',
                  color: 'var(--text-primary)',
                  fontSize: '0.875rem',
                  outline: 'none',
                }}
              >
                <option value="FINAL_RESULTS">Final Award Results & Rankings</option>
                <option value="VOTE_AUDIT">Ballot Audit & Verification Trail</option>
                <option value="JUDGE_SCORES">Judge Rubric Scores Breakdown</option>
                <option value="NOMINEE_DOSSIERS">Nominee Dossiers & Documentation</option>
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, marginBottom: '0.4rem' }}>
                Export File Format
              </label>
              <select
                value={form.format}
                onChange={(e) => setForm({ ...form, format: e.target.value })}
                style={{
                  width: '100%',
                  padding: '0.65rem 1rem',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-color)',
                  background: 'var(--bg-input)',
                  color: 'var(--text-primary)',
                  fontSize: '0.875rem',
                  outline: 'none',
                }}
              >
                <option value="PDF">PDF (Formatted Executive Document)</option>
                <option value="CSV">CSV (Raw Tabular Spreadsheet)</option>
                <option value="JSON">JSON (Cryptographic Audit Schema)</option>
              </select>
            </div>
          </div>
        </form>
      </Modal>
    </div>
  );
}
