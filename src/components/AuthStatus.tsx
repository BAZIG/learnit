'use client';

import { useEffect } from 'react';
import { useAuth } from '@/components/AuthProvider';
import Link from 'next/link';

export default function AuthStatus() {
  const { user, logout, loading } = useAuth();

  useEffect(() => {
    // This effect will run when user changes (login/logout)
  }, [user]);

  if (loading) return null;

  return user ? (
    <span className="text-[var(--terminal-text)]">
      {user.name} <button onClick={logout} className="underline ml-2">LOGOUT</button>
    </span>
  ) : (
    <Link href="/login" className="text-[var(--terminal-text)] underline">LOGIN</Link>
  );
} 