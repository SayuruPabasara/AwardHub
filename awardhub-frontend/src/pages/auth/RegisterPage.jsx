import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Award, Mail, Lock, User, ShieldCheck, CheckCircle2, AlertCircle, ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../../hooks/useAuth';
import Button from '../../components/ui/Button';
import ThemeToggle from '../../components/ui/ThemeToggle';
import styles from './LoginPage.module.css';

export default function RegisterPage() {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [formData, setFormData] = useState({
    fullName: '',
    username: '',
    email: '',
    nic: '',
    password: '',
    role: 'VOTER',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [registeredSuccess, setRegisteredSuccess] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.fullName.trim() || !formData.username.trim() || !formData.email.trim() || !formData.password) {
      setError('Please fill in all required fields.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await register({
        name: formData.fullName.trim(),
        fullName: formData.fullName.trim(),
        username: formData.username.trim(),
        email: formData.email.trim(),
        password: formData.password,
        nic: formData.nic ? formData.nic.trim() : undefined,
        role: formData.role,
      });
      setRegisteredSuccess(true);
      toast.success('Registration successful!');
    } catch (err) {
      const msg = err.message || 'Registration failed. Please try again.';
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.authContainer}>
      <div className={styles.topBar}>
        <Link to="/" className={styles.brandLink}>
          <div className={styles.brandIcon}>
            <Award size={20} />
          </div>
          <span className={styles.brandName}>AwardHub</span>
        </Link>
        <ThemeToggle />
      </div>

      <div className={styles.authCard}>
        {registeredSuccess ? (
          <div style={{ textAlign: 'center', padding: '1rem 0' }}>
            <div
              style={{
                width: 64,
                height: 64,
                borderRadius: '50%',
                background: 'var(--status-success-soft)',
                color: 'var(--status-success)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 1.5rem auto',
              }}
            >
              <CheckCircle2 size={36} />
            </div>
            <h2 className={styles.title}>Registration Successful!</h2>
            <p className={styles.subtitle} style={{ marginBottom: '2rem' }}>
              Your account has been created successfully. You can now sign in with your credentials.
            </p>
            <Button
              variant="primary"
              size="lg"
              fullWidth
              onClick={() => navigate('/login')}
              icon={ArrowRight}
              iconPosition="right"
            >
              Proceed to Sign In
            </Button>
          </div>
        ) : (
          <>
            <div className={styles.authHeader}>
              <h1 className={styles.title}>Create Account</h1>
              <p className={styles.subtitle}>
                Join AwardHub to vote, submit nominations, or participate
              </p>
            </div>

            {error && (
              <div className={styles.errorBanner}>
                <AlertCircle size={18} />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className={styles.form}>
              <div className={styles.field}>
                <label htmlFor="fullName" className={styles.label}>
                  Full Name
                </label>
                <div className={styles.inputWrapper}>
                  <User size={16} className={styles.fieldIcon} />
                  <input
                    id="fullName"
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleChange}
                    placeholder="e.g. John Doe"
                    className={styles.input}
                    required
                  />
                </div>
              </div>

              <div className={styles.field}>
                <label htmlFor="username" className={styles.label}>
                  Username
                </label>
                <div className={styles.inputWrapper}>
                  <User size={16} className={styles.fieldIcon} />
                  <input
                    id="username"
                    type="text"
                    name="username"
                    value={formData.username}
                    onChange={handleChange}
                    placeholder="e.g. johndoe"
                    className={styles.input}
                    required
                  />
                </div>
              </div>

              <div className={styles.field}>
                <label htmlFor="email" className={styles.label}>
                  Email Address
                </label>
                <div className={styles.inputWrapper}>
                  <Mail size={16} className={styles.fieldIcon} />
                  <input
                    id="email"
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="john@example.com"
                    className={styles.input}
                    required
                  />
                </div>
              </div>

              <div className={styles.field}>
                <label htmlFor="password" className={styles.label}>
                  Password
                </label>
                <div className={styles.inputWrapper}>
                  <Lock size={16} className={styles.fieldIcon} />
                  <input
                    id="password"
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="••••••••"
                    className={styles.input}
                    required
                  />
                </div>
              </div>

              <div className={styles.field}>
                <label htmlFor="role" className={styles.label}>
                  Account Type
                </label>
                <select
                  id="role"
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  className={styles.input}
                  style={{ paddingLeft: '14px' }}
                >
                  <option value="VOTER">Voter (Public Voting)</option>
                  <option value="NOMINEE">Nominee (Submit & Manage Nominations)</option>
                  <option value="ORGANIZER">Organizer (Award Committee)</option>
                  <option value="JUDGE">Judge (Panel Evaluation)</option>
                </select>
              </div>

              {formData.role === 'VOTER' && (
                <div className={styles.field}>
                  <label htmlFor="nic" className={styles.label}>
                    NIC / National ID{' '}
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                      (Required for voting: e.g. 200012345678 or 123456789V)
                    </span>
                  </label>
                  <div className={styles.inputWrapper}>
                    <ShieldCheck size={16} className={styles.fieldIcon} />
                    <input
                      id="nic"
                      type="text"
                      name="nic"
                      value={formData.nic}
                      onChange={handleChange}
                      placeholder="e.g. 200012345678 or 123456789V"
                      className={styles.input}
                    />
                  </div>
                </div>
              )}

              <Button
                type="submit"
                variant="primary"
                size="lg"
                fullWidth
                loading={loading}
                icon={ArrowRight}
                iconPosition="right"
              >
                Create Account
              </Button>
            </form>

            <div className={styles.authFooter}>
              <p>
                Already have an account?{' '}
                <Link to="/login" className={styles.link}>
                  Sign in
                </Link>
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
