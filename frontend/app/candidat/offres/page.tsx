'use client';

import { useEffect, useState } from 'react';
import {
  Briefcase, Clock, Search, CheckCircle,
  GraduationCap, Users, Calendar, ChevronDown, ChevronUp,
} from 'lucide-react';

type Offre = {
  id: number;
  title: string;
  description: string;
  competences: string;
  experience: string;
  niveau_etudes: string;
  nombre_postes: number;
  date_limite: string | null;
  statut: string;
};

function getToken() { return localStorage.getItem('access_token'); }

/* ─── Carte offre ────────────────────────────────────────── */
function OffreCard({ offre, delay }: { offre: Offre; delay: number }) {
  const [expanded, setExpanded]   = useState(false);
  const [loading, setLoading]     = useState(false);
  const [success, setSuccess]     = useState(false);
  const [error, setError]         = useState('');

  const handlePostuler = async () => {
    setLoading(true); setError('');
    try {
      const res  = await fetch(`http://localhost:8000/candidatures/?offre_id=${offre.id}`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      const data = await res.json();
      if (!res.ok) {
        setError(Array.isArray(data.detail)
          ? data.detail.map((e: { msg: string }) => e.msg).join(', ')
          : (data.detail ?? 'Erreur lors de la soumission.'));
        return;
      }
      setSuccess(true);
    } catch {
      setError('Impossible de contacter le serveur.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fu bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all p-5"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-bold text-gray-900 truncate">{offre.title}</h3>
            <span className="flex-shrink-0 px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700">
              {offre.statut}
            </span>
          </div>
          <p className={`text-gray-500 text-sm mt-1 ${expanded ? '' : 'line-clamp-2'}`}>{offre.description}</p>
          {offre.description.length > 120 && (
            <button onClick={() => setExpanded(v => !v)} className="flex items-center gap-1 text-xs text-[#FF6B6B] mt-1 hover:underline">
              {expanded ? <><ChevronUp size={12} /> Réduire</> : <><ChevronDown size={12} /> Voir plus</>}
            </button>
          )}
        </div>

        {success ? (
          <span className="flex-shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-50 text-emerald-700 text-sm font-semibold border border-emerald-200">
            <CheckCircle size={14} /> Envoyée
          </span>
        ) : (
          <button
            onClick={handlePostuler}
            disabled={loading}
            className="flex-shrink-0 px-4 py-2 bg-gradient-to-r from-[#FF6B6B] to-rose-500 text-white text-sm font-semibold rounded-xl hover:opacity-90 transition-all shadow-sm disabled:opacity-60"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Envoi…
              </span>
            ) : 'Postuler'}
          </button>
        )}
      </div>

      {error && (
        <p className="mt-3 text-red-600 text-xs bg-red-50 border border-red-200 rounded-lg px-3 py-2">{error}</p>
      )}

      {/* Compétences */}
      <div className="flex flex-wrap gap-1.5 mt-3">
        {offre.competences.split(',').map((c, i) => (
          <span key={i} className="px-2.5 py-0.5 bg-[#0D3349]/8 text-[#0D3349] text-xs font-medium rounded-lg border border-[#0D3349]/10">
            {c.trim()}
          </span>
        ))}
      </div>

      {/* Méta */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4 pt-4 border-t border-gray-50 text-xs text-gray-500">
        <div className="flex items-center gap-1.5">
          <Clock size={13} className="text-[#FF6B6B]" />
          <span>{offre.experience}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <GraduationCap size={13} className="text-[#FF6B6B]" />
          <span>{offre.niveau_etudes}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Users size={13} className="text-[#FF6B6B]" />
          <span>{offre.nombre_postes} poste{offre.nombre_postes > 1 ? 's' : ''}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Calendar size={13} className="text-[#FF6B6B]" />
          <span>{offre.date_limite ? new Date(offre.date_limite).toLocaleDateString('fr-FR') : 'Sans limite'}</span>
        </div>
      </div>
    </div>
  );
}

/* ─── Page principale ────────────────────────────────────── */
export default function CandidatOffres() {
  const [offres, setOffres]   = useState<Offre[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState('');
  const [search, setSearch]   = useState('');

  useEffect(() => {
    fetch('http://localhost:8000/offres/')
      .then(r => r.ok ? r.json() : Promise.reject(r.status))
      .then(data => setOffres(data))
      .catch(() => setError('Impossible de charger les offres.'))
      .finally(() => setLoading(false));
  }, []);

  const filtered = offres.filter(o =>
    o.title.toLowerCase().includes(search.toLowerCase()) ||
    o.competences.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <>
      <style>{`
        @keyframes fadeUp { from { opacity:0; transform:translateY(16px); } to { opacity:1; transform:translateY(0); } }
        .fu { animation: fadeUp 0.45s cubic-bezier(.16,1,.3,1) forwards; opacity:0; }
      `}</style>

      <div className="p-6 space-y-5 bg-gradient-to-br from-slate-50 to-indigo-50/30 min-h-full">

        {/* Header */}
        <div className="fu flex items-center justify-between" style={{ animationDelay: '0ms' }}>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Offres d'emploi</h1>
            <p className="text-gray-500 text-sm mt-0.5">{offres.length} offre{offres.length !== 1 ? 's' : ''} disponible{offres.length !== 1 ? 's' : ''}</p>
          </div>
        </div>

        {/* Search */}
        <div className="fu relative" style={{ animationDelay: '60ms' }}>
          <Search size={16} className="absolute left-4 top-3.5 text-gray-400 pointer-events-none" />
          <input
            type="text"
            placeholder="Rechercher par titre ou compétence…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#0D3349]/30 transition shadow-sm"
          />
        </div>

        {/* States */}
        {loading && (
          <div className="text-center py-16 text-gray-400">
            <div className="w-8 h-8 border-2 border-[#0D3349] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            Chargement des offres…
          </div>
        )}

        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">{error}</div>
        )}

        {/* Offres */}
        {!loading && !error && (
          <div className="space-y-4">
            {filtered.length === 0 ? (
              <div className="text-center py-16 text-gray-400">
                <Briefcase size={40} className="mx-auto mb-3 opacity-30" />
                <p className="font-medium">Aucune offre trouvée</p>
              </div>
            ) : (
              filtered.map((offre, i) => (
                <OffreCard
                  key={offre.id}
                  offre={offre}
                  delay={120 + i * 60}
                />
              ))
            )}
          </div>
        )}
      </div>
    </>
  );
}
