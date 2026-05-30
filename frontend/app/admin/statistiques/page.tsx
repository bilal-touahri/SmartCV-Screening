'use client';

import { useEffect, useState } from 'react';
import { Loader2, AlertCircle, Users, Briefcase, FileText, HardDrive, TrendingUp, PieChart as PieIcon, BarChart2, Award } from 'lucide-react';
import {
  BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from 'recharts';

type Stats = {
  total_users: number;
  total_offres: number;
  total_candidatures: number;
  total_cvs: number;
  candidatures_par_statut: Record<string, number>;
  top_offres: { titre: string; count: number }[];
  users_par_role: Record<string, number>;
};

type CandRow = { id: number; score_globale: number | null };

function getToken() { return localStorage.getItem('access_token'); }

const STATUT_COLORS: Record<string, string> = {
  en_attente: '#f59e0b',
  retenu:     '#22c55e',
  rejete:     '#ef4444',
  'rejeté':   '#ef4444',
};
const ROLE_LABELS: Record<string, string> = {
  '1': 'Admin', '2': 'Recruteurs', '3': 'Candidats',
};
const ROLE_COLORS = ['#FF6B6B', '#8b5cf6', '#3b82f6', '#10b981'];

/* ── KPI card ────────────────────────────────────────────────── */
function KpiCard({
  label, value, sub, gradient, icon: Icon,
}: {
  label: string; value: number; sub?: string;
  gradient: string; icon: React.ElementType;
}) {
  return (
    <div className={`relative overflow-hidden rounded-2xl p-5 ${gradient} text-white shadow-md`}>
      <div className="absolute -top-4 -right-4 w-24 h-24 bg-white/10 rounded-full blur-xl pointer-events-none" />
      <div className="relative z-10">
        <div className="flex items-start justify-between mb-3">
          <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
            <Icon size={20} className="text-white" />
          </div>
          <TrendingUp size={14} className="text-white/40 mt-1" />
        </div>
        <p className="text-3xl font-extrabold tracking-tight">{value.toLocaleString()}</p>
        <p className="text-white/80 text-sm font-medium mt-0.5">{label}</p>
        {sub && <p className="text-white/50 text-xs mt-0.5">{sub}</p>}
      </div>
    </div>
  );
}

/* ── Chart wrapper ───────────────────────────────────────────── */
function ChartCard({
  title, badge, icon: Icon, iconColor, children,
}: {
  title: string; badge?: string; icon: React.ElementType;
  iconColor: string; children: React.ReactNode;
}) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-50">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${iconColor}18` }}>
            <Icon size={14} style={{ color: iconColor }} />
          </div>
          <h2 className="font-semibold text-gray-900 text-sm">{title}</h2>
        </div>
        {badge && (
          <span className="px-2.5 py-0.5 bg-slate-100 text-slate-500 text-xs font-semibold rounded-full">
            {badge}
          </span>
        )}
      </div>
      <div className="p-6">{children}</div>
    </div>
  );
}

/* ── Custom tooltip ──────────────────────────────────────────── */
function CustomTooltip({ active, payload, label }: { active?: boolean; payload?: {value: number; name: string}[]; label?: string }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-[#0D3349] text-white px-3 py-2 rounded-xl shadow-xl text-xs">
      {label && <p className="font-semibold mb-1 text-white/70">{label}</p>}
      {payload.map((p, i) => (
        <p key={i} className="font-bold">{p.value}</p>
      ))}
    </div>
  );
}

/* ── Page ────────────────────────────────────────────────────── */
export default function AdminStatistiques() {
  const [stats, setStats]     = useState<Stats | null>(null);
  const [cands, setCands]     = useState<CandRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState('');
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    const token = getToken();
    if (!token) {
      setError('Aucun token — connectez-vous avec le compte admin.');
      setLoading(false);
      return;
    }
    const h = { Authorization: `Bearer ${token}` };

    Promise.all([
      fetch('http://localhost:8000/admin/stats',        { headers: h }),
      fetch('http://localhost:8000/admin/candidatures', { headers: h }),
    ])
      .then(async ([r1, r2]) => {
        if (!r1.ok) {
          const body = await r1.json().catch(() => ({}));
          throw new Error(body.detail ?? `Erreur HTTP ${r1.status}`);
        }
        const s: Stats = await r1.json();
        setStats({
          total_users:              s.total_users        ?? 0,
          total_offres:             s.total_offres       ?? 0,
          total_candidatures:       s.total_candidatures ?? 0,
          total_cvs:                s.total_cvs          ?? 0,
          candidatures_par_statut:  s.candidatures_par_statut ?? {},
          top_offres:               s.top_offres             ?? [],
          users_par_role:           s.users_par_role         ?? {},
        });
        const cData = r2.ok ? await r2.json() : [];
        setCands(Array.isArray(cData) ? cData : []);
      })
      .catch(e => setError(e.message ?? 'Erreur de chargement'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="flex items-center justify-center min-h-full p-6 text-gray-400 gap-2">
      <Loader2 size={22} className="animate-spin" /> Chargement…
    </div>
  );

  if (error || !stats) return (
    <div className="p-6">
      <div className="flex items-center gap-3 p-5 bg-red-50 border border-red-200 rounded-2xl text-red-600 max-w-lg">
        <AlertCircle size={20} className="flex-shrink-0" />
        <div>
          <p className="font-semibold">Impossible de charger les statistiques</p>
          <p className="text-sm mt-0.5 text-red-500">{error || 'Vérifiez que le backend est démarré.'}</p>
        </div>
      </div>
    </div>
  );

  /* ── Données ── */
  const statutData = Object.entries(stats.candidatures_par_statut)
    .map(([name, value]) => ({ name, value, fill: STATUT_COLORS[name] ?? '#94a3b8' }));

  const topOffresData = (stats.top_offres ?? []).map(o => ({
    name: o.titre.length > 16 ? o.titre.slice(0, 16) + '…' : o.titre,
    candidatures: o.count,
  }));

  const rolesData = Object.entries(stats.users_par_role ?? {}).map(([roleId, count]) => ({
    name: ROLE_LABELS[roleId] ?? `Rôle ${roleId}`,
    value: count,
  }));

  const scored = cands.filter(c => c.score_globale != null).map(c => c.score_globale as number);
  const scoreDist = [
    { range: '0–25',   count: scored.filter(s => s < 25).length,             fill: '#ef4444' },
    { range: '25–50',  count: scored.filter(s => s >= 25 && s < 50).length,  fill: '#f59e0b' },
    { range: '50–75',  count: scored.filter(s => s >= 50 && s < 75).length,  fill: '#3b82f6' },
    { range: '75–100', count: scored.filter(s => s >= 75).length,            fill: '#22c55e' },
  ];

  const avgScore = scored.length > 0
    ? Math.round(scored.reduce((a, b) => a + b, 0) / scored.length)
    : 0;

  return (
    <div className="p-6 space-y-6 bg-gradient-to-br from-slate-50 via-white to-indigo-50/20 min-h-full">

      {/* ── Header ── */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#0D3349] via-[#1a3a55] to-[#0D3349] p-6 text-white">
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/15 rounded-full -translate-y-1/2 translate-x-1/3 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/4 w-48 h-48 bg-[#FF6B6B]/10 rounded-full translate-y-1/2 blur-2xl pointer-events-none" />
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-xl font-bold">Tableau de bord analytique</h1>
            <p className="text-white/55 text-sm mt-0.5">Vue globale de la plateforme DIGITELX</p>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-500/20 border border-emerald-500/30 rounded-xl w-fit">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-emerald-300 text-xs font-medium">Données en direct</span>
          </div>
        </div>
      </div>

      {/* ── KPIs ── */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        <KpiCard label="Utilisateurs"    value={stats.total_users}        gradient="bg-gradient-to-br from-blue-500 to-indigo-600"   icon={Users} />
        <KpiCard label="Offres publiées" value={stats.total_offres}       gradient="bg-gradient-to-br from-violet-500 to-purple-600"  icon={Briefcase} />
        <KpiCard label="Candidatures"    value={stats.total_candidatures} gradient="bg-gradient-to-br from-[#FF6B6B] to-rose-600"     icon={FileText} />
        <KpiCard label="CVs uploadés"    value={stats.total_cvs}          gradient="bg-gradient-to-br from-emerald-500 to-teal-600"   icon={HardDrive}
          sub={scored.length > 0 ? `Score moyen : ${avgScore}/100` : undefined} />
      </div>

      {/* ── Graphiques ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

        {/* Top offres */}
        <ChartCard title="Candidatures par offre" badge="top 6" icon={BarChart2} iconColor="#FF6B6B">
          {topOffresData.length === 0 ? (
            <p className="text-gray-400 text-sm text-center py-10">Aucune donnée</p>
          ) : mounted ? (
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={topOffresData} margin={{ left: -20, right: 8 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: '#f8fafc' }} />
                <Bar dataKey="candidatures" fill="#FF6B6B" radius={[6, 6, 0, 0]} name="Candidatures" maxBarSize={40} />
              </BarChart>
            </ResponsiveContainer>
          ) : null}
        </ChartCard>

        {/* Statuts */}
        <ChartCard title="Statuts des candidatures" icon={PieIcon} iconColor="#8b5cf6">
          {statutData.length === 0 ? (
            <p className="text-gray-400 text-sm text-center py-10">Aucune candidature</p>
          ) : mounted ? (
            <div className="flex items-center gap-4">
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie data={statutData} cx="50%" cy="50%"
                    innerRadius={50} outerRadius={80}
                    paddingAngle={3} dataKey="value"
                  >
                    {statutData.map((entry, i) => <Cell key={i} fill={entry.fill} stroke="transparent" />)}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-2.5 shrink-0 pr-2">
                {statutData.map((s, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: s.fill }} />
                    <span className="text-xs text-gray-500 capitalize">{String(s.name).replace('_', ' ')}</span>
                    <span className="text-xs font-bold text-gray-800 ml-auto pl-3">{s.value}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : null}
        </ChartCard>

        {/* Scores */}
        <ChartCard
          title="Distribution des scores IA"
          badge={scored.length > 0 ? `${scored.length} scorées` : undefined}
          icon={Award}
          iconColor="#3b82f6"
        >
          {scored.length === 0 ? (
            <p className="text-gray-400 text-sm text-center py-10">Aucun score disponible</p>
          ) : mounted ? (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={scoreDist} margin={{ left: -20, right: 8 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="range" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: '#f8fafc' }} />
                <Bar dataKey="count" radius={[6, 6, 0, 0]} name="Candidatures" maxBarSize={48}>
                  {scoreDist.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : null}
        </ChartCard>

        {/* Rôles */}
        <ChartCard title="Utilisateurs par rôle" icon={Users} iconColor="#10b981">
          {rolesData.length === 0 ? (
            <p className="text-gray-400 text-sm text-center py-10">Aucune donnée</p>
          ) : mounted ? (
            <div className="flex items-center gap-4">
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie data={rolesData} cx="50%" cy="50%"
                    innerRadius={50} outerRadius={80}
                    paddingAngle={3} dataKey="value"
                  >
                    {rolesData.map((_, i) => (
                      <Cell key={i} fill={ROLE_COLORS[i % ROLE_COLORS.length]} stroke="transparent" />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-2.5 shrink-0 pr-2">
                {rolesData.map((r, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: ROLE_COLORS[i % ROLE_COLORS.length] }} />
                    <span className="text-xs text-gray-500">{r.name}</span>
                    <span className="text-xs font-bold text-gray-800 ml-auto pl-3">{r.value}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : null}
        </ChartCard>

      </div>
    </div>
  );
}
