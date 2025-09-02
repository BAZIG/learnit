'use client';

import Link from 'next/link';
import { useAuth } from '@/components/AuthProvider';
import AuthStatus from '@/components/AuthStatus';

export default function Navigation() {
  const { user, loading } = useAuth();

  if (loading) {
    // Render a placeholder or null during loading to avoid layout shifts
    return <div className="h-6 w-96 bg-gray-800 animate-pulse rounded-md" />;
  }

  return (
    <div className="space-x-4 flex items-center">
      {(user && (user.role === 'admin' || user.role === 'member')) && (
        <>
          <Link href="/personal-analyses" className="text-[var(--terminal-text)] hover:opacity-75">ANALYSES</Link>
          <Link href="/news" className="text-[var(--terminal-text)] hover:opacity-75">NEWS</Link>
          <Link href="/" className="text-[var(--terminal-text)] hover:opacity-75">TERMINAL</Link>
          <Link href="/backtests" className="text-[var(--terminal-text)] hover:opacity-75">BACKTESTS</Link>
        </>
      )}
      <Link href="/contact" className="text-[var(--terminal-text)] hover:opacity-75">CONTACT</Link>
      {!user && (
        <Link href="/profile" className="text-[var(--terminal-text)] hover:opacity-75">PROFILE</Link>
      )}
      {user && user.role === 'admin' && (
        <Link href="/admin" className="text-[var(--terminal-text)] hover:opacity-75">ADMIN</Link>
      )}
      <AuthStatus />
    </div>
  );
} 