'use client';

import { useEffect, useState } from 'react';
import { Briefcase, Clock, CheckCircle, XCircle, Trash2 } from 'lucide-react';

type Candidature = {
  id: number;
  offre_id: number;
  statut: string;
  date_depot: string;
  offre?: { id: number; title: string } | null;
};

function getToken() {
  return localStorage.getItem('access_token');
}

type StatusEntry = { label: string; cls: string; icon: React.ElementType };

const STATUS_MAP: Record<string, StatusEntry> = {
  en_attente: { label: 'En attente', cls: 'bg-amber-50 text-amber-700 border-amber-200',      icon: Clock },
  retenu:     { label: 'Retenu',     cls: 'bg-emerald-50 text-emerald-700 border-emerald-200', icon: CheckCircle },
  rejete:     { label: 'Rejeté',     cls: 'bg-red-50 text-red-700 border-red-200',             icon: XCircle },
  'rejeté':   { label: 'Rejeté',     cls: 'bg-red-50 text-red-700 border-red-200',             icon: XCircle },
};

function statusCfg(statut: string): StatusEntry {
  return STATUS_MAP[statut.toLowerCase()] ?? {
    label: statut, cls: 'bg-gray-100 text-gray-600 border-gray-200', icon: Clock,
  };
}

export default function CandidatCandidatures() {
  const [candidatures, setCandidatures] = useState<Candidature[]>([]);
  const [loading, setLoading]           = useState(true);
  const [error, setError]               = useState('');
  const [deleting, setDeleting]         = useState<number | null>(null);

  useEffect(() => {
    const token = getToken();
    fetch('http://localhost:8000/candidatures/mes-candidatures', {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(r => r.ok ? r.json() : Promise.reject(r.status))
      .then((data: Candidature[]) => setCandidatures(data))
      .catch(() => setError('Impossible de charger vos candidatures.'))
      .finally(() => setLoading(false));
  }, []);

  const handleDelete = async (id: number) => {
    if (!confirm('Supprimer cette candidature ?')) return;
    setDeleting(id);
    try {
      const res = await fetch(`http://localhost:8000/candidatures/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      if (res.ok) {
        setCandidatures(prev => prev.filter(c => c.id !== id));
      } else {
        const data = await res.json().catch(() => ({}));
        alert(data.detail ?? 'Erreur lors de la suppression.');
      }
    } catch {
      alert('Impossible de contacter le serveur.');
    } finally {
      setDeleting(null);
    }
  };

  const enAttente = candidatures.filter(c => ['en_attente'].includes(c.statut.toLowerCase())).length;
  const retenues  = candidatures.filter(c => ['retenu'].includes(c.statut.toLowerCase())).length;
  const rejetees  = candidatures.filter(c => ['rejete', 'rejeté'].includes(c.statut.toLowerCase())).length;

  return (
    <>
      <style>{`
        @keyframes fadeUp { from { opacity:0; transform:translateY(16px); } to { opacity:1; transform:translateY(0); } }
        .fu { animation: fadeUp 0.45s cubic-bezier(.16,1,.3,1) forwards; opacity:0; }
      `}</style>

      <div className="p-6 space-y-5 bg-gradient-to-br from-slate-50 to-indigo-50/30 min-h-full">

        {/* Header */}
        <div className="fu" style={{ animationDelay: '0ms' }}>
          <h1 className="text-2xl font-bold text-gray-900">Mes Candidatures</h1>
          <p className="text-gray-500 text-sm mt-0.5">
            {candidatures.length} candidature{candidatures.length !== 1 ? 's' : ''} au total
          </p>
        </div>

        {/* Stats */}
        <div className="fu grid grid-cols-3 gap-4" style={{ animationDelay: '60ms' }}>
          <div className="bg-amber-50 rounded-2xl p-4 border border-amber-200">
            <p className="text-2xl font-bold text-amber-700">{enAttente}</p>
            <p className="text-amber-600 text-sm mt-0.5">En attente</p>
          </div>
          <div className="bg-emerald-50 rounded-2xl p-4 border border-emerald-200">
            <p className="text-2xl font-bold text-emerald-700">{retenues}</p>
            <p className="text-emerald-600 text-sm mt-0.5">Retenues</p>
          </div>
          <div className="bg-red-50 rounded-2xl p-4 border border-red-200">
            <p className="text-2xl font-bold text-red-700">{rejetees}</p>
            <p className="text-red-600 text-sm mt-0.5">Rejetées</p>
          </div>
        </div>

        {/* Loading */}
        {loading && (
          <div className="text-center py-16 text-gray-400">
            <div className="w-8 h-8 border-2 border-[#0D3349] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            Chargement…
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">{error}</div>
        )}

        {/* Table */}
        {!loading && !error && (
          <div className="fu bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden" style={{ animationDelay: '120ms' }}>
            {candidatures.length === 0 ? (
              <div className="text-center py-16 text-gray-400">
                <Briefcase size={40} className="mx-auto mb-3 opacity-30" />
                <p className="font-medium">Aucune candidature pour l&apos;instant</p>
                <p className="text-sm mt-1">Consultez les offres disponibles et postulez !</p>
              </div>
            ) : (
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-400 uppercase tracking-wide">Poste</th>
                    <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-400 uppercase tracking-wide">Date</th>
                    <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-400 uppercase tracking-wide">Statut</th>
                    <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-400 uppercase tracking-wide">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {candidatures.map((c) => {
                    const cfg        = statusCfg(c.statut);
                    const StatusIcon = cfg.icon;
                    return (
                      <tr key={c.id} className="hover:bg-slate-50/60 transition-colors">
                        <td className="px-6 py-4">
                          <p className="font-semibold text-gray-900 text-sm">
                            {c.offre?.title ?? `Offre #${c.offre_id}`}
                          </p>
                          <p className="text-xs text-gray-400 mt-0.5">#{c.id}</p>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500">
                          {new Date(c.date_depot).toLocaleDateString('fr-FR')}
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${cfg.cls}`}>
                            <StatusIcon size={11} />
                            {cfg.label}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <button
                            title="Supprimer"
                            onClick={() => handleDelete(c.id)}
                            disabled={deleting === c.id}
                            className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 transition-colors disabled:opacity-40"
                          >
                            <Trash2 size={15} />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        )}
      </div>
    </>
  );
}
