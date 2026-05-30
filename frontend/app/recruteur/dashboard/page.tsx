'use client';

import { useEffect, useState } from 'react';
import {
  Briefcase, Users, Clock, CheckCircle, TrendingUp,
  ArrowRight, Plus, BarChart2,
} from 'lucide-react';
import Link from 'next/link';

function useCounter(target: number, delay = 0) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    const timeout = setTimeout(() => {
      const steps = 50;
      const inc = target / steps;
      let cur = 0;
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


function getToken() {
  return localStorage.getItem('access_token');
}

export default function RecruteurDashboard() {
  type OffreAPI = { id: number; title: string; statut: string; nombre_postes: number };
  type CandidatureAPI = { id: number; offre_id: number; statut: string; date_depot: string; user?: { id: number; full_name: string } };
  type DashOffre = { title: string; nombre_postes: number; candidateCount: number; progress: number };

  const [mounted, setMounted] = useState(false);
  const [offresActives, setOffresActives] = useState(0);
  const [totalCandidatures, setTotalCandidatures] = useState(0);
  const [enAttente, setEnAttente] = useState(0);
  const [retenues, setRetenues] = useState(0);
  const [dashOffres, setDashOffres] = useState<DashOffre[]>([]);
  const [dashCandidatures, setDashCandidatures] = useState<(CandidatureAPI & { offreTitle: string })[]>([]);
  const [fetchError, setFetchError] = useState('');

  useEffect(() => { const t = setTimeout(() => setMounted(true), 100); return () => clearTimeout(t); }, []);

  useEffect(() => {
    async function fetchStats() {
      try {
        const headers = { 'Authorization': `Bearer ${getToken()}` };

        const offresRes = await fetch('http://localhost:8000/offres/mes-offres', { headers });
        if (!offresRes.ok) {
          const err = await offresRes.json().catch(() => ({}));
          setFetchError(err.detail ?? `Erreur ${offresRes.status}`);
          return;
        }
        const offres: OffreAPI[] = await offresRes.json();

        setOffresActives(offres.filter(o => o.statut === 'active').length);

        const perOffre: CandidatureAPI[][] = await Promise.all(
          offres.map(o =>
            fetch(`http://localhost:8000/candidatures/offre/${o.id}`, { headers })
              .then(r => r.ok ? r.json() : [])
          )
        );

        const candidatures = perOffre.flat();
        setTotalCandidatures(candidatures.length);
        setEnAttente(candidatures.filter(c => c.statut === 'en_attente').length);
        setRetenues(candidatures.filter(c => c.statut === 'retenu').length);

        setDashOffres(
          offres
            .filter(o => o.statut === 'active')
            .slice(0, 5)
            .map((o) => {
              const count = perOffre[offres.indexOf(o)]?.length ?? 0;
              return {
                title: o.title,
                nombre_postes: o.nombre_postes,
                candidateCount: count,
                progress: Math.min(Math.round((count / Math.max(o.nombre_postes, 1)) * 100), 100),
              };
            })
        );

        const recent = candidatures
          .slice()
          .sort((a, b) => new Date(b.date_depot).getTime() - new Date(a.date_depot).getTime())
          .slice(0, 5)
          .map(c => ({
            ...c,
            offreTitle: offres.find(o => o.id === c.offre_id)?.title ?? '—',
          }));
        setDashCandidatures(recent);
      } catch (e) {
        setFetchError('Impossible de contacter le serveur. Vérifiez que le backend est démarré.');
      }
    }
    fetchStats();
  }, []);

  const v1 = useCounter(offresActives, 200);
  const v2 = useCounter(totalCandidatures, 300);
  const v3 = useCounter(enAttente, 400);
  const v4 = useCounter(retenues, 500);

  const stats = [
    { label: 'Offres actives', value: v1, suffix: '', gradient: 'from-blue-500 to-indigo-600', icon: Briefcase, trend: 'Mes offres publiées' },
    { label: 'Candidatures', value: v2, suffix: '', gradient: 'from-[#FF6B6B] to-rose-600', icon: Users, trend: 'Total reçues' },
    { label: 'En attente', value: v3, suffix: '', gradient: 'from-amber-400 to-orange-500', icon: Clock, trend: 'À traiter' },
    { label: 'Retenues', value: v4, suffix: '', gradient: 'from-emerald-500 to-teal-600', icon: CheckCircle, trend: 'Candidatures retenues' },
  ];

  const statutCls: Record<string, string> = {
    'en_attente': 'bg-amber-50 text-amber-700 border-amber-200',
    'retenu':     'bg-emerald-50 text-emerald-700 border-emerald-200',
    'refusé':     'bg-red-50 text-red-700 border-red-200',
  };

  return (
    <>
      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .fu { animation: fadeUp 0.5s cubic-bezier(.16,1,.3,1) forwards; opacity: 0; }
      `}</style>

      <div className="p-6 space-y-5 bg-gradient-to-br from-slate-50 to-indigo-50/30 min-h-full">

        {/* Welcome Banner */}
        <div className="fu relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#0D3349] via-[#1a3d5c] to-[#0D3349] p-7 text-white" style={{ animationDelay: '0ms' }}>
          <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-500/20 rounded-full -translate-y-1/3 translate-x-1/4 blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-1/4 w-56 h-56 bg-[#FF6B6B]/15 rounded-full translate-y-1/2 blur-2xl pointer-events-none" />
          <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <p className="text-white/60 text-sm mb-1">Espace recruteur 🏢</p>
              <h1 className="text-2xl font-bold">Tableau de bord</h1>
              <p className="text-white/60 text-sm mt-1">
                <span className="text-emerald-400 font-semibold">{retenues} candidature{retenues !== 1 ? 's' : ''} retenue{retenues !== 1 ? 's' : ''}</span> — continuez sur cette lancée
              </p>
            </div>
            <div className="flex items-center gap-3 flex-shrink-0">
              <Link
                href="/recruteur/gestion-offres"
                className="flex items-center gap-2 px-5 py-2.5 bg-[#FF6B6B] hover:bg-rose-500 rounded-xl text-sm font-semibold transition-all"
              >
                <Plus size={15} /> Nouvelle offre
              </Link>
            </div>
          </div>
        </div>

        {/* Error */}
        {fetchError && (
          <div className="fu p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm" style={{ animationDelay: '60ms' }}>
            {fetchError}
          </div>
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
                  <p className="text-3xl font-bold text-white">{s.value}{s.suffix}</p>
                  <p className="text-white/80 text-sm font-medium mt-0.5">{s.label}</p>
                  <p className="text-white/55 text-xs mt-1">{s.trend}</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">

          {/* Active Offers */}
          <div className="fu lg:col-span-3 bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden" style={{ animationDelay: '380ms' }}>
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <BarChart2 size={16} className="text-indigo-500" />
                <h2 className="font-semibold text-gray-900">Offres actives</h2>
              </div>
              <Link href="/recruteur/gestion-offres" className="flex items-center gap-1 text-[#FF6B6B] text-sm font-medium hover:gap-2 transition-all">
                Gérer <ArrowRight size={14} />
              </Link>
            </div>
            <div className="divide-y divide-gray-50">
              {dashOffres.length === 0 ? (
                <p className="px-6 py-8 text-center text-gray-400 text-sm">Aucune offre active</p>
              ) : dashOffres.map((offer, i) => (
                <div
                  key={i}
                  className="fu px-6 py-4 hover:bg-gray-50/70 transition-colors"
                  style={{ animationDelay: `${460 + i * 70}ms` }}
                >
                  <div className="flex items-center justify-between mb-2">
                    <p className="font-semibold text-gray-900 text-sm">{offer.title}</p>
                    <div className="flex items-center gap-5 text-right">
                      <div>
                        <p className="text-lg font-bold text-gray-900">{offer.candidateCount}</p>
                        <p className="text-xs text-gray-400">candidats</p>
                      </div>
                      <div>
                        <p className="text-lg font-bold text-gray-900">{offer.nombre_postes}</p>
                        <p className="text-xs text-gray-400">postes</p>
                      </div>
                    </div>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-indigo-400 to-blue-500 rounded-full transition-all duration-1000 ease-out"
                      style={{ width: mounted ? `${offer.progress}%` : '0%', transitionDelay: `${500 + i * 100}ms` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Candidatures récentes */}
          <div className="fu lg:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden" style={{ animationDelay: '440ms' }}>
            <div className="flex items-center gap-2 px-6 py-4 border-b border-gray-100">
              <div className="w-6 h-6 bg-gradient-to-br from-[#FF6B6B] to-rose-500 rounded-lg flex items-center justify-center">
                <Users size={12} className="text-white" />
              </div>
              <h2 className="font-semibold text-gray-900">Candidatures récentes</h2>
            </div>
            <div className="divide-y divide-gray-50">
              {dashCandidatures.length === 0 ? (
                <p className="px-6 py-8 text-center text-gray-400 text-sm">Aucune candidature reçue</p>
              ) : dashCandidatures.map((c, i) => {
                const initials = (c.user?.full_name ?? '?')
                  .split(' ').map((w: string) => w[0] ?? '').join('').toUpperCase().slice(0, 2);
                return (
                  <div
                    key={c.id}
                    className="fu flex items-center gap-3 px-5 py-3.5 hover:bg-gray-50/70 transition-colors"
                    style={{ animationDelay: `${520 + i * 70}ms` }}
                  >
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#0D3349] to-[#1a5276] flex items-center justify-center flex-shrink-0">
                      <span className="text-white text-xs font-bold">{initials}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-900 text-sm truncate">{c.user?.full_name ?? `Candidat #${c.user?.id ?? c.id}`}</p>
                      <p className="text-gray-400 text-xs truncate">{c.offreTitle}</p>
                    </div>
                    <span className={`flex-shrink-0 px-2 py-0.5 rounded-full text-xs border ${statutCls[c.statut] ?? 'bg-gray-50 text-gray-500 border-gray-200'}`}>
                      {c.statut.replace('_', ' ')}
                    </span>
                  </div>
                );
              })}
            </div>
            <div className="px-5 py-3 border-t border-gray-100">
              <Link
                href="/recruteur/gestion-offres"
                className="flex items-center justify-center gap-2 text-sm text-gray-500 hover:text-[#FF6B6B] font-medium transition-colors"
              >
                Gérer les offres <ArrowRight size={14} />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
