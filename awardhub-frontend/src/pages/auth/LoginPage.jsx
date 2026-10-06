import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Award, Mail, Lock, AlertCircle, ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../../hooks/useAuth';
import Button from '../../components/ui/Button';
import ThemeToggle from '../../components/ui/ThemeToggle';
import styles from './LoginPage.module.css';

export default function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    username: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.username || !formData.password) {
      setError('Please provide both username and password.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const user = await login(formData.username, formData.password);
      toast.success(`Welcome back, ${user.username || 'User'}!`);

      // Redirect based on user role
      const role = user.role || 'VOTER';
      if (role === 'VOTER') navigate('/voter/categories');
      else if (role === 'NOMINEE') navigate('/nominee/nominations');
      else if (role === 'ORGANIZER') navigate('/organizer/dashboard');
      else if (role === 'JUDGE') navigate('/judge/worklist');
      else if (role === 'ADMIN') navigate('/admin/dashboard');
      else navigate('/voter/categories');
    } catch (err) {
      const msg = err.message || 'Login failed. Please check your credentials.';
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
        <div className={styles.authHeader}>
          <h1 className={styles.title}>Sign In</h1>
          <p className={styles.subtitle}>Enter your credentials to access your AwardHub account</p>
        </div>

        {error && (
          <div className={styles.errorBanner}>
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.field}>
            <label htmlFor="username" className={styles.label}>
              Username or Email
            </label>
            <div className={styles.inputWrapper}>
              <Mail size={16} className={styles.fieldIcon} />
              <input
                id="username"
                type="text"
                name="username"
                value={formData.username}
                onChange={handleChange}
                placeholder="Enter your username or email"
                className={styles.input}
                autoComplete="username"
                required
              />
            </div>
          </div>

          <div className={styles.field}>
            <div className={styles.labelRow}>
              <label htmlFor="password" className={styles.label}>
                Password
              </label>
            </div>
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
                autoComplete="current-password"
                required
              />
            </div>
          </div>

          <Button
            type="submit"
            variant="primary"
            size="lg"
            fullWidth
            loading={loading}
            icon={ArrowRight}
            iconPosition="right"
          >
            Sign In
          </Button>
        </form>

        <div className={styles.authFooter}>
          <p>
            Don't have an account?{' '}
            <Link to="/register" className={styles.link}>
              Create an account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
