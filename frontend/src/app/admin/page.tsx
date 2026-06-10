'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Activity,
  ArrowUpRight,
  Database,
  Edit2,
  Globe,
  Layers,
  LayoutDashboard,
  Plus,
  RefreshCw,
  Search,
  Trash2,
  UserPlus,
  Users,
  X,
  Sparkles,
  TrendingUp,
  Mail,
  Lock,
  User as UserIcon
} from 'lucide-react';
import { Button } from '@/frontend/components/ui/Button';
import { Card } from '@/frontend/components/ui/Card';
import { Badge } from '@/frontend/components/ui/Badge';
import { Skeleton } from '@/frontend/components/ui/Skeleton';
import { Modal } from '@/frontend/components/ui/Modal';
import { Input } from '@/frontend/components/ui/Input';
import { toast } from 'sonner';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  Cell,
  PieChart,
  Pie,
  ResponsiveContainer,
  Tooltip as ChartTooltip,
  XAxis,
  YAxis
} from 'recharts';
import { useRouter } from 'next/navigation';
import { createBrowserSupabase } from '@/backend/lib/supabase/client';

type AdminStats = {
  totalUsers: number;
  totalSessions: number;
  avgScore: number;
  currentActiveUsers: number;
  dailyVisitors: number;
  uniqueUsers: number;
  planBreakdown: { free: number; pro: number; founder: number };
  categoryDistribution: Array<{ name: string; value: number }>;
  timeline: Array<{
    date: string;
    signups: number;
    analyses: number;
    visitors: number;
    uniqueUsers: number;
  }>;
  recentActivity: Array<{
    id: string;
    title: string;
    category: string;
    status: string;
    created_at: string;
    userEmail: string;
    userName: string;
    score: number | null;
    verdict: string | null;
  }>;
};

type UserRow = {
  id: string;
  email: string;
  name: string;
  plan: string;
  created_at: string;
  subscription_status: string;
  ideasCount: number;
};

function formatRelativeTime(isoString: string) {
  const d = new Date(isoString).getTime();
  const diff = Math.floor((Date.now() - d) / 1000);
  if (diff < 60) return 'just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
  return new Date(isoString).toLocaleDateString();
}

export default function AdminDashboardPage() {
  const router = useRouter();
  const [authLoading, setAuthLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'users'>('overview');
  
  // Data State
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [users, setUsers] = useState<UserRow[]>([]);
  const [loadingStats, setLoadingStats] = useState(true);
  const [loadingUsers, setLoadingUsers] = useState(true);

  // Search/Filter State
  const [userSearch, setUserSearch] = useState('');
  const [planFilter, setPlanFilter] = useState<'all' | 'free' | 'pro' | 'founder'>('all');
  const [sortBy, setSortBy] = useState<'joined' | 'ideas' | 'name'>('joined');

  // Modal State
  const [addUserOpen, setAddUserOpen] = useState(false);
  const [editUser, setEditUser] = useState<UserRow | null>(null);
  const [deleteUser, setDeleteUser] = useState<UserRow | null>(null);

  // Form State
  const [formName, setFormName] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formPassword, setFormPassword] = useState('');
  const [formPlan, setFormPlan] = useState<'free' | 'pro' | 'founder'>('free');
  const [actionLoading, setActionLoading] = useState(false);

  // Recharts mounted check
  const [mounted, setMounted] = useState(false);

  // 1. Authorize Admin User
  useEffect(() => {
    const sb = createBrowserSupabase();
    sb.auth.getUser().then(({ data: { user } }) => {
      if (!user || user.email !== 'admin@ideaforge.com') {
        toast.error('Access denied. Admin authorization required.');
        router.push('/sign-in');
      } else {
        setAuthLoading(false);
      }
    });
    setMounted(true);
  }, [router]);

  // 2. Fetch Stats & Users
  const fetchStats = async () => {
    setLoadingStats(true);
    try {
      const res = await fetch('/api/admin/stats');
      if (!res.ok) throw new Error('Failed to load stats');
      const data = await res.json();
      setStats(data);
    } catch (err) {
      toast.error('Error fetching stats data');
      console.error(err);
    } finally {
      setLoadingStats(false);
    }
  };

  const fetchUsers = async () => {
    setLoadingUsers(true);
    try {
      const res = await fetch('/api/admin/users');
      if (!res.ok) throw new Error('Failed to load users');
      const data = await res.json();
      setUsers(data.users || []);
    } catch (err) {
      toast.error('Error fetching users directory');
      console.error(err);
    } finally {
      setLoadingUsers(false);
    }
  };

  useEffect(() => {
    if (!authLoading) {
      void fetchStats();
      void fetchUsers();
    }
  }, [authLoading]);

  // CRUD handlers
  const handleAddUserSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      const res = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formName,
          email: formEmail,
          password: formPassword,
          plan: formPlan
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to create user');
      
      toast.success(`User ${formEmail} created successfully!`);
      setAddUserOpen(false);
      // Reset Form
      setFormName('');
      setFormEmail('');
      setFormPassword('');
      setFormPlan('free');
      // Re-fetch
      void fetchUsers();
      void fetchStats();
    } catch (err: any) {
      toast.error(err.message || 'Error creating user');
    } finally {
      setActionLoading(false);
    }
  };

  const handleEditUserSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editUser) return;
    setActionLoading(true);
    try {
      const res = await fetch('/api/admin/users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: editUser.id,
          name: formName,
          email: formEmail,
          plan: formPlan
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update user');
      
      toast.success(`User ${formEmail} updated successfully!`);
      setEditUser(null);
      // Reset Form
      setFormName('');
      setFormEmail('');
      setFormPlan('free');
      // Re-fetch
      void fetchUsers();
      void fetchStats();
    } catch (err: any) {
      toast.error(err.message || 'Error updating user');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteUserConfirm = async () => {
    if (!deleteUser) return;
    setActionLoading(true);
    try {
      const res = await fetch(`/api/admin/users?id=${deleteUser.id}`, {
        method: 'DELETE'
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to delete user');
      
      toast.success('User and associated data deleted.');
      setDeleteUser(null);
      // Re-fetch
      void fetchUsers();
      void fetchStats();
    } catch (err: any) {
      toast.error(err.message || 'Error deleting user');
    } finally {
      setActionLoading(false);
    }
  };

  // Open forms with populated data
  const openEditModal = (user: UserRow) => {
    setEditUser(user);
    setFormName(user.name);
    setFormEmail(user.email);
    setFormPlan(user.plan as any);
  };

  // Filtered and Sorted Users
  const processedUsers = useMemo(() => {
    let result = [...users];

    // Search filter
    if (userSearch.trim()) {
      const q = userSearch.toLowerCase();
      result = result.filter(
        (u) =>
          u.name.toLowerCase().includes(q) ||
          u.email.toLowerCase().includes(q)
      );
    }

    // Plan filter
    if (planFilter !== 'all') {
      result = result.filter((u) => u.plan === planFilter);
    }

    // Sorting
    result.sort((a, b) => {
      if (sortBy === 'ideas') {
        return b.ideasCount - a.ideasCount;
      }
      if (sortBy === 'name') {
        return a.name.localeCompare(b.name);
      }
      // 'joined' is default (descending created_at)
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });

    return result;
  }, [users, userSearch, planFilter, sortBy]);

  // Color mappings
  const COLORS = {
    free: '#555570',
    pro: '#7c6efa',
    founder: '#10b981',
  };

  if (authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[var(--bg-primary)]">
        <div className="flex flex-col items-center gap-3">
          <RefreshCw className="h-8 w-8 animate-spin text-[var(--accent-primary)]" />
          <p className="text-sm text-[var(--text-secondary)] font-medium">Authorizing system admin...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="page-transition mx-auto max-w-7xl px-4 pb-24 pt-24">
      {/* Header Panel */}
      <div className="mb-8 overflow-hidden rounded-3xl border border-[var(--border-bright)] bg-[radial-gradient(circle_at_top_right,rgba(124,110,250,0.15),transparent_40%),linear-gradient(180deg,rgba(17,17,30,0.9),rgba(10,10,20,0.9))] p-6 sm:p-8">
        <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-[var(--border-bright)] bg-[var(--bg-elevated)] px-3 py-1 text-xs text-[var(--text-secondary)]">
              <LayoutDashboard className="h-3.5 w-3.5 text-[var(--accent-primary)]" />
              Platform Owner Control Panel
            </div>
            <h1 className="font-display text-3xl font-bold text-[var(--text-primary)] sm:text-4xl">
              IdeaForge Insights
            </h1>
            <p className="mt-2 text-sm text-[var(--text-secondary)]">
              Real-time platform growth metrics, visitor logs, and user directory manager.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Button
              variant="secondary"
              onClick={() => {
                void fetchStats();
                void fetchUsers();
                toast.success('Dashboard metrics updated');
              }}
              disabled={loadingStats || loadingUsers}
              className="border-[var(--border-bright)] bg-[var(--bg-card)] hover:bg-[var(--bg-card-hover)]"
            >
              <RefreshCw className={`h-4 w-4 ${loadingStats || loadingUsers ? 'animate-spin' : ''}`} />
              Sync Data
            </Button>
            <Button onClick={() => setAddUserOpen(true)}>
              <UserPlus className="h-4 w-4" />
              Add User
            </Button>
          </div>
        </div>
      </div>

      {/* Tabs Switcher */}
      <div className="mb-8 flex border-b border-[var(--border)]">
        <button
          className={`pb-4 px-6 text-sm font-medium transition-all relative ${
            activeTab === 'overview'
              ? 'text-[var(--text-accent)] border-b-2 border-[var(--accent-primary)] font-bold'
              : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
          }`}
          onClick={() => setActiveTab('overview')}
        >
          Overview Insights
        </button>
        <button
          className={`pb-4 px-6 text-sm font-medium transition-all relative ${
            activeTab === 'users'
              ? 'text-[var(--text-accent)] border-b-2 border-[var(--accent-primary)] font-bold'
              : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
          }`}
          onClick={() => setActiveTab('users')}
        >
          User Directory ({users.length})
        </button>
      </div>

      {activeTab === 'overview' && (
        <div className="space-y-8">
          {/* Key Metrics Grid */}
          <div className="grid gap-4 grid-cols-2 lg:grid-cols-6">
            {[
              {
                label: 'Total Platform Users',
                value: stats?.totalUsers,
                icon: Users,
                color: 'var(--accent-primary)',
              },
              {
                label: 'Live Active Users',
                value: stats?.currentActiveUsers,
                icon: Activity,
                color: 'var(--success)',
                pulse: true,
              },
              {
                label: 'Daily Visitors (Today)',
                value: stats?.dailyVisitors,
                icon: Globe,
                color: '#38bdf8',
              },
              {
                label: 'Unique Users (Today)',
                value: stats?.uniqueUsers,
                icon: TrendingUp,
                color: '#fb7185',
              },
              {
                label: 'Ideas Analyzed',
                value: stats?.totalSessions,
                icon: Database,
                color: '#f59e0b',
              },
              {
                label: 'Average Score',
                value: stats ? `${stats.avgScore}/100` : undefined,
                icon: Sparkles,
                color: '#a855f7',
              },
            ].map((metric, i) => (
              <Card
                key={i}
                className="group relative rounded-2xl border-[var(--border-bright)] bg-[linear-gradient(180deg,rgba(255,255,255,0.015),rgba(255,255,255,0))] p-5 transition hover:translate-y-[-2px] hover:border-[var(--accent-primary)]/30"
              >
                <div className="flex items-center justify-between mb-3">
                  <p className="text-[10px] uppercase font-bold tracking-wider text-[var(--text-muted)] line-clamp-1">
                    {metric.label}
                  </p>
                  <metric.icon className="h-4 w-4 shrink-0" style={{ color: metric.color }} />
                </div>
                {loadingStats ? (
                  <Skeleton className="h-9 w-20" />
                ) : (
                  <div className="flex items-baseline gap-2">
                    <p className="font-mono text-2xl sm:text-3xl font-bold text-[var(--text-primary)]">
                      {metric.value ?? 0}
                    </p>
                    {metric.pulse && (
                      <span className="flex h-2 w-2 relative">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[var(--success)] opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-[var(--success)]"></span>
                      </span>
                    )}
                  </div>
                )}
                <div className="mt-3 h-1 w-10 rounded-full bg-[var(--border-bright)] transition-all group-hover:w-16" />
              </Card>
            ))}
          </div>

          {/* Interactive Charts Section */}
          <div className="grid gap-6 lg:grid-cols-3">
            {/* Chart 1: User Growth and Analyses */}
            <Card className="lg:col-span-2 border-[var(--border-bright)] p-6 bg-[linear-gradient(180deg,rgba(255,255,255,0.01),rgba(255,255,255,0))]">
              <div className="mb-6 flex items-center justify-between">
                <div>
                  <h3 className="font-display font-bold text-lg text-[var(--text-primary)]">Growth & Activity</h3>
                  <p className="text-xs text-[var(--text-secondary)]">Signups, visitor logs, and analyses over last 7 days</p>
                </div>
                <div className="flex items-center gap-4 text-xs font-mono">
                  <div className="flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-[var(--accent-primary)]" />
                    <span className="text-[var(--text-secondary)]">Analyses</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-[#38bdf8]" />
                    <span className="text-[var(--text-secondary)]">Visitors</span>
                  </div>
                </div>
              </div>
              <div className="h-[240px] w-full">
                {mounted && stats ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={stats.timeline} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <defs>
                        <linearGradient id="colorAnalyses" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="var(--accent-primary)" stopOpacity={0.2} />
                          <stop offset="95%" stopColor="var(--accent-primary)" stopOpacity={0} />
                        </linearGradient>
                        <linearGradient id="colorVisitors" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#38bdf8" stopOpacity={0.2} />
                          <stop offset="95%" stopColor="#38bdf8" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <XAxis
                        dataKey="date"
                        stroke="#555570"
                        fontSize={10}
                        tickLine={false}
                        axisLine={false}
                      />
                      <YAxis
                        yAxisId="left"
                        stroke="#38bdf8"
                        fontSize={10}
                        tickLine={false}
                        axisLine={false}
                        label={{ value: 'Visitors', angle: -90, position: 'insideLeft', style: { fill: '#38bdf8', fontSize: '9px', fontWeight: 'bold' } }}
                      />
                      <YAxis
                        yAxisId="right"
                        orientation="right"
                        stroke="var(--accent-primary)"
                        fontSize={10}
                        tickLine={false}
                        axisLine={false}
                        label={{ value: 'Analyses', angle: 90, position: 'insideRight', style: { fill: 'var(--accent-primary)', fontSize: '9px', fontWeight: 'bold' } }}
                      />
                      <ChartTooltip
                        contentStyle={{
                          backgroundColor: 'var(--bg-elevated)',
                          borderColor: 'var(--border-bright)',
                          borderRadius: '8px',
                          color: 'var(--text-primary)',
                          fontFamily: 'var(--font-body), sans-serif',
                          fontSize: '12px',
                        }}
                      />
                      <Area
                        yAxisId="left"
                        type="monotone"
                        dataKey="visitors"
                        stroke="#38bdf8"
                        strokeWidth={2}
                        fillOpacity={1}
                        fill="url(#colorVisitors)"
                      />
                      <Area
                        yAxisId="right"
                        type="monotone"
                        dataKey="analyses"
                        stroke="var(--accent-primary)"
                        strokeWidth={2}
                        fillOpacity={1}
                        fill="url(#colorAnalyses)"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                ) : (
                  <Skeleton className="h-full w-full" />
                )}
              </div>
            </Card>

            {/* Chart 2: Plan Breakdown */}
            <Card className="border-[var(--border-bright)] p-6 bg-[linear-gradient(180deg,rgba(255,255,255,0.01),rgba(255,255,255,0))] flex flex-col justify-between">
              <div>
                <h3 className="font-display font-bold text-lg text-[var(--text-primary)]">User Subscriptions</h3>
                <p className="text-xs text-[var(--text-secondary)]">Breakdown of subscription plan levels</p>
              </div>
              <div className="relative flex items-center justify-center h-[160px] my-4">
                {mounted && stats ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={[
                          { name: 'Free', value: stats.planBreakdown.free, planKey: 'free' },
                          { name: 'Pro', value: stats.planBreakdown.pro, planKey: 'pro' },
                          { name: 'Founder', value: stats.planBreakdown.founder, planKey: 'founder' },
                        ]}
                        innerRadius={50}
                        outerRadius={70}
                        paddingAngle={4}
                        dataKey="value"
                      >
                        <Cell fill={COLORS.free} />
                        <Cell fill={COLORS.pro} />
                        <Cell fill={COLORS.founder} />
                      </Pie>
                      <ChartTooltip
                        contentStyle={{
                          backgroundColor: 'var(--bg-elevated)',
                          borderColor: 'var(--border-bright)',
                          borderRadius: '8px',
                          color: 'var(--text-primary)',
                          fontSize: '11px',
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <Skeleton className="h-[120px] w-[120px] rounded-full" />
                )}
                <div className="absolute flex flex-col items-center">
                  <span className="text-[10px] uppercase font-bold tracking-wider text-[var(--text-muted)]">Users</span>
                  <span className="font-mono text-2xl font-bold text-[var(--text-primary)]">{stats?.totalUsers ?? 0}</span>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-2 text-center text-xs">
                {[
                  { label: 'Free', count: stats?.planBreakdown.free, color: COLORS.free },
                  { label: 'Pro', count: stats?.planBreakdown.pro, color: COLORS.pro },
                  { label: 'Founder', count: stats?.planBreakdown.founder, color: COLORS.founder },
                ].map((p, idx) => (
                  <div key={idx} className="rounded-xl border border-[var(--border)] bg-[rgba(255,255,255,0.01)] p-2">
                    <div className="mx-auto mb-1 h-1.5 w-6 rounded-full" style={{ backgroundColor: p.color }} />
                    <p className="text-[var(--text-secondary)] text-[10px] font-medium">{p.label}</p>
                    <p className="font-mono font-bold text-[var(--text-primary)]">{p.count ?? 0}</p>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          {/* Bottom Section: Categories & Activity Feed */}
          <div className="grid gap-6 lg:grid-cols-3">
            {/* Category distribution */}
            <Card className="border-[var(--border-bright)] p-6 bg-[linear-gradient(180deg,rgba(255,255,255,0.01),rgba(255,255,255,0))]">
              <h3 className="font-display font-bold text-lg text-[var(--text-primary)] mb-1">Top Startup Verticals</h3>
              <p className="text-xs text-[var(--text-secondary)] mb-6">Distribution of analyzed startup niches</p>
              <div className="h-[260px] w-full">
                {mounted && stats?.categoryDistribution.length ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={stats.categoryDistribution}
                      layout="vertical"
                      margin={{ top: 0, right: 10, left: -10, bottom: 0 }}
                    >
                      <XAxis type="number" stroke="#555570" fontSize={10} tickLine={false} axisLine={false} />
                      <YAxis
                        type="category"
                        dataKey="name"
                        stroke="#8888aa"
                        fontSize={10}
                        tickLine={false}
                        axisLine={false}
                        width={70}
                      />
                      <ChartTooltip
                        contentStyle={{
                          backgroundColor: 'var(--bg-elevated)',
                          borderColor: 'var(--border-bright)',
                          borderRadius: '8px',
                          color: 'var(--text-primary)',
                          fontSize: '11px',
                        }}
                      />
                      <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                        {stats.categoryDistribution.map((_, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={index === 0 ? 'var(--accent-primary)' : 'rgba(124, 110, 250, 0.5)'}
                          />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                ) : stats?.categoryDistribution.length === 0 ? (
                  <div className="flex h-full items-center justify-center text-xs text-[var(--text-muted)]">
                    No categories logged yet
                  </div>
                ) : (
                  <Skeleton className="h-full w-full" />
                )}
              </div>
            </Card>

            {/* Live activity feed */}
            <Card className="lg:col-span-2 border-[var(--border-bright)] p-6 bg-[linear-gradient(180deg,rgba(255,255,255,0.01),rgba(255,255,255,0))] flex flex-col">
              <div className="mb-6">
                <h3 className="font-display font-bold text-lg text-[var(--text-primary)]">Live Idea Submissions</h3>
                <p className="text-xs text-[var(--text-secondary)]">Recent business ideas analyzed on the platform</p>
              </div>

              {loadingStats ? (
                <div className="space-y-4">
                  {[1, 2, 3].map((n) => (
                    <Skeleton key={n} className="h-16 w-full" />
                  ))}
                </div>
              ) : !stats || stats.recentActivity.length === 0 ? (
                <div className="flex flex-1 flex-col items-center justify-center py-10 text-center">
                  <Database className="mb-2 h-8 w-8 text-[var(--text-muted)]" />
                  <p className="text-sm font-semibold text-[var(--text-secondary)]">No submissions found</p>
                  <p className="text-xs text-[var(--text-muted)] mt-1">Platform ideas feed will display here.</p>
                </div>
              ) : (
                <div className="flex-1 overflow-y-auto max-h-[300px] pr-2 space-y-3 custom-scrollbar">
                  {stats.recentActivity.map((activity) => (
                    <div
                      key={activity.id}
                      className="group flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-xl border border-[var(--border)] bg-[rgba(255,255,255,0.01)] p-4 transition-all hover:bg-[var(--bg-card-hover)] hover:border-[var(--border-bright)]"
                    >
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                          <Link href={`/results/${activity.id}`}>
                            <span className="font-display font-bold text-sm text-[var(--text-primary)] hover:text-[var(--accent-primary)] transition-all line-clamp-1">
                              {activity.title}
                            </span>
                          </Link>
                          <Badge variant="accent" className="text-[9px] px-2 py-0">
                            {activity.category}
                          </Badge>
                          <Badge
                            variant={
                              activity.status === 'complete'
                                ? 'success'
                                : activity.status === 'failed'
                                ? 'danger'
                                : 'warning'
                            }
                            className="text-[9px] px-2 py-0"
                          >
                            {activity.status}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-2 text-[10px] text-[var(--text-muted)]">
                          <span className="font-mono line-clamp-1">{activity.userEmail}</span>
                          <span>•</span>
                          <span>{formatRelativeTime(activity.created_at)}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 shrink-0 self-end sm:self-auto">
                        {activity.score !== null && (
                          <div className="flex flex-col items-end">
                            <span className="font-mono text-base font-bold text-[var(--accent-primary)] bg-[var(--accent-glow)] border border-[var(--accent-primary)]/20 px-2 py-0.5 rounded-lg">
                              {activity.score}
                            </span>
                            <span className="text-[9px] text-[var(--text-muted)] mt-0.5">{activity.verdict || 'Score'}</span>
                          </div>
                        )}
                        <Link href={`/results/${activity.id}`} className="p-1 text-[var(--text-muted)] hover:text-[var(--text-primary)]">
                          <ArrowUpRight className="h-4 w-4" />
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </div>
        </div>
      )}

      {activeTab === 'users' && (
        <Card className="border-[var(--border-bright)] p-6 bg-[linear-gradient(180deg,rgba(255,255,255,0.01),rgba(255,255,255,0))]">
          {/* Filters Bar */}
          <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="relative max-w-md flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--text-muted)]" />
              <Input
                as="input"
                placeholder="Search user email or name..."
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
                className="pl-9 bg-[var(--bg-secondary)] border-[var(--border)] focus:border-[var(--accent-primary)] focus:bg-[var(--bg-elevated)] w-full"
              />
            </div>
            
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-1.5 rounded-lg border border-[var(--border)] bg-[var(--bg-secondary)] p-1 text-xs">
                {['all', 'free', 'pro', 'founder'].map((p) => (
                  <button
                    key={p}
                    onClick={() => setPlanFilter(p as any)}
                    className={`rounded-md px-3 py-1.5 font-medium transition-all ${
                      planFilter === p
                        ? 'bg-[var(--accent-primary)] text-white shadow-md'
                        : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                    }`}
                  >
                    <span className="capitalize">{p}</span>
                  </button>
                ))}
              </div>

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="rounded-lg border border-[var(--border)] bg-[var(--bg-secondary)] px-3 py-1.5 text-xs text-[var(--text-secondary)] focus:border-[var(--accent-primary)] focus:outline-none"
              >
                <option value="joined">Sort: Newest</option>
                <option value="ideas">Sort: Ideas Count</option>
                <option value="name">Sort: Name</option>
              </select>
            </div>
          </div>

          {/* Users Table */}
          {loadingUsers ? (
            <div className="space-y-3">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-16 w-full" />
              <Skeleton className="h-16 w-full" />
              <Skeleton className="h-16 w-full" />
            </div>
          ) : processedUsers.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <Users className="mb-4 h-12 w-12 text-[var(--text-muted)]" />
              <p className="font-display text-lg font-semibold text-[var(--text-primary)]">No users found</p>
              <p className="mt-2 max-w-sm text-sm text-[var(--text-secondary)]">
                Try widening your search terms or filter constraints.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm border-collapse">
                <thead>
                  <tr className="border-b border-[var(--border-bright)] text-[var(--text-muted)] text-xs uppercase font-bold tracking-wider">
                    <th className="pb-3 pr-4">User Details</th>
                    <th className="pb-3 px-4">Subscription Plan</th>
                    <th className="pb-3 px-4 text-center">Analyses</th>
                    <th className="pb-3 px-4">Joined Date</th>
                    <th className="pb-3 pl-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border)]">
                  {processedUsers.map((user) => (
                    <tr key={user.id} className="group hover:bg-[rgba(255,255,255,0.01)] transition-all">
                      {/* Name & Email */}
                      <td className="py-4 pr-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[var(--border-bright)] bg-[var(--bg-elevated)] font-bold text-sm text-[var(--accent-primary)]">
                            {(user.name?.[0] || user.email?.[0] || '?').toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <p className="font-bold text-[var(--text-primary)] truncate max-w-[180px]">
                              {user.name}
                            </p>
                            <p className="text-xs text-[var(--text-muted)] truncate max-w-[180px] font-mono mt-0.5">
                              {user.email}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Plan Badge */}
                      <td className="py-4 px-4 align-middle">
                        <div className="flex flex-col items-start gap-1">
                          <Badge
                            variant={
                              user.plan === 'founder'
                                ? 'success'
                                : user.plan === 'pro'
                                ? 'accent'
                                : 'default'
                            }
                            className="capitalize text-[10px] tracking-wide px-2.5 py-0.5 font-semibold"
                          >
                            {user.plan}
                          </Badge>
                          {user.subscription_status === 'active' && (
                            <span className="text-[9px] text-[var(--success)] font-medium flex items-center gap-1">
                              <span className="h-1.5 w-1.5 rounded-full bg-[var(--success)]" /> Active Subscription
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Analyses Count */}
                      <td className="py-4 px-4 align-middle text-center font-mono font-bold text-sm text-[var(--text-secondary)]">
                        {user.ideasCount}
                      </td>

                      {/* Joined Date */}
                      <td className="py-4 px-4 align-middle text-xs text-[var(--text-secondary)]">
                        {new Date(user.created_at).toLocaleDateString(undefined, {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                        })}
                      </td>

                      {/* Actions */}
                      <td className="py-4 pl-4 align-middle text-right">
                        {user.email !== 'admin@ideaforge.com' ? (
                          <div className="flex items-center justify-end gap-2">
                            <button
                              type="button"
                              onClick={() => openEditModal(user)}
                              className="p-2 rounded-lg border border-transparent text-[var(--text-secondary)] transition hover:border-[var(--border-bright)] hover:bg-[var(--bg-secondary)] hover:text-[var(--text-primary)]"
                              aria-label="Edit user"
                            >
                              <Edit2 className="h-4 w-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => setDeleteUser(user)}
                              className="p-2 rounded-lg border border-transparent text-[var(--text-muted)] transition hover:border-[var(--danger)]/30 hover:bg-[var(--danger-bg)] hover:text-[var(--danger)]"
                              aria-label="Delete user"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        ) : (
                          <span className="text-xs text-[var(--text-muted)] italic font-medium pr-3">System Admin</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      )}

      {/* CRUD MODALS */}

      {/* 1. Add User Modal */}
      <Modal open={addUserOpen} onOpenChange={setAddUserOpen} title="Add New Platform User">
        <form onSubmit={handleAddUserSubmit} className="space-y-4 mt-2">
          <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
            Create a new user account in Supabase. The account will be verified and pre-onboarded automatically.
          </p>

          <div>
            <label className="mb-1.5 block text-xs font-semibold text-[var(--text-secondary)] flex items-center gap-1">
              <UserIcon className="h-3 w-3" /> Full Name
            </label>
            <Input
              as="input"
              required
              value={formName}
              onChange={(e) => setFormName(e.target.value)}
              placeholder="e.g. John Doe"
              className="bg-[var(--bg-secondary)] border-[var(--border)] focus:border-[var(--accent-primary)] focus:bg-[var(--bg-elevated)]"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-semibold text-[var(--text-secondary)] flex items-center gap-1">
              <Mail className="h-3 w-3" /> Email Address
            </label>
            <Input
              as="input"
              type="email"
              required
              value={formEmail}
              onChange={(e) => setFormEmail(e.target.value)}
              placeholder="user@example.com"
              className="bg-[var(--bg-secondary)] border-[var(--border)] focus:border-[var(--accent-primary)] focus:bg-[var(--bg-elevated)]"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-semibold text-[var(--text-secondary)] flex items-center gap-1">
              <Lock className="h-3 w-3" /> Password
            </label>
            <Input
              as="input"
              type="password"
              required
              value={formPassword}
              onChange={(e) => setFormPassword(e.target.value)}
              placeholder="Min. 6 characters"
              className="bg-[var(--bg-secondary)] border-[var(--border)] focus:border-[var(--accent-primary)] focus:bg-[var(--bg-elevated)]"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-semibold text-[var(--text-secondary)] flex items-center gap-1">
              <Layers className="h-3 w-3" /> Subscription Tier Plan
            </label>
            <select
              value={formPlan}
              onChange={(e) => setFormPlan(e.target.value as any)}
              className="w-full rounded-[var(--radius)] border border-[var(--border)] bg-[var(--bg-secondary)] px-4 py-3 text-sm text-[var(--text-primary)] focus:border-[var(--accent-primary)] focus:outline-none focus:bg-[var(--bg-elevated)]"
            >
              <option value="free">Free (3 analyses/mo)</option>
              <option value="pro">Pro (15 analyses/mo)</option>
              <option value="founder">Founder (Unlimited analyses)</option>
            </select>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-[var(--border)]">
            <Button type="button" variant="secondary" onClick={() => setAddUserOpen(false)} disabled={actionLoading}>
              Cancel
            </Button>
            <Button type="submit" loading={actionLoading} disabled={actionLoading}>
              Create Account
            </Button>
          </div>
        </form>
      </Modal>

      {/* 2. Edit User Modal */}
      <Modal open={!!editUser} onOpenChange={(v) => !v && setEditUser(null)} title="Update User Account">
        <form onSubmit={handleEditUserSubmit} className="space-y-4 mt-2">
          <p className="text-xs text-[var(--text-secondary)]">
            Update account metadata and subscription level for{' '}
            <span className="font-semibold font-mono text-[var(--accent-primary)]">{editUser?.email}</span>.
          </p>

          <div>
            <label className="mb-1.5 block text-xs font-semibold text-[var(--text-secondary)] flex items-center gap-1">
              <UserIcon className="h-3 w-3" /> Full Name
            </label>
            <Input
              as="input"
              required
              value={formName}
              onChange={(e) => setFormName(e.target.value)}
              placeholder="Full name"
              className="bg-[var(--bg-secondary)] border-[var(--border)] focus:border-[var(--accent-primary)] focus:bg-[var(--bg-elevated)]"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-semibold text-[var(--text-secondary)] flex items-center gap-1">
              <Mail className="h-3 w-3" /> Email Address
            </label>
            <Input
              as="input"
              type="email"
              required
              value={formEmail}
              onChange={(e) => setFormEmail(e.target.value)}
              placeholder="user@example.com"
              className="bg-[var(--bg-secondary)] border-[var(--border)] focus:border-[var(--accent-primary)] focus:bg-[var(--bg-elevated)]"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-semibold text-[var(--text-secondary)] flex items-center gap-1">
              <Layers className="h-3 w-3" /> Subscription Tier Plan
            </label>
            <select
              value={formPlan}
              onChange={(e) => setFormPlan(e.target.value as any)}
              className="w-full rounded-[var(--radius)] border border-[var(--border)] bg-[var(--bg-secondary)] px-4 py-3 text-sm text-[var(--text-primary)] focus:border-[var(--accent-primary)] focus:outline-none focus:bg-[var(--bg-elevated)]"
            >
              <option value="free">Free (3 analyses/mo)</option>
              <option value="pro">Pro (15 analyses/mo)</option>
              <option value="founder">Founder (Unlimited analyses)</option>
            </select>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-[var(--border)]">
            <Button type="button" variant="secondary" onClick={() => setEditUser(null)} disabled={actionLoading}>
              Cancel
            </Button>
            <Button type="submit" loading={actionLoading} disabled={actionLoading}>
              Save Changes
            </Button>
          </div>
        </form>
      </Modal>

      {/* 3. Delete User Modal */}
      <Modal open={!!deleteUser} onOpenChange={(v) => !v && setDeleteUser(null)} title="Delete User Permanently?">
        <div className="space-y-4 mt-2">
          <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
            Are you sure you want to delete <span className="font-semibold text-[var(--text-primary)] font-mono">{deleteUser?.email}</span>?
          </p>
          <div className="rounded-xl border border-[var(--danger)]/30 bg-[var(--danger-bg)] p-3 text-xs text-[var(--danger)] flex items-start gap-2">
            <X className="h-4 w-4 mt-0.5 shrink-0" />
            <div>
              <p className="font-semibold">WARNING: CASCADE DELETION WILL OCCUR</p>
              <p className="mt-1 leading-relaxed">
                This action is irreversible. It deletes the user authentication record, profile data, all{' '}
                <span className="font-bold">{deleteUser?.ideasCount || 0} startup analyses</span> they generated,
                and associated checksheets, slides, and reports.
              </p>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-[var(--border)]">
            <Button type="button" variant="secondary" onClick={() => setDeleteUser(null)} disabled={actionLoading}>
              Cancel
            </Button>
            <Button
              type="button"
              className="bg-[var(--danger)] text-white hover:opacity-90 border-transparent"
              onClick={handleDeleteUserConfirm}
              loading={actionLoading}
              disabled={actionLoading}
            >
              Delete User
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
