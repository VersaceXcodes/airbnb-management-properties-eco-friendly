import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '@/store/main';

const UV_Auth: React.FC = () => {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const navigate = useNavigate();

  const { signIn, register, authentication_state } = useAppStore();
  const { is_loading } = authentication_state.authentication_status;
  const { error_message } = authentication_state;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (mode === 'login') {
        await signIn(email, password);
      } else {
        await register(email, password);
      }
      navigate('/');
    } catch {
    }
  };

  const isFormValid = email && password && (mode === 'login' || name);

  return (
    <div style={{ padding: '2rem', maxWidth: '400px', margin: '0 auto' }}>
      <h1>{mode === 'login' ? 'Sign In' : 'Register'}</h1>
      
      {error_message && (
        <div style={{ color: 'red', marginBottom: '1rem' }}>
          {error_message}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        {mode === 'register' && (
          <div style={{ marginBottom: '1rem' }}>
            <label htmlFor="name" style={{ display: 'block', marginBottom: '0.5rem' }}>
              Name
            </label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={is_loading}
              style={{ width: '100%', padding: '0.5rem' }}
            />
          </div>
        )}

        <div style={{ marginBottom: '1rem' }}>
          <label htmlFor="email" style={{ display: 'block', marginBottom: '0.5rem' }}>
            Email Address
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={is_loading}
            style={{ width: '100%', padding: '0.5rem' }}
          />
        </div>

        <div style={{ marginBottom: '1rem' }}>
          <label htmlFor="password" style={{ display: 'block', marginBottom: '0.5rem' }}>
            Password
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={is_loading}
            style={{ width: '100%', padding: '0.5rem' }}
          />
        </div>

        <button
          type="submit"
          disabled={is_loading || !isFormValid}
          style={{
            width: '100%',
            padding: '0.75rem',
            backgroundColor: is_loading || !isFormValid ? '#ccc' : '#007bff',
            color: 'white',
            border: 'none',
            cursor: is_loading || !isFormValid ? 'not-allowed' : 'pointer',
          }}
        >
          {is_loading
            ? mode === 'login'
              ? 'Signing In...'
              : 'Creating Account...'
            : mode === 'login'
            ? 'Sign In to Your Account'
            : 'Create Account'}
        </button>
      </form>

      <div style={{ marginTop: '1rem', textAlign: 'center' }}>
        <button
          onClick={() => {
            setMode(mode === 'login' ? 'register' : 'login');
            setEmail('');
            setPassword('');
            setName('');
          }}
          disabled={is_loading}
          style={{
            background: 'none',
            border: 'none',
            color: '#007bff',
            cursor: is_loading ? 'not-allowed' : 'pointer',
            textDecoration: 'underline',
          }}
        >
          {mode === 'login'
            ? "Don't have an account? Register"
            : 'Already have an account? Sign In'}
        </button>
      </div>
    </div>
  );
};

export default UV_Auth;
