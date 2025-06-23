'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function RegisterPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Something went wrong');
      }

      // Store token in cookie
      document.cookie = `token=${data.token}; path=/`;

      // Redirect to home page
      router.push('/');
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
          <span className="text-[var(--terminal-text)]">$ REGISTER</span>
        </div>
        <div className="terminal-content p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="text-red-500 text-sm mb-4">{error}</div>
            )}
            <div>
              <label className="block text-[var(--terminal-text)] mb-2">
                NAME:
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                className="w-full bg-[var(--terminal-bg)] border border-[var(--terminal-border)] text-[var(--terminal-text)] p-2"
                required
              />
            </div>
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
                minLength={6}
              />
            </div>
            <div>
              <label className="block text-[var(--terminal-text)] mb-2">
                CONFIRM PASSWORD:
              </label>
              <input
                type="password"
                value={formData.confirmPassword}
                onChange={(e) =>
                  setFormData({ ...formData, confirmPassword: e.target.value })
                }
                className="w-full bg-[var(--terminal-bg)] border border-[var(--terminal-border)] text-[var(--terminal-text)] p-2"
                required
                minLength={6}
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[var(--terminal-header)] text-[var(--terminal-text)] p-2 hover:opacity-90 disabled:opacity-50"
            >
              {loading ? 'REGISTERING...' : 'REGISTER'}
            </button>
          </form>
          <div className="mt-4 text-center text-[var(--terminal-text)]">
            Already have an account?{' '}
            <Link href="/login" className="underline hover:opacity-75">
              Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
} 