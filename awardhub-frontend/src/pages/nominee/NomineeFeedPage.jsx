import React from 'react';
import { Award, Bell, Calendar, Sparkles, Trophy, ExternalLink } from 'lucide-react';
import Card from '../../components/ui/Card';
import StatusBadge from '../../components/ui/StatusBadge';

export default function NomineeFeedPage() {
  const announcements = [
    {
      id: 1,
      title: 'Grand Annual Award Gala Date Announced',
      date: 'Oct 24, 2026',
      badge: 'EVENT',
      content:
        'The official AwardHub Annual Gala & Recognition Night will take place live at the Innovation Pavilion. All verified nominees and judges are invited for the red-carpet banquet.',
    },
    {
      id: 2,
      title: 'Final Round Evaluation Scoring In Progress',
      date: 'Oct 15, 2026',
      badge: 'SCHEDULE',
      content:
        'Independent judging panels have begun blind multi-criteria scoring for all approved nominations. Final weighted totals will be locked by committee protocol next week.',
    },
    {
      id: 3,
      title: 'Public Voting Period Extended',
      date: 'Oct 08, 2026',
      badge: 'VOTING',
      content:
        'Due to exceptional voter engagement across categories, public balloting will remain open until midnight this Friday. Finalist rankings update in real time on the leaderboards.',
    },
  ];

  return (
    <div style={{ maxWidth: 840, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 700, margin: 0 }}>
          Award Ceremony Feed & Announcements
        </h1>
        <p style={{ color: 'var(--text-muted)', margin: '0.25rem 0 0 0', fontSize: '0.875rem' }}>
          Official updates, calendar timelines, and gala communications
        </p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        {announcements.map((item) => (
          <Card key={item.id} hoverable>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <div
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: 'var(--radius-md)',
                      background: 'var(--accent-soft)',
                      color: 'var(--accent-primary)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Sparkles size={18} />
                  </div>
                  <h3 style={{ fontSize: '1.15rem', fontWeight: 600, margin: 0 }}>
                    {item.title}
                  </h3>
                </div>
                <StatusBadge status="ACTIVE" label={item.badge} size="sm" />
              </div>
              <p
                style={{
                  fontSize: '0.875rem',
                  color: 'var(--text-secondary)',
                  lineHeight: 1.6,
                  margin: 0,
                }}
              >
                {item.content}
              </p>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  fontSize: '0.75rem',
                  color: 'var(--text-muted)',
                  marginTop: '0.5rem',
                }}
              >
                <Calendar size={14} />
                <span>Published on {item.date}</span>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
