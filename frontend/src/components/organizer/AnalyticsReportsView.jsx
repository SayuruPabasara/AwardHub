import React, { useState } from 'react';
import { useAwardHub } from '../../context/AwardHubContext';
import StatCard from '../common/StatCard';
import { 
  BarChart3, 
  Download, 
  FileSpreadsheet, 
  TrendingUp, 
  Users, 
  Vote, 
  Award,
  Archive,
  Trash2,
  Camera,
  RefreshCw,
  FileText,
  CheckCircle2,
  Eye
} from 'lucide-react';
import { formatDateTime } from '../../utils/formatters';

export default function AnalyticsReportsView() {
  const { 
    categories, 
    nominations, 
    votes, 
    judgeScores, 
    users, 
    showToast,
    reports,
    generateReport,
    archiveReport,
    deleteReport,
    loadReports,
    analyticsSnapshots,
    recordAnalyticsSnapshot,
    deleteAnalyticsSnapshot,
    loadAnalyticsSnapshots,
    currentUser
  } = useAwardHub();

  const [selectedReportType, setSelectedReportType] = useState('VOTING');
  const [selectedFormat, setSelectedFormat] = useState('CSV');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isCapturing, setIsCapturing] = useState(false);
  const [viewingContent, setViewingContent] = useState(null);

  const totalVoters = new Set(votes.map((v) => v.voterNIC)).size;
  const totalApproved = nominations.filter((n) => n.status === 'Approved').length;
  const qualRate = nominations.length > 0 ? Math.round((totalApproved / nominations.length) * 100) : 0;

  // Generate Report Content Helper
  const buildReportContent = (type) => {
    let content = '';
    if (type === 'NOMINATION') {
      content += 'ID,Category,Title,Nominee,Status,PublicVotes,SubmittedAt\n';
      nominations.forEach((n) => {
        content += `"${n.anonymousId}","${n.categoryName}","${n.title}","${n.nomineeName}","${n.status}","${n.stats?.publicVotes || 0}","${n.submittedAt || ''}"\n`;
      });
    } else if (type === 'VOTING') {
      content += 'VoteID,CategoryID,NomineeID,VoterNIC,VoterEmail,CastAt,IPAddress\n';
      votes.forEach((v) => {
        content += `"${v.id}","${v.categoryId}","${v.nomineeId}","${v.voterNIC}","${v.voterEmail}","${v.castAt}","${v.ipAddress}"\n`;
      });
    } else if (type === 'EVALUATION') {
      content += 'ScoreID,NominationID,JudgeName,WeightedScore,SubmittedAt\n';
      judgeScores.forEach((s) => {
        content += `"${s.id}","${s.nominationId}","${s.judgeName || 'Judge'}","${s.weightedScore}","${s.submittedAt}"\n`;
      });
    } else if (type === 'WINNER') {
      content += 'CategoryCode,CategoryName,WinnerID,Status,TotalNominations\n';
      categories.forEach((c) => {
        content += `"${c.code}","${c.name}","${c.winnerId || 'Pending'}","${c.status}","${nominations.filter((n) => n.categoryId === c.id).length}"\n`;
      });
    } else {
      // Full summary / Participation
      content += 'CategoryCode,CategoryName,Status,EvaluationMode,NominationsCount,ApprovedCount,TotalVotes\n';
      categories.forEach((c) => {
        const catNoms = nominations.filter((n) => n.categoryId === c.id);
        const catApproved = catNoms.filter((n) => n.status === 'Approved');
        const catVotes = votes.filter((v) => v.categoryId === c.id);
        content += `"${c.code}","${c.name}","${c.status}","${c.evaluationMode}","${catNoms.length}","${catApproved.length}","${catVotes.length}"\n`;
      });
    }
    return content;
  };

  // Generate & Save Report via Backend API
  const handleGenerateAndSave = async () => {
    try {
      setIsGenerating(true);
      const content = buildReportContent(selectedReportType);

      // Save to backend Spring Boot API
      await generateReport({
        reportType: selectedReportType,
        format: selectedFormat,
        content: content.slice(0, 9500),
        generatedBy: currentUser?.name || 'Administrator'
      });

      // Also trigger browser file download for immediate convenience
      const encodedUri = encodeURI(`data:text/csv;charset=utf-8,${content}`);
      const link = document.createElement('a');
      link.setAttribute('href', encodedUri);
      link.setAttribute('download', `AwardHub_Report_${selectedReportType}_2026.${selectedFormat.toLowerCase()}`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (e) {
      // Handled in context toast
    } finally {
      setIsGenerating(false);
    }
  };

  // Capture Live Analytics Snapshot via Backend API
  const handleCaptureSnapshot = async () => {
    try {
      setIsCapturing(true);
      await recordAnalyticsSnapshot({
        metricName: 'Voter Turnout (Unique NICs)',
        metricValue: totalVoters
      });
      await recordAnalyticsSnapshot({
        metricName: 'Nomination Qualification Rate (%)',
        metricValue: qualRate
      });
      await recordAnalyticsSnapshot({
        metricName: 'Judge Evaluations Submitted',
        metricValue: judgeScores.length
      });
      await recordAnalyticsSnapshot({
        metricName: 'Active Registered Stakeholders',
        metricValue: users.length
      });
      showToast('Captured live metrics snapshot to backend database!', 'success');
    } catch (e) {
      // Handled in context toast
    } finally {
      setIsCapturing(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-colors duration-200">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Reporting, Analytics & Governance Metrics</h3>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
              Spring Boot API Bound
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Monitor real-time participation, generate and archive auditable reports (`/api/reports`), and persist metrics (`/api/analytics`).
          </p>
        </div>

        {/* Report Generator Controls */}
        <div className="flex flex-wrap items-center gap-2">
          <select
            value={selectedReportType}
            onChange={(e) => setSelectedReportType(e.target.value)}
            className="text-xs rounded-lg border border-slate-300 dark:border-slate-700 px-3 py-2 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          >
            <option value="VOTING">Voting Ballots Report</option>
            <option value="NOMINATION">Nominations Roster</option>
            <option value="EVALUATION">Judge Evaluations Report</option>
            <option value="WINNER">Winners & Standings Report</option>
            <option value="PARTICIPATION">Full Category Summary</option>
          </select>

          <select
            value={selectedFormat}
            onChange={(e) => setSelectedFormat(e.target.value)}
            className="text-xs rounded-lg border border-slate-300 dark:border-slate-700 px-2.5 py-2 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          >
            <option value="CSV">CSV</option>
            <option value="PDF">PDF</option>
            <option value="EXCEL">EXCEL</option>
          </select>

          <button
            onClick={handleGenerateAndSave}
            disabled={isGenerating}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-indigo-600 text-white text-xs font-bold hover:bg-indigo-700 disabled:opacity-50 shadow-xs transition-colors whitespace-nowrap"
          >
            <Download className="w-4 h-4" />
            {isGenerating ? 'Generating...' : 'Generate & Save'}
          </button>
        </div>
      </div>

      {/* Analytics KPI Row + Capture Button */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
            <BarChart3 className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            Live Key Performance Indicators
          </h4>
          <button
            onClick={handleCaptureSnapshot}
            disabled={isCapturing}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
          >
            <Camera className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
            {isCapturing ? 'Saving Snapshot...' : 'Capture KPI Snapshot to DB'}
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Voter Turnout"
            value={totalVoters}
            subtitle="Unique verified voters by NIC"
            icon={Vote}
            color="blue"
            trend="+18% vs 2025"
          />
          <StatCard
            title="Qualification Rate"
            value={`${qualRate}%`}
            subtitle={`${totalApproved} of ${nominations.length} approved`}
            icon={Award}
            color="emerald"
          />
          <StatCard
            title="Judge Participation"
            value={`${judgeScores.length} evals`}
            subtitle="Submitted across rubric criteria"
            icon={TrendingUp}
            color="purple"
          />
          <StatCard
            title="Registered Stakeholders"
            value={users.length}
            subtitle="Admins, Organizers, Judges & Nominees"
            icon={Users}
            color="amber"
          />
        </div>
      </div>

      {/* Historical Analytics Snapshots from Database */}
      {analyticsSnapshots.length > 0 && (
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs p-5 transition-colors duration-200">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <Camera className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              Persisted Analytics Snapshots (`/api/analytics`)
            </h4>
            <span className="text-[11px] text-slate-400">{analyticsSnapshots.length} Snapshots Stored</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-slate-200 dark:border-slate-800 text-slate-400 text-[10px] uppercase">
                <tr>
                  <th className="pb-2 font-semibold">Snapshot ID</th>
                  <th className="pb-2 font-semibold">Metric Name</th>
                  <th className="pb-2 font-semibold">Value</th>
                  <th className="pb-2 font-semibold">Captured At</th>
                  <th className="pb-2 font-semibold text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                {analyticsSnapshots.slice(0, 8).map((snap) => (
                  <tr key={snap.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                    <td className="py-2.5 font-mono text-slate-500">#{snap.id}</td>
                    <td className="py-2.5 font-semibold text-slate-900 dark:text-white">{snap.metricName}</td>
                    <td className="py-2.5 font-bold text-indigo-600 dark:text-indigo-400">{snap.metricValue}</td>
                    <td className="py-2.5 text-slate-400">{formatDateTime(snap.capturedAt)}</td>
                    <td className="py-2.5 text-right">
                      <button
                        onClick={() => deleteAnalyticsSnapshot(snap.id)}
                        className="text-rose-600 hover:text-rose-800 dark:hover:text-rose-400 p-1"
                        title="Delete snapshot from database"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Generated Reports Archive from Database */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs p-5 transition-colors duration-200">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <FileSpreadsheet className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              Generated Reports Database Archive (`/api/reports`)
            </h4>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Auditable records stored in MySQL and accessible to authorized stakeholders.
            </p>
          </div>
          <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
            {reports.length} Reports
          </span>
        </div>

        {reports.length === 0 ? (
          <div className="p-8 text-center border border-dashed border-slate-200 dark:border-slate-800 rounded-xl">
            <FileText className="w-8 h-8 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
            <p className="text-xs font-medium text-slate-600 dark:text-slate-400">No reports generated yet</p>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Select a report type and click "Generate & Save" above to create an auditable record.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-slate-200 dark:border-slate-800 text-slate-400 text-[10px] uppercase">
                <tr>
                  <th className="pb-2 font-semibold">ID</th>
                  <th className="pb-2 font-semibold">Report Type</th>
                  <th className="pb-2 font-semibold">Format</th>
                  <th className="pb-2 font-semibold">Generated By</th>
                  <th className="pb-2 font-semibold">Date</th>
                  <th className="pb-2 font-semibold">Status</th>
                  <th className="pb-2 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                {reports.map((rep) => (
                  <tr key={rep.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                    <td className="py-2.5 font-mono text-slate-500">#{rep.id}</td>
                    <td className="py-2.5 font-bold text-slate-900 dark:text-white">
                      {rep.reportType}
                    </td>
                    <td className="py-2.5">
                      <span className="font-mono text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                        {rep.format || 'CSV'}
                      </span>
                    </td>
                    <td className="py-2.5 text-slate-600 dark:text-slate-400">{rep.generatedBy}</td>
                    <td className="py-2.5 text-slate-400">{formatDateTime(rep.createdAt)}</td>
                    <td className="py-2.5">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        rep.archived 
                          ? 'bg-slate-100 dark:bg-slate-800 text-slate-500 border border-slate-200 dark:border-slate-700' 
                          : 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                      }`}>
                        {rep.archived ? 'Archived' : 'Active'}
                      </span>
                    </td>
                    <td className="py-2.5 text-right space-x-2">
                      {rep.content && (
                        <button
                          onClick={() => setViewingContent(rep)}
                          className="text-indigo-600 hover:text-indigo-800 dark:hover:text-indigo-400 font-semibold"
                          title="View report content"
                        >
                          <Eye className="w-3.5 h-3.5 inline mr-1" />
                          View
                        </button>
                      )}
                      {!rep.archived && (
                        <button
                          onClick={() => archiveReport(rep.id)}
                          className="text-amber-600 hover:text-amber-800 dark:hover:text-amber-400 font-semibold"
                          title="Archive report in backend"
                        >
                          <Archive className="w-3.5 h-3.5 inline mr-1" />
                          Archive
                        </button>
                      )}
                      <button
                        onClick={() => {
                          if (window.confirm(`Are you sure you want to delete Report #${rep.id}?`)) {
                            deleteReport(rep.id);
                          }
                        }}
                        className="text-rose-600 hover:text-rose-800 dark:hover:text-rose-400 font-semibold"
                        title="Delete report permanently from database"
                      >
                        <Trash2 className="w-3.5 h-3.5 inline mr-1" />
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Content Viewer Modal */}
      {viewingContent && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xl max-w-2xl w-full p-5 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2">
              <div>
                <h3 className="font-bold text-slate-900 dark:text-white text-sm">
                  Report #{viewingContent.id}: {viewingContent.reportType}
                </h3>
                <p className="text-[11px] text-slate-400">
                  Format: {viewingContent.format} • Generated by: {viewingContent.generatedBy}
                </p>
              </div>
              <button
                onClick={() => setViewingContent(null)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-xs font-bold"
              >
                ✕
              </button>
            </div>

            <pre className="text-[11px] font-mono bg-slate-50 dark:bg-slate-950 p-3 rounded-lg border border-slate-200 dark:border-slate-800 overflow-x-auto max-h-72 whitespace-pre-wrap">
              {viewingContent.content}
            </pre>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setViewingContent(null)}
                className="px-4 py-1.5 rounded-lg bg-indigo-600 text-white text-xs font-bold hover:bg-indigo-700"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Category Performance Breakdown */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs p-5 transition-colors duration-200">
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-4 flex items-center gap-2">
          <BarChart3 className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
          Category Engagement & Participation Metrics
        </h4>

        <div className="space-y-4">
          {categories.map((cat) => {
            const catNoms = nominations.filter((n) => n.categoryId === cat.id);
            const catVotes = votes.filter((v) => v.categoryId === cat.id);
            const catJudges = cat.assignedJudges?.length || 0;

            const votePct = votes.length > 0 ? Math.round((catVotes.length / votes.length) * 100) : 0;

            return (
              <div key={cat.id} className="p-4 rounded-xl border border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-950/60 space-y-2">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between text-xs gap-1">
                  <div>
                    <span className="font-bold text-slate-900 dark:text-white">{cat.name}</span>
                    <span className="text-[11px] text-slate-400 dark:text-slate-500 font-mono ml-2">({cat.code})</span>
                  </div>
                  <div className="flex items-center gap-3 text-slate-500 dark:text-slate-400">
                    <span><strong>{catNoms.length}</strong> Nominations</span>
                    <span>•</span>
                    <span><strong>{catJudges}</strong> Judges</span>
                    <span>•</span>
                    <span className="font-bold text-indigo-700 dark:text-indigo-400">{catVotes.length} Votes ({votePct}%)</span>
                  </div>
                </div>

                {/* Progress bar visual */}
                <div className="w-full h-2 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-indigo-600 dark:bg-indigo-500 rounded-full transition-all duration-500"
                    style={{ width: `${Math.max(8, votePct)}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
