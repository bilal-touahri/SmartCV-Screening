'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Eye, ArrowLeft, TrendingUp, BarChart2, Clock } from 'lucide-react';

type Candidature = {
  id: number;
  offre_id: number;
  statut: string;
  date_depot: string;
  user?: { id: number; full_name: string } | null;
};

type Score = {
  score_globale: number;
  score_competences: number;
  rang: number | null;
};

type Row = Candidature & { score: Score | null; scoreLoaded: boolean };

const STATUT_CLS: Record<string, string> = {
  en_attente: 'bg-amber-50 text-amber-700 border-amber-200',
  retenu:     'bg-emerald-50 text-emerald-700 border-emerald-200',
  rejete:     'bg-red-50 text-red-700 border-red-200',
  'rejeté':   'bg-red-50 text-red-700 border-red-200',
};

function getToken() { return localStorage.getItem('access_token'); }

function initials(name: string | undefined | null) {
  if (!name) return '?';
  return name.split(' ').map(w => w[0] ?? '').join('').toUpperCase().slice(0, 2);
}

function ScoreBadge({ value, color }: { value: number; color: string }) {
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold border ${color}`}>
      {value.toFixed(1)}
    </span>
  );
}

function CandidaturesContent() {
  const searchParams = useSearchParams();
  const router       = useRouter();

  const offreId = searchParams.get('offre_id');
  const titre   = searchParams.get('titre') ?? 'Candidatures';

  const [rows, setRows]       = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState('');

  useEffect(() => {
    if (!offreId) { setError('Aucune offre sélectionnée.'); setLoading(false); return; }

    async function load() {
      try {
        const res = await fetch(`http://localhost:8000/candidatures/offre/${offreId}`, {
          headers: { Authorization: `Bearer ${getToken()}` },
        });
        if (!res.ok) { setError('Erreur lors du chargement des candidatures.'); return; }

        const candidatures: Candidature[] = await res.json();

        // Initialise les lignes sans scores puis remplace au fur et à mesure
        const initial: Row[] = candidatures.map(c => ({ ...c, score: null, scoreLoaded: false }));
        setRows(initial);
        setLoading(false);

        // Fetch tous les scores en parallèle
        await Promise.all(
          candidatures.map(async (c) => {
            try {
              const sr = await fetch(`http://localhost:8000/candidatures/${c.id}/score`, {
                headers: { Authorization: `Bearer ${getToken()}` },
              });
              const score: Score | null = sr.ok ? await sr.json() : null;
              setRows(prev =>
                prev.map(r => r.id === c.id ? { ...r, score, scoreLoaded: true } : r)
              );
            } catch {
              setRows(prev =>
                prev.map(r => r.id === c.id ? { ...r, score: null, scoreLoaded: true } : r)
              );
            }
          })
        );
      } catch {
        setError('Impossible de contacter le serveur.');
        setLoading(false);
      }
    }

    load();
  }, [offreId]);

  // Tri : scorés par score_globale décroissant, non-scorés à la fin
  const sorted = [...rows].sort((a, b) => {
    if (a.score && b.score) return b.score.score_globale - a.score.score_globale;
    if (a.score) return -1;
    if (b.score) return 1;
    return new Date(b.date_depot).getTime() - new Date(a.date_depot).getTime();
  });

  const retenues  = rows.filter(c => c.statut === 'retenu').length;
  const enAttente = rows.filter(c => c.statut === 'en_attente').length;
  const refuses   = rows.filter(c => ['rejete', 'rejeté'].includes(c.statut)).length;

  return (
    <>
      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .fu { animation: fadeUp 0.45s cubic-bezier(.16,1,.3,1) forwards; opacity: 0; }
      `}</style>

      <div className="p-6 space-y-5 bg-gradient-to-br from-slate-50 to-indigo-50/30 min-h-full">

        {/* Header */}
        <div className="fu flex items-center gap-4" style={{ animationDelay: '0ms' }}>
          <button
            onClick={() => router.back()}
            className="w-9 h-9 flex items-center justify-center rounded-xl border border-gray-200 hover:bg-gray-100 text-gray-500 transition-colors"
          >
            <ArrowLeft size={16} />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{titre}</h1>
            <p className="text-gray-500 text-sm mt-0.5">
              {rows.length} candidature{rows.length !== 1 ? 's' : ''} — triées par score IA
            </p>
          </div>
        </div>

        {/* Résumé statuts */}
        <div className="fu grid grid-cols-3 gap-4" style={{ animationDelay: '80ms' }}>
          {[
            { label: 'Retenues',   count: retenues,  cls: 'bg-emerald-50 border-emerald-200 text-emerald-700' },
            { label: 'En attente', count: enAttente, cls: 'bg-amber-50 border-amber-200 text-amber-700' },
            { label: 'Refusées',   count: refuses,   cls: 'bg-red-50 border-red-200 text-red-700' },
          ].map((s, i) => (
            <div key={i} className={`rounded-xl border p-4 text-center ${s.cls}`}>
              <p className="text-2xl font-bold">{s.count}</p>
              <p className="text-sm font-medium mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>

        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">{error}</div>
        )}

        {loading && (
          <div className="text-center py-16 text-gray-400">
            <div className="w-8 h-8 border-2 border-[#0D3349] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            Chargement...
          </div>
        )}

        {/* Tableau */}
        {!loading && !error && (
          <div className="fu bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden" style={{ animationDelay: '160ms' }}>
            {sorted.length === 0 ? (
              <p className="text-center py-16 text-gray-400 text-sm">Aucune candidature pour cette offre.</p>
            ) : (
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50/60">
                    <th className="px-4 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide w-12">Rang</th>
                    <th className="px-4 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Candidat</th>
                    <th className="px-4 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">
                      <span className="flex items-center gap-1.5"><TrendingUp size={12} />Score global</span>
                    </th>
                    <th className="px-4 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">
                      <span className="flex items-center gap-1.5"><BarChart2 size={12} />Similarité</span>
                    </th>
                    <th className="px-4 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Statut</th>
                    <th className="px-4 py-3.5" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {sorted.map((c, i) => (
                    <tr
                      key={c.id}
                      className="fu hover:bg-slate-50/60 transition-colors"
                      style={{ animationDelay: `${240 + i * 40}ms` }}
                    >
                      {/* Rang */}
                      <td className="px-4 py-4">
                        {c.score ? (
                          <span className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                            i === 0 ? 'bg-amber-400 text-white' :
                            i === 1 ? 'bg-slate-400 text-white' :
                            i === 2 ? 'bg-orange-400 text-white' :
                                      'bg-slate-100 text-slate-600'
                          }`}>
                            {c.score.rang ?? i + 1}
                          </span>
                        ) : (
                          <span className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-400">—</span>
                        )}
                      </td>

                      {/* Candidat */}
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#0D3349] to-[#1a5276] flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                            {initials(c.user?.full_name)}
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900 text-sm leading-tight">
                              {c.user?.full_name ?? `Candidat #${c.id}`}
                            </p>
                            <p className="text-gray-400 text-xs">
                              {new Date(c.date_depot).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Score global */}
                      <td className="px-4 py-4">
                        {!c.scoreLoaded ? (
                          <div className="w-5 h-5 border-2 border-indigo-300 border-t-transparent rounded-full animate-spin" />
                        ) : c.score ? (
                          <ScoreBadge
                            value={c.score.score_globale}
                            color={
                              c.score.score_globale >= 70 ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                              c.score.score_globale >= 40 ? 'bg-amber-50 text-amber-700 border-amber-200' :
                                                            'bg-red-50 text-red-700 border-red-200'
                            }
                          />
                        ) : (
                          <span className="inline-flex items-center gap-1.5 text-amber-600 text-xs font-medium">
                            <Clock size={12} className="animate-pulse" /> En cours d&apos;analyse...
                          </span>
                        )}
                      </td>

                      {/* Similarité */}
                      <td className="px-4 py-4">
                        {c.scoreLoaded && c.score ? (
                          <ScoreBadge
                            value={c.score.score_competences}
                            color="bg-indigo-50 text-indigo-700 border-indigo-200"
                          />
                        ) : c.scoreLoaded ? (
                          <span className="text-gray-300 text-xs">—</span>
                        ) : (
                          <div className="w-5 h-5 border-2 border-indigo-300 border-t-transparent rounded-full animate-spin" />
                        )}
                      </td>

                      {/* Statut */}
                      <td className="px-4 py-4">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${STATUT_CLS[c.statut] ?? 'bg-gray-50 text-gray-500 border-gray-200'}`}>
                          {c.statut.replace('_', ' ')}
                        </span>
                      </td>

                      {/* Voir */}
                      <td className="px-4 py-4">
                        <button
                          onClick={() => router.push(`/recruteur/toutes-candidatures/${c.id}`)}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-medium transition-all"
                        >
                          <Eye size={13} /> Voir
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}
      </div>
    </>
  );
}

export default function ToutesCandidatures() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-full p-6">
        <div className="w-8 h-8 border-2 border-[#0D3349] border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <CandidaturesContent />
    </Suspense>
  );
}
