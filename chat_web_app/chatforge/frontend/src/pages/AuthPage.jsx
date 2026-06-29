import { useState } from 'react';
import LoginForm from '../components/auth/LoginForm.jsx';
import RegisterForm from '../components/auth/RegisterForm.jsx';

export default function AuthPage() {
  const [mode, setMode] = useState('login'); // 'login' | 'register'

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-brand">
          <span className="auth-brand-mark">»</span>
          <span>ChatForge</span>
        </div>
        <p className="auth-tagline">
          {mode === 'login' ? 'Pick up where you left off.' : 'Get on the line.'}
        </p>

        {mode === 'login' ? <LoginForm /> : <RegisterForm />}

        <button
          type="button"
          className="auth-switch"
          onClick={() => setMode(mode === 'login' ? 'register' : 'login')}
        >
          {mode === 'login' ? "Don't have an account? Create one" : 'Already have an account? Sign in'}
        </button>
      </div>
    </div>
  );
}
