'use client';

import { useEffect, useState } from 'react';
import { FileText, Loader2 } from 'lucide-react';

type CandRow = {
  id: number;
  user_full_name: string;
  user_email: string | null;
  offre_title: string;
  statut: string;
  date_depot: string | null;
  score_globale: number | null;
  rang: number | null;
};

function getToken() { return localStorage.getItem('access_token'); }

const STATUT_CLS: Record<string, string> = {
  en_attente: 'bg-amber-50 text-amber-700 border-amber-200',
  retenu:     'bg-emerald-50 text-emerald-700 border-emerald-200',
  rejete:     'bg-red-50 text-red-700 border-red-200',
  'rejeté':   'bg-red-50 text-red-700 border-red-200',
};

function ScoreBadge({ value }: { value: number }) {
  const cls = value >= 70
    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
    : value >= 40
      ? 'bg-amber-50 text-amber-700 border-amber-200'
      : 'bg-red-50 text-red-700 border-red-200';
  return (
    <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${cls}`}>
      {value.toFixed(1)}/100
    </span>
  );
}

export default function AdminCandidatures() {
  const [rows, setRows]       = useState<CandRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState('');
  const [search, setSearch]   = useState('');
  const [filter, setFilter]   = useState<'tous' | 'en_attente' | 'retenu' | 'rejete'>('tous');

  useEffect(() => {
    fetch('http://localhost:8000/admin/candidatures', {
      headers: { Authorization: `Bearer ${getToken()}` },
    })
      .then(r => r.ok ? r.json() : Promise.reject())
      .then(data => setRows(data))
      .catch(() => setError('Impossible de charger les candidatures.'))
      .finally(() => setLoading(false));
  }, []);

  const filtered = rows
    .filter(r => filter === 'tous' || r.statut === filter)
    .filter(r => {
      const q = search.toLowerCase();
      return !q || r.user_full_name.toLowerCase().includes(q) || r.offre_title.toLowerCase().includes(q);
    });

  return (
    <div className="p-6 space-y-5 bg-gradient-to-br from-slate-50 to-indigo-50/30 min-h-full">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Candidatures</h1>
        <p className="text-gray-500 text-sm mt-0.5">{rows.length} au total (lecture seule)</p>
      </div>

      {/* Filtres */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex items-center gap-2 flex-wrap">
          {([['tous', 'Toutes'], ['en_attente', 'En attente'], ['retenu', 'Retenues'], ['rejete', 'Rejetées']] as const).map(([v, l]) => (
            <button key={v} onClick={() => setFilter(v)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition ${filter === v ? 'bg-[#0D3349] text-white' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'}`}>
              {l}
            </button>
          ))}
        </div>
        <input
          type="text"
          placeholder="Rechercher par candidat ou offre…"
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="flex-1 px-4 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#0D3349]/30 bg-white"
        />
      </div>

      {error && <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">{error}</div>}

      {loading ? (
        <div className="flex items-center justify-center py-16 text-gray-400 gap-2">
          <Loader2 size={18} className="animate-spin" /> Chargement…
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <FileText size={40} className="mx-auto mb-3 opacity-20" />
          <p className="font-medium">Aucune candidature trouvée</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/60">
                {['#', 'Candidat', 'Offre', 'Statut', 'Score IA', 'Rang', 'Déposée le'].map(h => (
                  <th key={h} className="px-4 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map(r => (
                <tr key={r.id} className="hover:bg-slate-50/60 transition-colors">
                  <td className="px-4 py-4 text-gray-400 text-xs font-mono">#{r.id}</td>
                  <td className="px-4 py-4">
                    <p className="font-semibold text-gray-900 text-sm leading-tight">{r.user_full_name}</p>
                    {r.user_email && <p className="text-gray-400 text-xs">{r.user_email}</p>}
                  </td>
                  <td className="px-4 py-4 text-gray-600 text-sm max-w-[200px] truncate">{r.offre_title}</td>
                  <td className="px-4 py-4">
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${STATUT_CLS[r.statut] ?? 'bg-gray-50 text-gray-600 border-gray-200'}`}>
                      {r.statut.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-4 py-4">
                    {r.score_globale != null
                      ? <ScoreBadge value={r.score_globale} />
                      : <span className="text-gray-300 text-xs italic">En cours…</span>}
                  </td>
                  <td className="px-4 py-4 text-gray-600 text-sm">
                    {r.rang != null ? `#${r.rang}` : '—'}
                  </td>
                  <td className="px-4 py-4 text-gray-400 text-xs">
                    {r.date_depot ? new Date(r.date_depot).toLocaleDateString('fr-FR') : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
