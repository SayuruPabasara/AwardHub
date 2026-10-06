import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Award,
  Vote,
  Trophy,
  ShieldCheck,
  Users,
  ArrowRight,
  CheckCircle2,
  Sparkles,
  BarChart3,
  Scale,
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import Button from '../components/ui/Button';
import ThemeToggle from '../components/ui/ThemeToggle';
import { categoriesApi } from '../api/categories';
import styles from './LandingPage.module.css';

export default function LandingPage() {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    categoriesApi
      .listPublic()
      .then((data) => setCategories(Array.isArray(data) ? data.slice(0, 4) : []))
      .catch(() => {});
  }, []);

  const handleGetStarted = () => {
    if (isAuthenticated) {
      const role = user?.role || 'VOTER';
      if (role === 'VOTER') navigate('/voter/categories');
      else if (role === 'NOMINEE') navigate('/nominee/nominations');
      else if (role === 'ORGANIZER') navigate('/organizer/dashboard');
      else if (role === 'JUDGE') navigate('/judge/worklist');
      else if (role === 'ADMIN') navigate('/admin/dashboard');
      else navigate('/voter/categories');
    } else {
      navigate('/login');
    }
  };

  return (
    <div className={styles.landing}>
      {/* Navigation Header */}
      <header className={styles.header}>
        <div className={styles.navContainer}>
          <div className={styles.brand}>
            <div className={styles.brandIcon}>
              <Award size={24} />
            </div>
            <span className={styles.brandText}>AwardHub</span>
          </div>

          <div className={styles.navActions}>
            <ThemeToggle />
            {isAuthenticated ? (
              <Button onClick={handleGetStarted} icon={ArrowRight} iconPosition="right">
                Open Dashboard
              </Button>
            ) : (
              <div className={styles.authButtons}>
                <Button variant="ghost" onClick={() => navigate('/login')}>
                  Sign In
                </Button>
                <Button variant="primary" onClick={() => navigate('/register')}>
                  Register
                </Button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className={styles.hero}>
        <div className={styles.heroContent}>
          <div className={styles.badge}>
            <Sparkles size={14} />
            <span>Next-Generation Award & Nomination System</span>
          </div>
          <h1 className={styles.heroTitle}>
            Transparent, Fair & Real-Time <br />
            <span className={styles.gradientText}>Award Voting Management</span>
          </h1>
          <p className={styles.heroSubtitle}>
            AwardHub streamlines end-to-end award governance. Empower voters, support
            nominees with verifiable applications, equip judges with multi-criteria rubrics,
            and provide organizers with real-time auditability.
          </p>

          <div className={styles.ctaGroup}>
            <Button size="lg" onClick={handleGetStarted} icon={ArrowRight} iconPosition="right">
              {isAuthenticated ? 'Go to Workspace' : 'Get Started Now'}
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={() => navigate('/voter/results')}
              icon={Trophy}
            >
              View Public Results
            </Button>
          </div>

          <div className={styles.quickStats}>
            <div className={styles.statItem}>
              <span className={styles.statNum}>100%</span>
              <span className={styles.statLabel}>Audit Integrity</span>
            </div>
            <div className={styles.statDivider} />
            <div className={styles.statItem}>
              <span className={styles.statNum}>5 Roles</span>
              <span className={styles.statLabel}>Tailored Portals</span>
            </div>
            <div className={styles.statDivider} />
            <div className={styles.statItem}>
              <span className={styles.statNum}>Zero Bias</span>
              <span className={styles.statLabel}>Multi-Criteria Rubrics</span>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Categories Carousel / Cards */}
      {categories.length > 0 && (
        <section className={styles.categoriesSection}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Featured Award Categories</h2>
            <p className={styles.sectionSubtitle}>
              Explore currently active and public categories ready for voting
            </p>
          </div>

          <div className={styles.cardsGrid}>
            {categories.map((cat) => (
              <div key={cat.id} className={styles.categoryCard}>
                <div className={styles.catHeader}>
                  <Award size={20} className={styles.catIcon} />
                  <span className={styles.catCode}>{cat.code || 'AWARD'}</span>
                </div>
                <h3 className={styles.catName}>{cat.name}</h3>
                <p className={styles.catDesc}>
                  {cat.description || 'Recognizing outstanding excellence and innovation.'}
                </p>
                <div className={styles.catFooter}>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => navigate('/voter/vote')}
                  >
                    Cast Vote
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Multi-Role Highlights */}
      <section className={styles.rolesSection}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>Designed for All Stakeholders</h2>
          <p className={styles.sectionSubtitle}>
            Dedicated workflows built specifically for every participant in the award lifecycle
          </p>
        </div>

        <div className={styles.rolesGrid}>
          <div className={styles.roleCard}>
            <div className={styles.roleIconWrapper}>
              <Vote size={24} />
            </div>
            <h3 className={styles.roleTitle}>Voters</h3>
            <p className={styles.roleDesc}>
              Browse certified candidates, cast secure tamper-proof ballots, track your vote
              history, and see live results.
            </p>
            <ul className={styles.featureList}>
              <li><CheckCircle2 size={16} /> One-click vote submission</li>
              <li><CheckCircle2 size={16} /> Full ballot audit verification</li>
              <li><CheckCircle2 size={16} /> Live public leaderboard</li>
            </ul>
          </div>

          <div className={styles.roleCard}>
            <div className={styles.roleIconWrapper}>
              <Trophy size={24} />
            </div>
            <h3 className={styles.roleTitle}>Nominees</h3>
            <p className={styles.roleDesc}>
              Submit multi-field nominations with supporting document dossiers, monitor review
              status, and manage profile credentials.
            </p>
            <ul className={styles.featureList}>
              <li><CheckCircle2 size={16} /> Guided nomination wizard</li>
              <li><CheckCircle2 size={16} /> Document upload repository</li>
              <li><CheckCircle2 size={16} /> Real-time status notifications</li>
            </ul>
          </div>

          <div className={styles.roleCard}>
            <div className={styles.roleIconWrapper}>
              <Scale size={24} />
            </div>
            <h3 className={styles.roleTitle}>Judges</h3>
            <p className={styles.roleDesc}>
              Structured multi-criteria rubric evaluation, blind worklist grading, conflict-of-interest
              flags, and category ranking reviews.
            </p>
            <ul className={styles.featureList}>
              <li><CheckCircle2 size={16} /> Weighted rubric scoring</li>
              <li><CheckCircle2 size={16} /> Anonymous candidate review</li>
              <li><CheckCircle2 size={16} /> Comparative radar analytics</li>
            </ul>
          </div>

          <div className={styles.roleCard}>
            <div className={styles.roleIconWrapper}>
              <BarChart3 size={24} />
            </div>
            <h3 className={styles.roleTitle}>Organizers & Admins</h3>
            <p className={styles.roleDesc}>
              Comprehensive category lifecycle control, judge assignment matrices, CSV/PDF report
              exports, and complete audit logging.
            </p>
            <ul className={styles.featureList}>
              <li><CheckCircle2 size={16} /> Real-time vote monitoring</li>
              <li><CheckCircle2 size={16} /> Automated result computation</li>
              <li><CheckCircle2 size={16} /> Immutable event audit logs</li>
            </ul>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className={styles.footer}>
        <div className={styles.footerContent}>
          <div className={styles.footerBrand}>
            <Award size={20} />
            <span>AwardHub © 2026. All rights reserved.</span>
          </div>
          <div className={styles.footerLinks}>
            <span>Security</span>
            <span>•</span>
            <span>Audit Trail</span>
            <span>•</span>
            <span>API Docs</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
