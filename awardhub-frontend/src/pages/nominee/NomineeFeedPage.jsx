import React, { useState, useEffect } from 'react';
import { Calendar, Sparkles } from 'lucide-react';
import { categoriesApi } from '../../api/categories';
import Card from '../../components/ui/Card';
import StatusBadge from '../../components/ui/StatusBadge';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import EmptyState from '../../components/ui/EmptyState';
import { formatDate } from '../../utils/formatters';

export default function NomineeFeedPage() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadEvents();
  }, []);

  const loadEvents = async () => {
    setLoading(true);
    try {
      const [eventsRes, catsRes] = await Promise.allSettled([
        categoriesApi.getEvents(),
        categoriesApi.listPublic(),
      ]);

      const eventsList = eventsRes.status === 'fulfilled' && eventsRes.value?.data ? eventsRes.value.data : [];
      const catsList = catsRes.status === 'fulfilled' && Array.isArray(catsRes.value) ? catsRes.value : [];

      const combined = [
        ...eventsList.map((e) => ({
          id: `evt-${e.id}`,
          title: e.name || e.title || 'Award Ceremony Event',
          date: e.eventDate || e.createdAt,
          badge: 'CEREMONY',
          content: e.description || 'Official scheduled award event milestone.',
        })),
        ...catsList.map((c) => ({
          id: `cat-${c.id}`,
          title: `Category Active: ${c.name}`,
          date: c.deadline || c.createdAt,
          badge: c.status || 'ACTIVE',
          content: c.description || 'Award category open for nominations and voting.',
        })),
      ];

      setEvents(combined);
    } catch (err) {
      console.error(err);
      setEvents([]);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingSpinner message="Fetching announcement feed from database..." />;
  }

  return (
    <div style={{ maxWidth: 840, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 700, margin: 0 }}>
          Award Ceremony Feed & Announcements
        </h1>
        <p style={{ color: 'var(--text-muted)', margin: '0.25rem 0 0 0', fontSize: '0.875rem' }}>
          Official updates, calendar timelines, and gala communications from the database
        </p>
      </div>

      {events.length === 0 ? (
        <EmptyState
          icon={Sparkles}
          title="No Announcements Published"
          description="There are currently no active award events or published categories in the database."
        />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {events.map((item) => (
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
                  <StatusBadge status={item.badge} label={item.badge} size="sm" />
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
                  <span>Timeline Date: {formatDate(item.date)}</span>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
