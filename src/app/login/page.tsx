'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/components/AuthProvider';

export default function LoginPage() {
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(formData.email, formData.password);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="terminal-window w-full max-w-md">
        <div className="terminal-header">
          <span className="text-[var(--terminal-text)]">$ LOGIN</span>
        </div>
        <div className="terminal-content p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="text-red-500 text-sm mb-4">{error}</div>
            )}
            <div>
              <label className="block text-[var(--terminal-text)] mb-2">
                EMAIL:
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                className="w-full bg-[var(--terminal-bg)] border border-[var(--terminal-border)] text-[var(--terminal-text)] p-2"
                required
              />
            </div>
            <div>
              <label className="block text-[var(--terminal-text)] mb-2">
                PASSWORD:
              </label>
              <input
                type="password"
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
                className="w-full bg-[var(--terminal-bg)] border border-[var(--terminal-border)] text-[var(--terminal-text)] p-2"
                required
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[var(--terminal-header)] text-[var(--terminal-text)] p-2 hover:opacity-90 disabled:opacity-50"
            >
              {loading ? 'LOGGING IN...' : 'LOGIN'}
            </button>
          </form>
          <div className="mt-4 text-center text-[var(--terminal-text)]">
            Don&apos;t have an account?{' '}
            <Link href="/register" className="underline hover:opacity-75">
              Register
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
} 