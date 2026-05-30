'use client';

import { useEffect, useState } from 'react';
import {
  Users, Briefcase, FileText, HardDrive,
  TrendingUp, ArrowRight, ShieldCheck, Activity,
} from 'lucide-react';
import Link from 'next/link';

type Stats = {
  total_users: number;
  total_offres: number;
  total_candidatures: number;
  total_cvs: number;
  candidatures_par_statut: Record<string, number>;
  top_offres: { titre: string; count: number }[];
};

type UserRow = {
  id: number;
  full_name: string;
  email: string;
  role_id: number | null;
  is_active: boolean;
  created_at: string | null;
};

function getToken() { return localStorage.getItem('access_token'); }

function roleLabel(id: number | null) {
  if (id === 1) return { label: 'Admin',     cls: 'bg-red-50 text-red-700 border-red-200' };
  if (id === 2) return { label: 'Recruteur', cls: 'bg-violet-50 text-violet-700 border-violet-200' };
  return               { label: 'Candidat',  cls: 'bg-blue-50 text-blue-700 border-blue-200' };
}

function initials(name: string) {
  return name.split(' ').map(w => w[0] ?? '').join('').toUpperCase().slice(0, 2) || '?';
}

function useCounter(target: number, ready: boolean) {
  const [v, setV] = useState(0);
  useEffect(() => {
    if (!ready) return;
    let raf: number;
    const start = performance.now();
    const duration = 900;
    const tick = (now: number) => {
      const p = Math.min((now - start) / duration, 1);
      setV(Math.round(p * target));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, ready]);
  return v;
}

export default function AdminDashboard() {
  const [stats, setStats]   = useState<Stats | null>(null);
  const [users, setUsers]   = useState<UserRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = getToken();
    const h = { Authorization: `Bearer ${token}` };
    Promise.all([
      fetch('http://localhost:8000/admin/stats', { headers: h }).then(r => r.json()),
      fetch('http://localhost:8000/admin/users',  { headers: h }).then(r => r.json()),
    ]).then(([s, u]) => {
      setStats(s);
      setUsers(Array.isArray(u) ? u.slice(0, 5) : []);
    }).finally(() => setLoading(false));
  }, []);

  const ready = !loading && stats !== null;
  const c1 = useCounter(stats?.total_users         ?? 0, ready);
  const c2 = useCounter(stats?.total_offres        ?? 0, ready);
  const c3 = useCounter(stats?.total_candidatures  ?? 0, ready);
  const c4 = useCounter(stats?.total_cvs           ?? 0, ready);

  const statCards = [
    { label: 'Utilisateurs',   value: c1, icon: Users,     gradient: 'from-blue-500 to-indigo-600' },
    { label: 'Offres',         value: c2, icon: Briefcase,  gradient: 'from-violet-500 to-purple-600' },
    { label: 'Candidatures',   value: c3, icon: FileText,   gradient: 'from-[#FF6B6B] to-rose-600' },
    { label: 'CVs uploadés',   value: c4, icon: HardDrive,  gradient: 'from-emerald-500 to-teal-600' },
  ];

  const statuts = stats?.candidatures_par_statut ?? {};
  const totalStatuts = Object.values(statuts).reduce((a, b) => a + b, 0) || 1;
  const statutBars = [
    { label: 'En attente', key: 'en_attente', color: 'bg-amber-400' },
    { label: 'Retenus',    key: 'retenu',     color: 'bg-emerald-500' },
    { label: 'Rejetés',    key: 'rejete',     color: 'bg-red-400' },
  ];

  return (
    <div className="p-6 space-y-5 bg-gradient-to-br from-slate-50 to-violet-50/30 min-h-full">

      {/* Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#0D3349] via-[#1a2d45] to-[#0D3349] p-7 text-white">
        <div className="absolute top-0 right-0 w-80 h-80 bg-violet-500/20 rounded-full -translate-y-1/3 translate-x-1/4 blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <ShieldCheck size={15} className="text-emerald-400" />
              <p className="text-emerald-400 text-sm font-medium">Accès administrateur</p>
            </div>
            <h1 className="text-2xl font-bold">Plateforme DIGITELX</h1>
            {!loading && stats && (
              <p className="text-white/60 text-sm mt-1">
                <span className="text-white font-medium">{stats.total_users} utilisateurs</span>
                {' · '}
                <span className="text-white font-medium">{stats.total_candidatures} candidatures</span>
              </p>
            )}
          </div>
          <div className="flex items-center gap-2 px-4 py-2.5 bg-emerald-500/20 border border-emerald-500/30 rounded-xl flex-shrink-0">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-emerald-300 text-sm font-medium">Système actif</span>
          </div>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((s, i) => {
          const Icon = s.icon;
          return (
            <div key={i} className="relative overflow-hidden rounded-2xl p-5 hover:scale-[1.02] transition-transform">
              <div className={`absolute inset-0 bg-gradient-to-br ${s.gradient}`} />
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-3">
                  <div className="w-9 h-9 bg-white/25 rounded-xl flex items-center justify-center">
                    <Icon size={18} className="text-white" />
                  </div>
                  <TrendingUp size={13} className="text-white/40" />
                </div>
                <p className="text-3xl font-bold text-white">
                  {loading ? '—' : s.value.toLocaleString()}
                </p>
                <p className="text-white/80 text-sm font-medium mt-0.5">{s.label}</p>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">

        {/* Utilisateurs récents */}
        <div className="lg:col-span-3 bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
            <div className="flex items-center gap-2">
              <Activity size={15} className="text-blue-500" />
              <h2 className="font-semibold text-gray-900">Derniers inscrits</h2>
            </div>
            <Link href="/admin/utilisateurs" className="flex items-center gap-1 text-[#FF6B6B] text-sm font-medium hover:gap-2 transition-all">
              Gérer <ArrowRight size={14} />
            </Link>
          </div>
          {loading ? (
            <div className="p-8 text-center text-gray-400 text-sm">Chargement…</div>
          ) : users.length === 0 ? (
            <div className="p-8 text-center text-gray-400 text-sm">Aucun utilisateur</div>
          ) : (
            <div className="divide-y divide-gray-50">
              {users.map(u => {
                const role = roleLabel(u.role_id);
                return (
                  <div key={u.id} className="flex items-center gap-4 px-6 py-3.5 hover:bg-gray-50/70 transition-colors">
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#0D3349] to-[#1a4a6b] flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                      {initials(u.full_name)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-900 text-sm truncate">{u.full_name}</p>
                      <p className="text-gray-400 text-xs truncate">{u.email}</p>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${role.cls}`}>{role.label}</span>
                      <span className={`w-2 h-2 rounded-full ${u.is_active ? 'bg-emerald-400' : 'bg-gray-300'}`} title={u.is_active ? 'Actif' : 'Inactif'} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Candidatures par statut */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <h2 className="font-semibold text-gray-900 mb-5">Candidatures par statut</h2>
          {loading ? (
            <div className="text-gray-400 text-sm text-center py-8">Chargement…</div>
          ) : (
            <div className="space-y-4">
              {statutBars.map(b => {
                const count = statuts[b.key] ?? 0;
                const pct = Math.round((count / totalStatuts) * 100);
                return (
                  <div key={b.key}>
                    <div className="flex justify-between mb-1.5">
                      <span className="text-sm text-gray-600 font-medium">{b.label}</span>
                      <span className="text-sm font-bold text-gray-900">{count}</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                      <div className={`h-full rounded-full ${b.color} transition-all duration-700`} style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          <div className="mt-6 pt-5 border-t border-gray-100">
            <Link href="/admin/candidatures" className="flex items-center gap-1 text-[#FF6B6B] text-sm font-medium hover:gap-2 transition-all">
              Voir toutes <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
