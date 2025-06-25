'use client';

import { useAuth } from '@/components/AuthProvider';
import { useEffect, useState } from 'react';

interface User {
  _id: string;
  name: string;
  email: string;
  role: 'admin' | 'member' | 'visitor';
}

function UserManagement() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/users');
      if (!res.ok) throw new Error('Failed to fetch users');
      const data = await res.json();
      setUsers(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleRoleChange = async (userId: string, newRole: User['role']) => {
    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: newRole }),
      });
      if (!res.ok) throw new Error('Failed to update role');
      // Refresh user list
      fetchUsers();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to update role');
    }
  };

  if (loading) return <div>Loading users...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="mt-8">
      <h2 className="text-2xl font-bold mb-4">User Management</h2>
      <div className="space-y-4">
        {users.map((user) => (
          <div key={user._id} className="flex items-center justify-between p-4 bg-gray-800 rounded-lg">
            <div>
              <p className="font-semibold">{user.name}</p>
              <p className="text-sm text-gray-400">{user.email}</p>
            </div>
            <select
              value={user.role}
              onChange={(e) => handleRoleChange(user._id, e.target.value as User['role'])}
              className="bg-gray-700 text-white rounded p-2"
            >
              <option value="visitor">Visitor</option>
              <option value="member">Member</option>
              <option value="admin">Admin</option>
            </select>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function AdminDashboard() {
  const { user, loading } = useAuth();

  if (loading) return <div>Loading...</div>;
  if (!user || user.role !== 'admin') {
    return <div>Access denied. Admins only.</div>;
  }

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-4">Admin Dashboard</h1>
      <p>Welcome, <span className="font-semibold">{user.name}</span>!</p>
      <p>Your role: <span className="font-semibold">{user.role}</span></p>
      
      <UserManagement />
    </div>
  );
} 