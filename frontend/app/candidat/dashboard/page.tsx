'use client';

import { useEffect, useState } from 'react';
import {
  Briefcase, Clock, Brain, TrendingUp, MapPin,
  ArrowRight, Zap, AlertCircle, CheckCircle, XCircle, Star,
} from 'lucide-react';
import Link from 'next/link';

type Candidature = {
  id: number;
  offre_id: number;
  statut: string;
  date_depot: string;
  offre?: { id: number; title: string } | null;
};

function getToken() { return localStorage.getItem('access_token'); }

function useCounter(target: number, delay = 0) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    const timeout = setTimeout(() => {
      const steps = 50;
      const inc   = target / steps;
      let cur     = 0;
      interval = setInterval(() => {
        cur += inc;
        if (cur >= target) { setValue(target); clearInterval(interval); }
        else setValue(Math.round(cur));
      }, 1200 / steps);
    }, delay);
    return () => { clearTimeout(timeout); clearInterval(interval); };
  }, [target, delay]);
  return value;
}

type StatusEntry = { label: string; cls: string; dot: string; Icon: React.ElementType };

const STATUS_MAP: Record<string, StatusEntry> = {
  en_attente: { label: 'En attente', cls: 'bg-amber-50 text-amber-700 border-amber-200',      dot: 'bg-amber-500',   Icon: AlertCircle },
  retenu:     { label: 'Retenu',     cls: 'bg-emerald-50 text-emerald-700 border-emerald-200', dot: 'bg-emerald-500', Icon: CheckCircle },
  rejete:     { label: 'Rejeté',     cls: 'bg-red-50 text-red-700 border-red-200',             dot: 'bg-red-500',     Icon: XCircle },
  'rejeté':   { label: 'Rejeté',     cls: 'bg-red-50 text-red-700 border-red-200',             dot: 'bg-red-500',     Icon: XCircle },
};

function statusCfg(statut: string): StatusEntry {
  return STATUS_MAP[statut.toLowerCase()] ?? {
    label: statut, cls: 'bg-gray-100 text-gray-600 border-gray-200', dot: 'bg-gray-400', Icon: AlertCircle,
  };
}

const recs = [
  { title: 'Full Stack Engineer', company: 'InnovateTech', location: 'Casablanca', match: 94 },
  { title: 'Lead Developer',      company: 'DigitalFirst',  location: 'Rabat',       match: 89 },
  { title: 'React Developer',     company: 'WebStudio',     location: 'Casablanca', match: 85 },
];

export default function CandidatDashboard() {
  const [userName, setUserName]         = useState('');
  const [candidatures, setCandidatures] = useState<Candidature[]>([]);
  const [fetchError, setFetchError]     = useState('');
  const [mounted, setMounted]           = useState(false);

  useEffect(() => {
    setMounted(true);
    try {
      const raw = localStorage.getItem('user');
      if (raw) {
        const u = JSON.parse(raw);
        setUserName(u.full_name ?? u.name ?? '');
      }
    } catch { /* ignore */ }

    fetch('http://localhost:8000/candidatures/mes-candidatures', {
      headers: { Authorization: `Bearer ${getToken()}` },
    })
      .then(r => r.ok ? r.json() : Promise.reject(r.status))
      .then((data: Candidature[]) => setCandidatures(data))
      .catch(() => setFetchError('Impossible de charger les données.'));
  }, []);

  const total     = candidatures.length;
  const enAttente = candidatures.filter(c => c.statut.toLowerCase() === 'en_attente').length;
  const retenu    = candidatures.filter(c => c.statut.toLowerCase() === 'retenu').length;
  const recent    = [...candidatures]
    .sort((a, b) => new Date(b.date_depot).getTime() - new Date(a.date_depot).getTime())
    .slice(0, 3);

  const vTotal     = useCounter(total,     200);
  const vEnAttente = useCounter(enAttente, 300);
  const vRetenu    = useCounter(retenu,    400);

  const stats = [
    { label: 'Candidatures', display: String(vTotal),     gradient: 'from-blue-500 to-indigo-600',    icon: Briefcase,   trend: 'Total soumises' },
    { label: 'En attente',   display: String(vEnAttente), gradient: 'from-amber-400 to-orange-500',   icon: Clock,       trend: 'En cours de traitement' },
    { label: 'Retenues',     display: String(vRetenu),    gradient: 'from-emerald-400 to-teal-500',   icon: CheckCircle, trend: 'Sélectionnées' },
    { label: 'Score CV',     display: '—',               gradient: 'from-[#FF6B6B] to-rose-600',     icon: Brain,       trend: 'IA non disponible' },
  ];

  return (
    <>
      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .fu { animation: fadeUp 0.5s cubic-bezier(.16,1,.3,1) forwards; opacity: 0; }
      `}</style>

      <div className="p-6 space-y-5 bg-gradient-to-br from-slate-50 to-blue-50/40 min-h-full">

        {/* Welcome Banner */}
        <div className="fu relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#0D3349] via-[#14527a] to-[#0D3349] p-7 text-white" style={{ animationDelay: '0ms' }}>
          <div className="absolute top-0 right-0 w-72 h-72 bg-[#FF6B6B]/20 rounded-full -translate-y-1/3 translate-x-1/4 blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-1/3 w-48 h-48 bg-blue-400/20 rounded-full translate-y-1/2 blur-2xl pointer-events-none" />
          <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <p className="text-white/60 text-sm mb-1">Bienvenue de retour 👋</p>
              <h1 className="text-2xl font-bold">{userName || 'Candidat'}</h1>
              <p className="text-white/60 text-sm mt-1">
                {total > 0
                  ? <>{total} candidature{total > 1 ? 's' : ''} soumise{total > 1 ? 's' : ''} · <span className="text-[#FF6B6B] font-semibold">{enAttente} en attente</span></>
                  : 'Explorez les offres disponibles et postulez !'}
              </p>
            </div>
            <Link
              href="/candidat/profil"
              className="flex-shrink-0 flex items-center gap-2 px-5 py-2.5 bg-white/15 hover:bg-white/25 border border-white/20 rounded-xl text-sm font-medium transition-all"
            >
              Voir mon profil <ArrowRight size={14} />
            </Link>
          </div>
        </div>

        {/* Error */}
        {fetchError && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">{fetchError}</div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((s, i) => {
            const Icon = s.icon;
            return (
              <div
                key={i}
                className="fu relative overflow-hidden rounded-2xl p-5 hover:scale-[1.03] hover:shadow-lg transition-all duration-200 cursor-default"
                style={{ animationDelay: `${80 + i * 70}ms` }}
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${s.gradient}`} />
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-9 h-9 bg-white/25 rounded-xl flex items-center justify-center backdrop-blur-sm">
                      <Icon size={18} className="text-white" />
                    </div>
                    <TrendingUp size={13} className="text-white/50" />
                  </div>
                  <p className="text-3xl font-bold text-white">{s.display}</p>
                  <p className="text-white/80 text-sm font-medium mt-0.5">{s.label}</p>
                  <p className="text-white/55 text-xs mt-1">{s.trend}</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

          {/* Recent Candidatures */}
          <div className="fu lg:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden" style={{ animationDelay: '380ms' }}>
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h2 className="font-semibold text-gray-900">Mes candidatures</h2>
              <Link href="/candidat/candidatures" className="flex items-center gap-1 text-[#FF6B6B] text-sm font-medium hover:gap-2 transition-all">
                Tout voir <ArrowRight size={14} />
              </Link>
            </div>

            {recent.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-gray-400">
                <Briefcase size={32} className="mb-2 opacity-30" />
                <p className="text-sm">Aucune candidature pour l'instant</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-50">
                {recent.map((c, i) => {
                  const cfg = statusCfg(c.statut);
                  const StatusIcon = cfg.Icon;
                  return (
                    <div
                      key={c.id}
                      className="fu flex items-center gap-4 px-6 py-4 hover:bg-gray-50/70 transition-colors"
                      style={{ animationDelay: `${460 + i * 70}ms` }}
                    >
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#0D3349] to-[#1a5276] flex items-center justify-center flex-shrink-0">
                        <Briefcase size={15} className="text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-gray-900 text-sm truncate">
                          {c.offre?.title ?? `Offre #${c.offre_id}`}
                        </p>
                        <p className="text-gray-400 text-xs mt-0.5">
                          {new Date(c.date_depot).toLocaleDateString('fr-FR')}
                        </p>
                      </div>
                      <span className={`flex-shrink-0 flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${cfg.cls}`}>
                        <StatusIcon size={11} />
                        {cfg.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* AI Matches */}
          <div className="fu bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden" style={{ animationDelay: '440ms' }}>
            <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-2">
              <div className="w-6 h-6 bg-gradient-to-br from-[#FF6B6B] to-rose-500 rounded-lg flex items-center justify-center">
                <Zap size={12} className="text-white" />
              </div>
              <h2 className="font-semibold text-gray-900">Offres IA</h2>
            </div>
            <div className="p-4 space-y-3">
              {recs.map((r, i) => (
                <div
                  key={i}
                  className="fu p-3.5 rounded-xl border border-gray-100 hover:border-[#FF6B6B]/40 hover:bg-rose-50/40 transition-all cursor-pointer"
                  style={{ animationDelay: `${520 + i * 70}ms` }}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="font-semibold text-gray-900 text-sm truncate">{r.title}</p>
                      <p className="text-gray-500 text-xs mt-0.5">{r.company}</p>
                      <div className="flex items-center gap-1 mt-1">
                        <MapPin size={9} className="text-gray-400" />
                        <span className="text-gray-400 text-xs">{r.location}</span>
                      </div>
                    </div>
                    <div className="flex-shrink-0 text-right">
                      <span className="text-xl font-bold text-emerald-600">{r.match}%</span>
                      <p className="text-xs text-gray-400">match</p>
                    </div>
                  </div>
                  <div className="mt-2.5 w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-emerald-400 to-teal-500 rounded-full transition-all duration-1000 ease-out"
                      style={{ width: mounted ? `${r.match}%` : '0%', transitionDelay: `${600 + i * 100}ms` }}
                    />
                  </div>
                </div>
              ))}
              <Link
                href="/candidat/offres"
                className="flex items-center justify-center gap-2 w-full py-2.5 mt-1 rounded-xl border border-dashed border-gray-200 text-gray-400 hover:border-[#FF6B6B] hover:text-[#FF6B6B] text-sm font-medium transition-all"
              >
                <Star size={13} /> Voir plus d&apos;offres
              </Link>
            </div>
          </div>

        </div>
      </div>
    </>
  );
}
