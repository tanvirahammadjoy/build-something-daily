import { useState } from 'react';
import { useAuth } from '../../context/AuthContext.jsx';

export default function RegisterForm() {
  const { register } = useAuth();
  const [form, setForm] = useState({ username: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await register(form);
    } catch (err) {
      setError(err.response?.data?.message || 'Could not create account');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form className="auth-form" onSubmit={handleSubmit}>
      <label className="field">
        <span>Username</span>
        <input
          type="text"
          name="username"
          value={form.username}
          onChange={handleChange}
          required
          minLength={3}
          maxLength={20}
          autoComplete="username"
        />
      </label>
      <label className="field">
        <span>Email</span>
        <input type="email" name="email" value={form.email} onChange={handleChange} required autoComplete="email" />
      </label>
      <label className="field">
        <span>Password</span>
        <input
          type="password"
          name="password"
          value={form.password}
          onChange={handleChange}
          required
          minLength={6}
          autoComplete="new-password"
        />
      </label>
      {error && <p className="form-error">{error}</p>}
      <button type="submit" className="btn-primary" disabled={submitting}>
        {submitting ? 'Creating account…' : 'Create account'}
      </button>
    </form>
  );
}
