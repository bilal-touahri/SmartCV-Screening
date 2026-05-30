'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft, Clock, GraduationCap, Users, Calendar,
  Briefcase, CheckCircle, AlertCircle, UserPlus,
} from 'lucide-react';
import { LandingNavbar } from '@/components/landing/LandingNavbar';

const TYPE_CONTRAT_CLS: Record<string, string> = {
  CDI:        'bg-emerald-50 text-emerald-700 border-emerald-200',
  CDD:        'bg-blue-50 text-blue-700 border-blue-200',
  Stage:      'bg-purple-50 text-purple-700 border-purple-200',
  Freelance:  'bg-orange-50 text-orange-700 border-orange-200',
  Alternance: 'bg-indigo-50 text-indigo-700 border-indigo-200',
};

type Offre = {
  id: number;
  title: string;
  description: string;
  competences: string;
  experience: string;
  niveau_etudes: string;
  type_contrat: string | null;
  nombre_postes: number;
  date_limite: string | null;
  date_creation: string;
  statut: string;
  recruteur_id: number;
};

function getToken() {
  try { return localStorage.getItem('access_token'); } catch { return null; }
}
function getUserRole(): number | null {
  try {
    const raw = localStorage.getItem('user');
    if (!raw) return null;
    return JSON.parse(raw).role_id ?? null;
  } catch { return null; }
}

const CV_ERROR_KEYWORDS = ["cv", "profil", "uploader", "curriculum"];

function isCvMissingError(detail: string): boolean {
  const lower = detail.toLowerCase();
  return CV_ERROR_KEYWORDS.some(k => lower.includes(k));
}

export default function OffreDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = React.use(params);
  const router  = useRouter();

  const [offre, setOffre]         = useState<Offre | null>(null);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState('');

  const [posting, setPosting]     = useState(false);
  const [success, setSuccess]     = useState(false);
  const [postError, setPostError] = useState('');
  const [cvMissing, setCvMissing] = useState(false);
  const [roleError, setRoleError] = useState(false);

  useEffect(() => {
    fetch(`http://localhost:8000/offres/${id}`)
      .then(r => r.ok ? r.json() : Promise.reject(r.status))
      .then((data: Offre) => setOffre(data))
      .catch((status) => setError(status === 404 ? 'Offre introuvable.' : 'Impossible de charger cette offre.'))
      .finally(() => setLoading(false));
  }, [id]);

  const handlePostuler = async () => {
    const token = getToken();
    if (!token) { router.push('/auth/register'); return; }

    const role = getUserRole();
    if (role !== null && role !== 3) {
      setRoleError(true);
      return;
    }

    setPosting(true);
    setPostError('');
    setCvMissing(false);
    setRoleError(false);

    try {
      const res  = await fetch(`http://localhost:8000/candidatures/?offre_id=${id}`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();

      if (!res.ok) {
        const detail: string = Array.isArray(data.detail)
          ? data.detail.map((e: { msg: string }) => e.msg).join(', ')
          : (data.detail ?? 'Erreur lors de la soumission.');

        if (isCvMissingError(detail)) {
          setCvMissing(true);
        } else {
          setPostError(detail);
        }
        return;
      }
      setSuccess(true);
    } catch {
      setPostError('Impossible de contacter le serveur.');
    } finally {
      setPosting(false);
    }
  };

  /* ── États de chargement / erreur ── */
  if (loading) return (
    <div className="min-h-screen bg-gradient-to-b from-[#0D3349] to-slate-50">
      <LandingNavbar />
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-10 h-10 border-2 border-[#FF6B6B] border-t-transparent rounded-full animate-spin" />
      </div>
    </div>
  );

  if (error || !offre) return (
    <div className="min-h-screen bg-gradient-to-b from-[#0D3349] to-slate-50">
      <LandingNavbar />
      <div className="max-w-2xl mx-auto px-4 pt-32 pb-20">
        <Link href="/offres" className="flex items-center gap-2 text-white/70 hover:text-white text-sm mb-6 transition">
          <ArrowLeft size={16} /> Retour aux offres
        </Link>
        <div className="p-5 bg-red-50 border border-red-200 rounded-2xl text-red-600 text-sm">
          {error || 'Offre introuvable.'}
        </div>
      </div>
    </div>
  );

  const isExpired = offre.date_limite
    ? new Date(offre.date_limite) < new Date()
    : false;

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0D3349] to-slate-50">
      <LandingNavbar />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-20">

        {/* Retour */}
        <Link
          href="/offres"
          className="inline-flex items-center gap-2 text-white/70 hover:text-white text-sm mb-8 transition"
        >
          <ArrowLeft size={16} /> Toutes les offres
        </Link>

        {/* Header */}
        <div className="bg-gradient-to-r from-[#0D3349] to-[#1a4a6b] rounded-2xl p-8 text-white mb-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#FF6B6B]/10 rounded-full -translate-y-1/2 translate-x-1/3 blur-3xl pointer-events-none" />
          <div className="relative z-10">
            <div className="flex flex-wrap items-center gap-2 mb-3">
              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-emerald-400/20 border border-emerald-400/40 text-emerald-200">
                {offre.statut}
              </span>
              {offre.type_contrat && (
                <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${TYPE_CONTRAT_CLS[offre.type_contrat] ?? 'bg-gray-50 text-gray-600 border-gray-200'}`}>
                  {offre.type_contrat}
                </span>
              )}
              {isExpired && (
                <span className="px-3 py-1 rounded-full text-xs font-semibold bg-red-400/20 border border-red-400/40 text-red-200">
                  Délai dépassé
                </span>
              )}
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold mb-2">{offre.title}</h1>
            <p className="text-white/60 text-sm">
              Publiée le {new Date(offre.date_creation).toLocaleDateString('fr-FR')}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Contenu principal */}
          <div className="lg:col-span-2 space-y-6">

            {/* Description */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-6 h-6 bg-[#FF6B6B]/10 rounded-lg flex items-center justify-center">
                  <Briefcase size={13} className="text-[#FF6B6B]" />
                </div>
                <h2 className="font-semibold text-gray-900">Description du poste</h2>
              </div>
              <p className="text-gray-600 text-sm leading-relaxed whitespace-pre-line">{offre.description}</p>
            </div>

            {/* Compétences */}
            {offre.competences && (
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                <h2 className="font-semibold text-gray-900 mb-4">Compétences requises</h2>
                <div className="flex flex-wrap gap-2">
                  {offre.competences.split(',').map((c, i) => (
                    <span key={i} className="px-3 py-1.5 bg-[#0D3349]/6 text-[#0D3349] text-sm font-medium rounded-lg border border-[#0D3349]/10">
                      {c.trim()}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-5">

            {/* Détails */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <h3 className="font-semibold text-gray-900 mb-4 text-sm">Détails de l&apos;offre</h3>
              <ul className="space-y-3 text-sm">
                {[
                  { icon: Clock,         label: 'Expérience',      value: offre.experience },
                  { icon: GraduationCap, label: 'Formation',       value: offre.niveau_etudes },
                  { icon: Briefcase,     label: 'Type de contrat', value: offre.type_contrat ?? '—' },
                  { icon: Users,         label: 'Postes',          value: `${offre.nombre_postes} poste${offre.nombre_postes > 1 ? 's' : ''}` },
                  {
                    icon: Calendar,
                    label: 'Date limite',
                    value: offre.date_limite
                      ? new Date(offre.date_limite).toLocaleDateString('fr-FR')
                      : 'Pas de limite',
                  },
                ].map(({ icon: Icon, label, value }) => (
                  <li key={label} className="flex items-start gap-3">
                    <div className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center flex-shrink-0">
                      <Icon size={13} className="text-slate-500" />
                    </div>
                    <div>
                      <p className="text-gray-400 text-xs font-semibold uppercase tracking-wide leading-none mb-0.5">{label}</p>
                      <p className="text-gray-800 font-medium">{value}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            {/* Bloc candidature */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-3">

              {/* Succès */}
              {success && (
                <div className="flex items-center gap-2 px-4 py-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-700 text-sm font-medium">
                  <CheckCircle size={16} /> Candidature envoyée !
                </div>
              )}

              {/* CV manquant */}
              {cvMissing && (
                <div className="px-4 py-3 bg-amber-50 border border-amber-200 rounded-xl text-sm text-amber-800 space-y-1">
                  <div className="flex items-center gap-2 font-semibold">
                    <AlertCircle size={15} /> CV requis
                  </div>
                  <p className="text-xs leading-relaxed">
                    Veuillez uploader votre CV dans votre profil avant de postuler.
                  </p>
                  <Link
                    href="/candidat/profil"
                    className="inline-block mt-1 text-xs font-semibold text-amber-700 underline underline-offset-2 hover:text-amber-900"
                  >
                    Aller à mon profil →
                  </Link>
                </div>
              )}

              {/* Rôle non candidat */}
              {roleError && (
                <div className="flex items-start gap-2 px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs">
                  <AlertCircle size={14} className="flex-shrink-0 mt-0.5" />
                  Seuls les candidats peuvent postuler à des offres.
                </div>
              )}

              {/* Erreur générique */}
              {postError && (
                <div className="flex items-start gap-2 px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs">
                  <AlertCircle size={14} className="flex-shrink-0 mt-0.5" />
                  {postError}
                </div>
              )}

              {!success && (
                <button
                  onClick={handlePostuler}
                  disabled={posting || isExpired}
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r from-[#FF6B6B] to-rose-500 text-white font-semibold text-sm hover:opacity-90 transition disabled:opacity-50"
                >
                  {posting ? (
                    <><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Envoi…</>
                  ) : (
                    <><UserPlus size={16} /> Postuler à cette offre</>
                  )}
                </button>
              )}

              {isExpired && !success && (
                <p className="text-xs text-gray-400 text-center">Cette offre a expiré.</p>
              )}

              <p className="text-xs text-gray-400 text-center leading-relaxed">
                Pas encore inscrit ?{' '}
                <Link href="/auth/register" className="text-[#FF6B6B] hover:underline font-medium">
                  Créer un compte gratuitement
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
