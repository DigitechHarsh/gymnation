'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { apiClient } from '../../../lib/api';

interface AdminUserRecord {
  id: string;
  name: string;
  email: string;
  role: 'SUPER_ADMIN' | 'MANAGER' | 'STAFF';
  isActive: boolean;
  lastLoginAt?: string | null;
  createdAt: string;
}

export default function UsersPage() {
  const { user: currentAdmin } = useAuth();
  const [users, setUsers] = useState<AdminUserRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Create user form
  const [showCreate, setShowCreate] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'SUPER_ADMIN' | 'MANAGER' | 'STAFF'>('STAFF');
  const [submitting, setSubmitting] = useState(false);

  // Delete modal
  const [deleteTarget, setDeleteTarget] = useState<AdminUserRecord | null>(null);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await apiClient.get('/admin/auth/users');
      setUsers(res.data.data);
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.response?.data?.message || 'Failed to load users' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      await apiClient.post('/admin/auth/users', { name, email, password, role });
      setFeedback({ type: 'success', message: 'User created successfully' });
      setName('');
      setEmail('');
      setPassword('');
      setRole('STAFF');
      setShowCreate(false);
      fetchUsers();
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.response?.data?.message || 'Failed to create user' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleStatus = async (user: AdminUserRecord) => {
    try {
      await apiClient.put(`/admin/auth/users/${user.id}`, { isActive: !user.isActive });
      setFeedback({ type: 'success', message: `User status changed to ${!user.isActive ? 'Active' : 'Inactive'}` });
      fetchUsers();
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.response?.data?.message || 'Update failed' });
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await apiClient.delete(`/admin/auth/users/${deleteTarget.id}`);
      setFeedback({ type: 'success', message: 'User deleted successfully' });
      setDeleteTarget(null);
      fetchUsers();
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.response?.data?.message || 'Delete failed' });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-6 border-b border-gn-border">
        <div>
          <h1 className="text-3xl font-extrabold tracking-wider text-gn-ivory">USERS & ROLES</h1>
          <p className="text-xs font-mono uppercase tracking-widest text-gn-gold mt-1">
            MANAGEMENT STAFF ACCESS PERMISSIONS (SUPER ADMIN ONLY)
          </p>
        </div>
        <button
          onClick={() => setShowCreate(!showCreate)}
          className="mt-4 sm:mt-0 px-4 py-2 bg-gn-maroon hover:bg-gn-maroon-dark text-white border border-gn-maroon text-xs uppercase font-mono tracking-wider transition-colors"
        >
          {showCreate ? 'CANCEL' : '+ ADD USER'}
        </button>
      </div>

      {feedback && (
        <div
          className={`p-3 text-xs font-mono border ${
            feedback.type === 'success'
              ? 'bg-green-950/40 border-green-800 text-green-300'
              : 'bg-red-950/40 border-red-800 text-red-300'
          }`}
        >
          [{feedback.type.toUpperCase()}]: {feedback.message}
        </div>
      )}

      {/* Role explanation */}
      <div className="p-4 bg-gn-surface border border-gn-border grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-mono">
        <div>
          <span className="text-gn-gold font-bold">SUPER_ADMIN:</span> Full permissions across CMS, store, users, and system settings.
        </div>
        <div>
          <span className="text-gn-ivory font-bold">MANAGER:</span> Catalog, orders, memberships, leads, CMS modules (no settings/users).
        </div>
        <div>
          <span className="text-gn-muted font-bold">STAFF:</span> Orders dispatch, member check-in, and lead follow-up only.
        </div>
      </div>

      {/* Create User Form */}
      {showCreate && (
        <form onSubmit={handleCreate} className="bg-gn-surface border border-gn-border p-6 space-y-4">
          <div className="text-xs font-mono uppercase tracking-widest text-gn-gold border-b border-gn-border pb-2">
            CREATE NEW STAFF ACCOUNT
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs uppercase font-mono tracking-wider text-gn-ivory mb-1">
                FULL NAME
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ramesh Patel"
                className="w-full bg-gn-black border border-gn-border px-3 py-2 text-sm text-gn-ivory focus:border-gn-maroon focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs uppercase font-mono tracking-wider text-gn-ivory mb-1">
                EMAIL ADDRESS
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="ramesh@gymnation.in"
                className="w-full bg-gn-black border border-gn-border px-3 py-2 text-sm text-gn-ivory focus:border-gn-maroon focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs uppercase font-mono tracking-wider text-gn-ivory mb-1">
                TEMPORARY PASSWORD (MIN 8 CHARS)
              </label>
              <input
                type="password"
                required
                minLength={8}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full bg-gn-black border border-gn-border px-3 py-2 text-sm text-gn-ivory focus:border-gn-maroon focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs uppercase font-mono tracking-wider text-gn-ivory mb-1">
                ASSIGN ROLE
              </label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as any)}
                className="w-full bg-gn-black border border-gn-border px-3 py-2 text-sm text-gn-ivory focus:border-gn-maroon focus:outline-none uppercase font-mono"
              >
                <option value="STAFF">STAFF (Orders, Leads, Memberships)</option>
                <option value="MANAGER">MANAGER (Store & CMS Management)</option>
                <option value="SUPER_ADMIN">SUPER_ADMIN (Complete Access)</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-2 bg-gn-maroon hover:bg-gn-maroon-dark text-white text-xs font-mono uppercase tracking-wider disabled:opacity-50"
            >
              {submitting ? 'CREATING...' : 'CREATE ACCOUNT'}
            </button>
          </div>
        </form>
      )}

      {/* Users Table */}
      <div className="bg-gn-surface border border-gn-border overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs font-mono">
          <thead>
            <tr className="border-b border-gn-border bg-gn-black/80 text-gn-muted uppercase tracking-wider">
              <th className="p-3.5">NAME</th>
              <th className="p-3.5">EMAIL</th>
              <th className="p-3.5">ROLE</th>
              <th className="p-3.5">STATUS</th>
              <th className="p-3.5">LAST LOGIN</th>
              <th className="p-3.5 text-right">ACTIONS</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gn-border">
            {loading ? (
              <tr>
                <td colSpan={6} className="p-8 text-center text-gn-muted uppercase">
                  LOADING USER ACCOUNTS...
                </td>
              </tr>
            ) : users.map((u) => {
              const isSelf = currentAdmin?.id === u.id;
              return (
                <tr key={u.id} className="hover:bg-gn-surface-light/40 transition-colors">
                  <td className="p-3.5 text-gn-ivory font-bold">{u.name}</td>
                  <td className="p-3.5 text-gn-muted">{u.email}</td>
                  <td className="p-3.5">
                    <span className="px-2 py-0.5 bg-gn-maroon/30 border border-gn-maroon text-gn-ivory uppercase tracking-wider">
                      {u.role.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="p-3.5">
                    {u.isActive ? (
                      <span className="px-2 py-0.5 text-[10px] bg-green-950/60 border border-green-800 text-green-400 font-bold uppercase">Active</span>
                    ) : (
                      <span className="px-2 py-0.5 text-[10px] bg-red-950/60 border border-red-800 text-red-400 font-bold uppercase">Suspended</span>
                    )}
                  </td>
                  <td className="p-3.5 text-gn-muted">
                    {u.lastLoginAt ? new Date(u.lastLoginAt).toLocaleString() : 'NEVER'}
                  </td>
                  <td className="p-3.5 text-right space-x-3">
                    {!isSelf && (
                      <>
                        <button
                          onClick={() => handleToggleStatus(u)}
                          className="text-gn-gold hover:underline uppercase"
                        >
                          {u.isActive ? 'DEACTIVATE' : 'ACTIVATE'}
                        </button>
                        <button
                          onClick={() => setDeleteTarget(u)}
                          className="text-red-400 hover:text-red-300 uppercase"
                        >
                          DELETE
                        </button>
                      </>
                    )}
                    {isSelf && (
                      <span className="text-gn-muted/60 uppercase">[CURRENT USER]</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Delete User Modal */}
      {deleteTarget && (
        <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4">
          <div className="bg-gn-surface border border-gn-border max-w-sm w-full p-6 space-y-4">
            <div className="font-heading text-xl font-bold text-red-400 uppercase">
              CONFIRM USER REMOVAL
            </div>
            <p className="text-xs text-gn-ivory font-mono">
              Are you sure you want to permanently delete user{' '}
              <span className="text-gn-gold">{deleteTarget.email}</span>?
            </p>
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-gn-border">
              <button
                onClick={() => setDeleteTarget(null)}
                className="px-4 py-2 bg-gn-black border border-gn-border text-xs font-mono uppercase text-gn-ivory"
              >
                CANCEL
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 bg-red-800 hover:bg-red-700 text-white text-xs font-mono uppercase tracking-wider"
              >
                CONFIRM DELETE
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
