'use client';

import { useAuth } from '@/components/AuthProvider';

export default function ProfilePage() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-[var(--terminal-text)] font-mono">Loading profile...</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-[var(--terminal-text)] font-mono">Please log in to view your profile.</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="bg-[var(--terminal-bg)] p-8 rounded-lg border border-[var(--terminal-border)] w-full max-w-md">
        <h1 className="text-[var(--terminal-text)] font-mono text-2xl mb-6">$ PROFILE</h1>
        <div className="space-y-4">
          <div>
            <div className="text-[var(--terminal-text)] font-mono opacity-75">NAME</div>
            <div className="text-[var(--terminal-text)] font-mono">{user.name}</div>
          </div>
          <div>
            <div className="text-[var(--terminal-text)] font-mono opacity-75">EMAIL</div>
            <div className="text-[var(--terminal-text)] font-mono">{user.email}</div>
          </div>
          <div>
            <div className="text-[var(--terminal-text)] font-mono opacity-75">ROLE</div>
            <div className="text-[var(--terminal-text)] font-mono">{user.role.toUpperCase()}</div>
          </div>
        </div>
      </div>
    </div>
  );
} 