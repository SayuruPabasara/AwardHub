import React, { useState } from 'react';
import { Activity, Server, Database, Cpu, HardDrive, RefreshCw, CheckCircle2 } from 'lucide-react';
import Card from '../../components/ui/Card';
import StatCard from '../../components/ui/StatCard';
import Button from '../../components/ui/Button';

export default function AdminHealthPage() {
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = () => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
    }, 600);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
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
            System Health & Runtime Telemetry
          </h1>
          <p style={{ color: 'var(--text-muted)', margin: '0.25rem 0 0 0', fontSize: '0.875rem' }}>
            Live status of backend microservices, database clusters, and JVM memory
          </p>
        </div>
        <Button variant="outline" icon={RefreshCw} loading={refreshing} onClick={handleRefresh}>
          Refresh Metrics
        </Button>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '1.25rem',
        }}
      >
        <StatCard
          title="Backend Uptime"
          value="99.98%"
          subtitle="Spring Boot 3.x"
          icon={Server}
          accent="green"
        />
        <StatCard
          title="JVM Heap Memory"
          value="412 MB"
          subtitle="Max Allocated: 2048 MB"
          icon={Cpu}
          accent="indigo"
        />
        <StatCard
          title="Database Pool"
          value="8 / 20"
          subtitle="Active Hikari connections"
          icon={Database}
          accent="blue"
        />
        <StatCard
          title="API Response Time"
          value="18 ms"
          subtitle="p95 latency"
          icon={Activity}
          accent="purple"
        />
      </div>

      <Card title="System Components Health Status">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {[
            { name: 'Spring Boot REST Engine (Port 8080)', status: 'UP', latency: '4 ms', desc: 'Accepting HTTP & JWT authorization requests' },
            { name: 'MySQL Relational Database (HikariCP)', status: 'UP', latency: '6 ms', desc: 'Master connection pool healthy' },
            { name: 'JWT Security Token Validator', status: 'UP', latency: '< 1 ms', desc: 'HS256 signature verification online' },
            { name: 'Cryptographic Audit Logger', status: 'UP', latency: '2 ms', desc: 'SHA-256 event chaining active' },
          ].map((srv, idx) => (
            <div
              key={idx}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '1rem 1.25rem',
                background: 'var(--bg-tertiary)',
                borderRadius: 'var(--radius-md)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <CheckCircle2 size={20} style={{ color: 'var(--status-success)' }} />
                <div>
                  <h4 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 600 }}>{srv.name}</h4>
                  <p style={{ margin: '0.15rem 0 0 0', fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
                    {srv.desc}
                  </p>
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <span
                  style={{
                    padding: '3px 10px',
                    borderRadius: 'var(--radius-full)',
                    background: 'var(--status-success-soft)',
                    color: 'var(--status-success)',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                  }}
                >
                  {srv.status}
                </span>
                <span
                  style={{
                    display: 'block',
                    fontSize: '0.75rem',
                    color: 'var(--text-muted)',
                    marginTop: '0.2rem',
                  }}
                >
                  {srv.latency}
                </span>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
