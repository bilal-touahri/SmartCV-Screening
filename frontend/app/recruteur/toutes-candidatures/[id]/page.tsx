'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft, Mail, Briefcase,
  Calendar, CheckCircle, XCircle, Clock, Download, FileText, BarChart2,
} from 'lucide-react';

type CV = {
  id: number;
  chemin_fichier: string;
  texte_extrait: string | null;
  date_upload: string;
  valide: boolean;
};

type Score = {
  score_globale: number;
  score_competences: number;
  rang: number | null;
};

type Candidature = {
  id: number;
  offre_id: number;
  user_id: number;
  cv_id: number;
  date_depot: string;
  statut: string;
  user?: { id: number; full_name: string } | null;
  offre?: { id: number; title: string } | null;
  cv?: CV | null;
};

function getToken() { return localStorage.getItem('access_token'); }

type StatusEntry = { label: string; cls: string; icon: React.ElementType };

const STATUS_CFG: Record<string, StatusEntry> = {
  en_attente: { label: 'En attente', cls: 'bg-amber-50 text-amber-700 border-amber-200',        icon: Clock },
  retenu:     { label: 'Retenu',     cls: 'bg-emerald-50 text-emerald-700 border-emerald-200',  icon: CheckCircle },
  rejete:     { label: 'Rejeté',     cls: 'bg-red-50 text-red-700 border-red-200',              icon: XCircle },
  'rejeté':   { label: 'Rejeté',     cls: 'bg-red-50 text-red-700 border-red-200',              icon: XCircle },
};

function statusCfg(statut: string): StatusEntry {
  return STATUS_CFG[statut.toLowerCase()] ?? { label: statut, cls: 'bg-gray-100 text-gray-600 border-gray-200', icon: Clock };
}

function initials(name: string | undefined) {
  if (!name) return '?';
  return name.split(' ').map(w => w[0] ?? '').join('').toUpperCase().slice(0, 2);
}

export default function CandidatureDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = React.use(params);
  const router = useRouter();

  const [candidature, setCandidature]   = useState<Candidature | null>(null);
  const [loading, setLoading]           = useState(true);
  const [error, setError]               = useState('');
  const [updating, setUpdating]         = useState(false);
  const [updateError, setUpdateError]   = useState('');
  const [downloading, setDownloading]   = useState(false);
  const [score, setScore]               = useState<Score | null>(null);
  const [scoreLoading, setScoreLoading] = useState(true);

  useEffect(() => {
    fetch(`http://localhost:8000/candidatures/${id}`, {
      headers: { Authorization: `Bearer ${getToken()}` },
    })
      .then(r => r.ok ? r.json() : Promise.reject(r.status))
      .then(data => setCandidature(data))
      .catch(() => setError('Impossible de charger la candidature.'))
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    let cancelled = false;

    const fetchScore = async () => {
      try {
        const r = await fetch(`http://localhost:8000/candidatures/${id}/score`, {
          headers: { Authorization: `Bearer ${getToken()}` },
        });
        if (cancelled) return;
        if (r.ok) {
          const data = await r.json();
          setScore(data);
          setScoreLoading(false);
          return; // score trouvé, on arrête le polling
        }
        // 404 = pipeline en cours, on réessaie
        if (r.status === 404) {
          setScoreLoading(false);
          setTimeout(() => { if (!cancelled) fetchScore(); }, 5000);
        } else {
          setScoreLoading(false);
        }
      } catch {
        if (!cancelled) setScoreLoading(false);
      }
    };

    setScoreLoading(true);
    fetchScore();

    return () => { cancelled = true; };
  }, [id]);

  const downloadCv = async (cvId: number, filename: string) => {
    setDownloading(true);
    try {
      const res = await fetch(`http://localhost:8000/cvs/${cvId}/download`, {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        alert(data.detail ?? 'Erreur lors du téléchargement.');
        return;
      }
      const blob = await res.blob();
      const url  = URL.createObjectURL(blob);
      const a    = document.createElement('a');
      a.href     = url;
      a.download = filename;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      alert('Impossible de contacter le serveur.');
    } finally {
      setDownloading(false);
    }
  };

  const updateStatut = async (statut: string) => {
    if (!candidature) return;
    setUpdating(true);
    setUpdateError('');
    try {
      const res = await fetch(`http://localhost:8000/candidatures/${id}/statut`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${getToken()}`,
        },
        body: JSON.stringify({ statut }),
      });
      const data = await res.json();
      if (!res.ok) {
        setUpdateError(data.detail ?? 'Erreur lors de la mise à jour.');
        return;
      }
      setCandidature(data);
    } catch {
      setUpdateError('Impossible de contacter le serveur.');
    } finally {
      setUpdating(false);
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-full p-6">
      <div className="w-8 h-8 border-2 border-[#0D3349] border-t-transparent rounded-full animate-spin" />
    </div>
  );

  if (error || !candidature) return (
    <div className="p-6 space-y-4">
      <button onClick={() => router.back()} className="flex items-center gap-2 text-gray-500 hover:text-gray-900 text-sm font-medium transition-colors">
        <ArrowLeft size={16} /> Retour
      </button>
      <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">
        {error || 'Candidature introuvable.'}
      </div>
    </div>
  );

  const cfg        = statusCfg(candidature.statut);
  const StatusIcon = cfg.icon;
  const name       = candidature.user?.full_name ?? `Candidat #${candidature.user_id}`;
  const position   = candidature.offre?.title    ?? `Offre #${candidature.offre_id}`;

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

        {/* Back */}
        <button
          onClick={() => router.back()}
          className="fu flex items-center gap-2 text-gray-500 hover:text-gray-900 text-sm font-medium transition-colors"
          style={{ animationDelay: '0ms' }}
        >
          <ArrowLeft size={16} /> Retour aux candidatures
        </button>

        {/* Header Card */}
        <div className="fu relative overflow-hidden bg-gradient-to-r from-[#0D3349] via-[#14527a] to-[#0D3349] rounded-2xl p-7 text-white" style={{ animationDelay: '60ms' }}>
          <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/20 rounded-full -translate-y-1/2 translate-x-1/3 blur-3xl pointer-events-none" />
          <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
            <div className="flex items-center gap-5">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#FF6B6B] to-rose-400 flex items-center justify-center text-white font-bold text-2xl flex-shrink-0">
                {initials(candidature.user?.full_name)}
              </div>
              <div>
                <h1 className="text-2xl font-bold">{name}</h1>
                <p className="text-white/70 mt-0.5">{position}</p>
                <div className="flex items-center gap-3 mt-2">
                  <span className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${cfg.cls}`}>
                    <StatusIcon size={12} />{cfg.label}
                  </span>
                  <span className="text-white/50 text-xs">
                    {new Date(candidature.date_depot).toLocaleDateString('fr-FR')}
                  </span>
                </div>
              </div>
            </div>
            <div className="flex gap-3 flex-shrink-0">
              <button
                onClick={() => updateStatut('rejete')}
                disabled={updating}
                className="flex items-center gap-2 px-5 py-2.5 bg-white/10 hover:bg-red-500/40 border border-white/20 rounded-xl text-sm font-medium transition-all disabled:opacity-50"
              >
                <XCircle size={15} /> Rejeter
              </button>
              <button
                onClick={() => updateStatut('retenu')}
                disabled={updating}
                className="flex items-center gap-2 px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 rounded-xl text-sm font-semibold transition-all disabled:opacity-50"
              >
                <CheckCircle size={15} /> Retenir
              </button>
            </div>
          </div>
          {updateError && (
            <div className="relative z-10 mt-4 px-4 py-2 bg-red-500/20 border border-red-400/30 rounded-xl text-white/90 text-sm">
              {updateError}
            </div>
          )}
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

          {/* Left Column */}
          <div className="space-y-5">

            {/* Informations */}
            <div className="fu bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-3" style={{ animationDelay: '140ms' }}>
              <h3 className="font-semibold text-gray-400 text-sm uppercase tracking-wide">Informations</h3>
              <div className="space-y-2.5">
                {[
                  { icon: Briefcase, label: position },
                  { icon: Calendar,  label: `Déposée le ${new Date(candidature.date_depot).toLocaleDateString('fr-FR')}` },
                  { icon: Mail,      label: `Candidat #${candidature.user_id}` },
                ].map(({ icon: Icon, label }, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center flex-shrink-0">
                      <Icon size={14} className="text-slate-500" />
                    </div>
                    <span className="text-gray-700 text-sm">{label}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Score IA */}
            <div className="fu bg-white rounded-2xl border border-gray-100 shadow-sm p-5" style={{ animationDelay: '180ms' }}>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-6 h-6 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-lg flex items-center justify-center">
                  <BarChart2 size={12} className="text-white" />
                </div>
                <h3 className="font-semibold text-gray-900 text-sm">Score IA</h3>
              </div>
              {scoreLoading ? (
                <div className="flex items-center justify-center py-4">
                  <div className="w-5 h-5 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin" />
                </div>
              ) : score ? (
                <div className="space-y-2">
                  <div className="flex items-center justify-between bg-indigo-50 rounded-xl px-4 py-3">
                    <span className="text-xs font-semibold text-indigo-500 uppercase tracking-wide">Score global</span>
                    <span className="text-lg font-bold text-indigo-700">{score.score_globale.toFixed(1)}<span className="text-xs font-normal">/100</span></span>
                  </div>
                  <div className="flex items-center justify-between bg-purple-50 rounded-xl px-4 py-3">
                    <span className="text-xs font-semibold text-purple-500 uppercase tracking-wide">Similarité</span>
                    <span className="text-lg font-bold text-purple-700">{score.score_competences.toFixed(1)}<span className="text-xs font-normal">/100</span></span>
                  </div>
                  <div className="flex items-center justify-between bg-slate-50 rounded-xl px-4 py-3">
                    <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Rang</span>
                    <span className="text-lg font-bold text-slate-700">{score.rang != null ? `#${score.rang}` : '—'}</span>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-3 px-4 py-3 bg-amber-50 rounded-xl border border-amber-100">
                  <div className="w-4 h-4 border-2 border-amber-400 border-t-transparent rounded-full animate-spin flex-shrink-0" />
                  <p className="text-amber-700 text-sm font-medium">En cours d&apos;analyse...</p>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="fu bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-2" style={{ animationDelay: '200ms' }}>
              <h3 className="font-semibold text-gray-400 text-sm uppercase tracking-wide mb-3">Actions</h3>
              {candidature.cv ? (
                <button
                  onClick={() => downloadCv(
                    candidature.cv!.id,
                    candidature.cv!.chemin_fichier.split(/[\\/]/).pop() ?? `cv_${candidature.cv!.id}.pdf`
                  )}
                  disabled={downloading}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 text-sm font-medium transition-all disabled:opacity-50"
                >
                  <Download size={15} /> {downloading ? 'Téléchargement…' : 'Télécharger le CV'}
                </button>
              ) : (
                <button disabled className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-slate-50 text-slate-400 text-sm font-medium cursor-not-allowed">
                  <Download size={15} /> CV non disponible
                </button>
              )}
              <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-sm font-medium transition-all">
                <Mail size={15} /> Envoyer un message
              </button>
            </div>
          </div>

          {/* Right Column (2/3) */}
          <div className="lg:col-span-2 space-y-5">

            {/* CV Details */}
            {candidature.cv && (
              <div className="fu bg-white rounded-2xl border border-gray-100 shadow-sm p-6" style={{ animationDelay: '180ms' }}>
                <div className="flex items-center gap-2 mb-5">
                  <div className="w-6 h-6 bg-gradient-to-br from-[#0D3349] to-[#14527a] rounded-lg flex items-center justify-center">
                    <FileText size={12} className="text-white" />
                  </div>
                  <h3 className="font-semibold text-gray-900">Curriculum Vitae</h3>
                  <span className={`ml-auto px-2.5 py-0.5 rounded-full text-xs font-semibold border ${candidature.cv.valide ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-amber-50 text-amber-700 border-amber-200'}`}>
                    {candidature.cv.valide ? 'Validé' : 'En cours de validation'}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                  <div>
                    <p className="text-gray-400 text-xs uppercase tracking-wide font-semibold mb-1">Fichier</p>
                    <p className="text-gray-700 truncate">{candidature.cv.chemin_fichier.split('/').pop() ?? candidature.cv.chemin_fichier}</p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-xs uppercase tracking-wide font-semibold mb-1">Uploadé le</p>
                    <p className="text-gray-700">{new Date(candidature.cv.date_upload).toLocaleDateString('fr-FR')}</p>
                  </div>
                </div>
                {candidature.cv.texte_extrait && (
                  <div>
                    <p className="text-gray-400 text-xs uppercase tracking-wide font-semibold mb-2">Contenu extrait</p>
                    <div className="bg-slate-50 rounded-xl p-4 max-h-64 overflow-y-auto">
                      <p className="text-gray-600 text-sm leading-relaxed whitespace-pre-wrap">{candidature.cv.texte_extrait}</p>
                    </div>
                  </div>
                )}
                {!candidature.cv.texte_extrait && (
                  <div className="bg-slate-50 rounded-xl p-4 text-center text-gray-400 text-sm">
                    Texte du CV non encore extrait
                  </div>
                )}
              </div>
            )}

            {/* Candidature summary */}
            <div className="fu bg-white rounded-2xl border border-gray-100 shadow-sm p-6" style={{ animationDelay: '240ms' }}>
              <h3 className="font-semibold text-gray-900 mb-4">Récapitulatif</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {[
                  { label: 'ID candidature', value: `#${candidature.id}` },
                  { label: 'Offre',          value: `#${candidature.offre_id}` },
                  { label: 'Statut actuel',  value: cfg.label },
                  { label: 'Date de dépôt',  value: new Date(candidature.date_depot).toLocaleDateString('fr-FR') },
                  { label: 'ID candidat',    value: `#${candidature.user_id}` },
                  { label: 'ID CV',          value: `#${candidature.cv_id}` },
                ].map(({ label, value }) => (
                  <div key={label} className="bg-slate-50 rounded-xl p-3">
                    <p className="text-gray-400 text-xs font-semibold uppercase tracking-wide mb-1">{label}</p>
                    <p className="text-gray-800 text-sm font-medium">{value}</p>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      </div>
    </>
  );
}
