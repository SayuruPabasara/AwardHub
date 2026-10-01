import React from 'react';
import { BarChart3, CheckCircle, Clock, Award, Shield, FileCheck } from 'lucide-react';
import Card from '../../components/ui/Card';
import StatCard from '../../components/ui/StatCard';
import Button from '../../components/ui/Button';

export default function JudgeSummaryPage() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 700, margin: 0 }}>
          Judge Performance Summary
        </h1>
        <p style={{ color: 'var(--text-muted)', margin: '0.25rem 0 0 0', fontSize: '0.875rem' }}>
          Overview of your panel contributions, scoring distributions, and calibration status
        </p>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '1.25rem',
        }}
      >
        <StatCard
          title="Dossiers Evaluated"
          value="14"
          subtitle="Across 3 award categories"
          icon={CheckCircle}
          accent="green"
        />
        <StatCard
          title="Mean Score Awarded"
          value="84.2"
          subtitle="Standard deviation: ±6.4"
          icon={BarChart3}
          accent="indigo"
        />
        <StatCard
          title="Calibration Index"
          value="98.5%"
          subtitle="Aligned with panel consensus"
          icon={Shield}
          accent="blue"
        />
        <StatCard
          title="Panel Certification"
          value="Verified"
          subtitle="Signed cryptographic token"
          icon={FileCheck}
          accent="purple"
        />
      </div>

      <Card title="Evaluator Code of Ethics & Transparency Pledge">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', color: 'var(--text-secondary)', fontSize: '0.875rem', lineHeight: 1.6 }}>
          <p style={{ margin: 0 }}>
            As an appointed judge on the AwardHub panel, all scores submitted are cryptographically signed with your authenticated session key. You have certified that:
          </p>
          <ul style={{ margin: 0, paddingLeft: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <li>No conflict of interest exists between your affiliations and any graded candidate dossiers.</li>
            <li>All criteria evaluations follow the published standard rubrics without bias or outside influence.</li>
            <li>All qualitative feedback remains confidential until the official gala announcement.</li>
          </ul>
        </div>
      </Card>
    </div>
  );
}
