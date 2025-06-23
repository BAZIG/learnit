'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/components/AuthProvider';
import { useRouter } from 'next/navigation';

interface UserProfile {
  name: string;
  email: string;
  role: string;
}

export default function ProfilePage() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await fetch('/api/auth/me');
        if (!response.ok) {
          throw new Error('Failed to fetch profile');
        }
        const data = await response.json();
        setProfile(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load profile');
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchProfile();
    } else {
      router.push('/login');
    }
  }, [user, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-[var(--terminal-text)] font-mono">Loading profile...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-[var(--terminal-text)] font-mono">Error: {error}</div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-[var(--terminal-text)] font-mono">No profile data available</div>
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
            <div className="text-[var(--terminal-text)] font-mono">{profile.name}</div>
          </div>
          <div>
            <div className="text-[var(--terminal-text)] font-mono opacity-75">EMAIL</div>
            <div className="text-[var(--terminal-text)] font-mono">{profile.email}</div>
          </div>
          <div>
            <div className="text-[var(--terminal-text)] font-mono opacity-75">ROLE</div>
            <div className="text-[var(--terminal-text)] font-mono">{profile.role.toUpperCase()}</div>
          </div>
        </div>
      </div>
    </div>
  );
} 