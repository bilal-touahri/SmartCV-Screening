'use client';

import { useState, useEffect } from 'react';
import { Plus, Trash2, X, Briefcase, ChevronDown, Eye, Edit2, Calendar, Users, GraduationCap, Layers } from 'lucide-react';
import Link from 'next/link';

const TYPE_CONTRAT_OPTIONS = ['CDI', 'CDD', 'Stage', 'Freelance', 'Alternance'] as const;

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
  date_limite: string | null;
  statut: string;
  recruteur_id: number;
  nombre_postes: number;
  date_creation: string;
};

function getToken() {
  return localStorage.getItem('access_token');
}

function ViewOfferModal({ offre, onClose }: { offre: Offre; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto">

        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#0D3349]/10 flex items-center justify-center">
              <Briefcase size={16} className="text-[#0D3349]" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900 leading-tight">{offre.title}</h2>
              <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${offre.statut === 'active' ? 'bg-emerald-50 text-emerald-700' : 'bg-gray-100 text-gray-500'}`}>
                {offre.statut}
              </span>
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-400 transition-colors">
            <X size={18} />
          </button>
        </div>

        <div className="p-6 space-y-5">
          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1.5">Description</p>
            <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-line">{offre.description}</p>
          </div>

          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1.5">Compétences requises</p>
            <div className="flex flex-wrap gap-1.5">
              {offre.competences.split(',').map((c, i) => (
                <span key={i} className="px-2.5 py-1 bg-[#0D3349]/8 text-[#0D3349] text-xs font-medium rounded-lg border border-[#0D3349]/10">
                  {c.trim()}
                </span>
              ))}
            </div>
          </div>

          {offre.type_contrat && (
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1.5">Type de contrat</p>
              <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${TYPE_CONTRAT_CLS[offre.type_contrat] ?? 'bg-gray-50 text-gray-600 border-gray-200'}`}>
                {offre.type_contrat}
              </span>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-start gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-orange-50 flex items-center justify-center flex-shrink-0">
                <Layers size={14} className="text-orange-500" />
              </div>
              <div>
                <p className="text-xs text-gray-400">Expérience</p>
                <p className="text-sm font-semibold text-gray-800">{offre.experience}</p>
              </div>
            </div>
            <div className="flex items-start gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-purple-50 flex items-center justify-center flex-shrink-0">
                <GraduationCap size={14} className="text-purple-500" />
              </div>
              <div>
                <p className="text-xs text-gray-400">Niveau d'études</p>
                <p className="text-sm font-semibold text-gray-800">{offre.niveau_etudes}</p>
              </div>
            </div>
            <div className="flex items-start gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">
                <Users size={14} className="text-blue-500" />
              </div>
              <div>
                <p className="text-xs text-gray-400">Postes disponibles</p>
                <p className="text-sm font-semibold text-gray-800">{offre.nombre_postes}</p>
              </div>
            </div>
            <div className="flex items-start gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-rose-50 flex items-center justify-center flex-shrink-0">
                <Calendar size={14} className="text-rose-500" />
              </div>
              <div>
                <p className="text-xs text-gray-400">Date limite</p>
                <p className="text-sm font-semibold text-gray-800">
                  {offre.date_limite ? new Date(offre.date_limite).toLocaleDateString('fr-FR') : '—'}
                </p>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-gray-100 text-xs text-gray-400">
            Publiée le {new Date(offre.date_creation).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
          </div>
        </div>
      </div>
    </div>
  );
}

function EditOfferModal({ offre, onClose, onUpdate }: { offre: Offre; onClose: () => void; onUpdate: (updated: Offre) => void }) {
  const [form, setForm] = useState({
    title: offre.title,
    description: offre.description,
    competences: offre.competences,
    experience: offre.experience,
    niveau_etudes: offre.niveau_etudes,
    type_contrat: offre.type_contrat ?? '',
    date_limite: offre.date_limite ?? '',
    nombre_postes: String(offre.nombre_postes),
    statut: offre.statut,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.title.trim()) e.title = 'Le titre est requis';
    else if (form.title.trim().length < 3) e.title = 'Le titre doit faire au moins 3 caractères';
    if (!form.description.trim()) e.description = 'La description est requise';
    else if (form.description.trim().length < 10) e.description = 'La description doit faire au moins 10 caractères';
    if (!form.competences.trim()) e.competences = 'Les compétences sont requises';
    else if (form.competences.trim().length < 3) e.competences = 'Les compétences doivent faire au moins 3 caractères';
    if (!form.experience.trim()) e.experience = "L'expérience est requise";
    else if (form.experience.trim().length < 2) e.experience = "L'expérience doit faire au moins 2 caractères";
    if (!form.niveau_etudes.trim()) e.niveau_etudes = "Le niveau d'études est requis";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`http://localhost:8000/offres/${offre.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getToken()}`,
        },
        body: JSON.stringify({
          title: form.title,
          description: form.description,
          competences: form.competences,
          experience: form.experience,
          niveau_etudes: form.niveau_etudes,
          type_contrat: form.type_contrat || null,
          date_limite: form.date_limite || null,
          nombre_postes: Number(form.nombre_postes),
          statut: form.statut,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        if (Array.isArray(data.detail)) {
          setError(data.detail.map((e: { msg: string }) => e.msg).join(', '));
        } else {
          setError(data.detail || 'Erreur lors de la modification');
        }
        return;
      }
      onUpdate(data);
      onClose();
    } catch {
      setError('Impossible de contacter le serveur');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
          <div>
            <h2 className="text-lg font-bold text-gray-900">Modifier l'offre</h2>
            <p className="text-gray-500 text-sm mt-0.5">Modifiez les informations de l'offre</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-400 transition-colors">
            <X size={18} />
          </button>
        </div>

        {error && (
          <div className="mx-6 mt-4 p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Titre du poste *</label>
            <input
              type="text"
              value={form.title}
              onChange={e => setForm({ ...form, title: e.target.value })}
              className={`w-full px-4 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-[#0D3349]/30 transition ${errors.title ? 'border-red-300 bg-red-50' : 'border-gray-200'}`}
            />
            {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Description *</label>
            <textarea
              rows={3}
              value={form.description}
              onChange={e => setForm({ ...form, description: e.target.value })}
              className={`w-full px-4 py-2.5 rounded-xl border text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[#0D3349]/30 transition ${errors.description ? 'border-red-300 bg-red-50' : 'border-gray-200'}`}
            />
            {errors.description && <p className="text-red-500 text-xs mt-1">{errors.description}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Compétences requises *</label>
            <input
              type="text"
              value={form.competences}
              onChange={e => setForm({ ...form, competences: e.target.value })}
              className={`w-full px-4 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-[#0D3349]/30 transition ${errors.competences ? 'border-red-300 bg-red-50' : 'border-gray-200'}`}
            />
            {errors.competences && <p className="text-red-500 text-xs mt-1">{errors.competences}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Expérience requise *</label>
              <input
                type="text"
                value={form.experience}
                onChange={e => setForm({ ...form, experience: e.target.value })}
                className={`w-full px-4 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-[#0D3349]/30 transition ${errors.experience ? 'border-red-300 bg-red-50' : 'border-gray-200'}`}
              />
              {errors.experience && <p className="text-red-500 text-xs mt-1">{errors.experience}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Niveau d'études *</label>
              <div className="relative">
                <select
                  value={form.niveau_etudes}
                  onChange={e => setForm({ ...form, niveau_etudes: e.target.value })}
                  className={`w-full px-4 py-2.5 rounded-xl border text-sm appearance-none focus:outline-none focus:ring-2 focus:ring-[#0D3349]/30 transition bg-white ${errors.niveau_etudes ? 'border-red-300 bg-red-50' : 'border-gray-200'}`}
                >
                  <option value="">Choisir...</option>
                  <option>Bac</option>
                  <option>Bac+2</option>
                  <option>Bac+3</option>
                  <option>Bac+5</option>
                  <option>Doctorat</option>
                </select>
                <ChevronDown size={14} className="absolute right-3 top-3.5 text-gray-400 pointer-events-none" />
              </div>
              {errors.niveau_etudes && <p className="text-red-500 text-xs mt-1">{errors.niveau_etudes}</p>}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Type de contrat</label>
              <div className="relative">
                <select
                  value={form.type_contrat}
                  onChange={e => setForm({ ...form, type_contrat: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm appearance-none focus:outline-none focus:ring-2 focus:ring-[#0D3349]/30 transition bg-white"
                >
                  <option value="">Choisir...</option>
                  {TYPE_CONTRAT_OPTIONS.map(t => <option key={t}>{t}</option>)}
                </select>
                <ChevronDown size={14} className="absolute right-3 top-3.5 text-gray-400 pointer-events-none" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Nombre de postes</label>
              <input
                type="number"
                min="1"
                max="50"
                value={form.nombre_postes}
                onChange={e => setForm({ ...form, nombre_postes: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#0D3349]/30 transition"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Date limite</label>
              <input
                type="date"
                value={form.date_limite}
                onChange={e => setForm({ ...form, date_limite: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#0D3349]/30 transition"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Statut</label>
              <div className="relative">
                <select
                  value={form.statut}
                  onChange={e => setForm({ ...form, statut: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm appearance-none focus:outline-none focus:ring-2 focus:ring-[#0D3349]/30 transition bg-white"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
                <ChevronDown size={14} className="absolute right-3 top-3.5 text-gray-400 pointer-events-none" />
              </div>
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-gray-200 text-gray-700 text-sm font-medium hover:bg-gray-50 transition-all">
              Annuler
            </button>
            <button type="submit" disabled={loading} className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-[#0D3349] to-[#1a4a6b] text-white text-sm font-semibold hover:opacity-90 transition-all disabled:opacity-50">
              {loading ? 'Enregistrement...' : 'Enregistrer les modifications'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function AddOfferModal({ onClose, onAdd }: { onClose: () => void; onAdd: (offre: Offre) => void }) {
  const [form, setForm] = useState({
    title: '',
    description: '',
    competences: '',
    experience: '',
    niveau_etudes: '',
    type_contrat: '',
    date_limite: '',
    nombre_postes: '1',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.title.trim()) e.title = 'Le titre est requis';
    else if (form.title.trim().length < 3) e.title = 'Le titre doit faire au moins 3 caractères';
    if (!form.description.trim()) e.description = 'La description est requise';
    else if (form.description.trim().length < 10) e.description = 'La description doit faire au moins 10 caractères';
    if (!form.competences.trim()) e.competences = 'Les compétences sont requises';
    else if (form.competences.trim().length < 3) e.competences = 'Les compétences doivent faire au moins 3 caractères';
    if (!form.experience.trim()) e.experience = "L'expérience est requise";
    else if (form.experience.trim().length < 2) e.experience = "L'expérience doit faire au moins 2 caractères";
    if (!form.niveau_etudes.trim()) e.niveau_etudes = "Le niveau d'études est requis";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    setError('');
    try {
      const res = await fetch('http://localhost:8000/offres/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getToken()}`,
        },
        body: JSON.stringify({
          title: form.title,
          description: form.description,
          competences: form.competences,
          experience: form.experience,
          niveau_etudes: form.niveau_etudes,
          type_contrat: form.type_contrat || null,
          date_limite: form.date_limite || null,
          nombre_postes: Number(form.nombre_postes),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        if (Array.isArray(data.detail)) {
          setError(data.detail.map((e: { msg: string }) => e.msg).join(', '));
        } else {
          setError(data.detail || 'Erreur lors de la création');
        }
        return;
      }
      onAdd(data);
      onClose();
    } catch {
      setError('Impossible de contacter le serveur');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
          <div>
            <h2 className="text-lg font-bold text-gray-900">Nouvelle offre</h2>
            <p className="text-gray-500 text-sm mt-0.5">Remplissez les informations de l'offre</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-400 transition-colors">
            <X size={18} />
          </button>
        </div>

        {error && (
          <div className="mx-6 mt-4 p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Titre du poste *</label>
            <input
              type="text"
              placeholder="ex: Développeur React Senior"
              value={form.title}
              onChange={e => setForm({ ...form, title: e.target.value })}
              className={`w-full px-4 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-[#0D3349]/30 transition ${errors.title ? 'border-red-300 bg-red-50' : 'border-gray-200'}`}
            />
            {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Description *</label>
            <textarea
              rows={3}
              placeholder="Décrivez le poste, les responsabilités..."
              value={form.description}
              onChange={e => setForm({ ...form, description: e.target.value })}
              className={`w-full px-4 py-2.5 rounded-xl border text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[#0D3349]/30 transition ${errors.description ? 'border-red-300 bg-red-50' : 'border-gray-200'}`}
            />
            {errors.description && <p className="text-red-500 text-xs mt-1">{errors.description}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Compétences requises *</label>
            <input
              type="text"
              placeholder="ex: React, Node.js, PostgreSQL"
              value={form.competences}
              onChange={e => setForm({ ...form, competences: e.target.value })}
              className={`w-full px-4 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-[#0D3349]/30 transition ${errors.competences ? 'border-red-300 bg-red-50' : 'border-gray-200'}`}
            />
            {errors.competences && <p className="text-red-500 text-xs mt-1">{errors.competences}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Expérience requise *</label>
              <input
                type="text"
                placeholder="ex: 3 ans"
                value={form.experience}
                onChange={e => setForm({ ...form, experience: e.target.value })}
                className={`w-full px-4 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-[#0D3349]/30 transition ${errors.experience ? 'border-red-300 bg-red-50' : 'border-gray-200'}`}
              />
              {errors.experience && <p className="text-red-500 text-xs mt-1">{errors.experience}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Niveau d'études *</label>
              <div className="relative">
                <select
                  value={form.niveau_etudes}
                  onChange={e => setForm({ ...form, niveau_etudes: e.target.value })}
                  className={`w-full px-4 py-2.5 rounded-xl border text-sm appearance-none focus:outline-none focus:ring-2 focus:ring-[#0D3349]/30 transition bg-white ${errors.niveau_etudes ? 'border-red-300 bg-red-50' : 'border-gray-200'}`}
                >
                  <option value="">Choisir...</option>
                  <option>Bac</option>
                  <option>Bac+2</option>
                  <option>Bac+3</option>
                  <option>Bac+5</option>
                  <option>Doctorat</option>
                </select>
                <ChevronDown size={14} className="absolute right-3 top-3.5 text-gray-400 pointer-events-none" />
              </div>
              {errors.niveau_etudes && <p className="text-red-500 text-xs mt-1">{errors.niveau_etudes}</p>}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Type de contrat</label>
              <div className="relative">
                <select
                  value={form.type_contrat}
                  onChange={e => setForm({ ...form, type_contrat: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm appearance-none focus:outline-none focus:ring-2 focus:ring-[#0D3349]/30 transition bg-white"
                >
                  <option value="">Choisir...</option>
                  {TYPE_CONTRAT_OPTIONS.map(t => <option key={t}>{t}</option>)}
                </select>
                <ChevronDown size={14} className="absolute right-3 top-3.5 text-gray-400 pointer-events-none" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Nombre de postes</label>
              <input
                type="number"
                min="1"
                max="50"
                value={form.nombre_postes}
                onChange={e => setForm({ ...form, nombre_postes: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#0D3349]/30 transition"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Date limite</label>
            <input
              type="date"
              value={form.date_limite}
              onChange={e => setForm({ ...form, date_limite: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#0D3349]/30 transition"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-gray-200 text-gray-700 text-sm font-medium hover:bg-gray-50 transition-all">
              Annuler
            </button>
            <button type="submit" disabled={loading} className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-[#0D3349] to-[#1a4a6b] text-white text-sm font-semibold hover:opacity-90 transition-all disabled:opacity-50">
              {loading ? 'Publication...' : "Publier l'offre"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function GestionOffres() {
  const [offres, setOffres] = useState<Offre[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [selectedOffre, setSelectedOffre] = useState<Offre | null>(null);
  const [editOffre, setEditOffre] = useState<Offre | null>(null);
  const [filter, setFilter] = useState<'Toutes' | 'active' | 'inactive'>('Toutes');

  useEffect(() => {
    fetchOffres();
  }, []);

  const fetchOffres = async () => {
    setLoading(true);
    try {
      const res = await fetch('http://localhost:8000/offres/mes-offres', {
        headers: { 'Authorization': `Bearer ${getToken()}` },
      });
      const data = await res.json();
      if (!res.ok) {
        setError('Erreur lors du chargement des offres');
        return;
      }
      setOffres(data);
    } catch {
      setError('Impossible de contacter le serveur');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Supprimer cette offre ?')) return;
    try {
      const res = await fetch(`http://localhost:8000/offres/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${getToken()}` },
      });
      if (!res.ok) {
        alert('Erreur lors de la suppression');
        return;
      }
      setOffres(prev => prev.filter(o => o.id !== id));
    } catch {
      alert('Erreur lors de la suppression');
    }
  };

  const filtered = filter === 'Toutes' ? offres : offres.filter(o => o.statut === filter);

  return (
    <>
      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .fu { animation: fadeUp 0.45s cubic-bezier(.16,1,.3,1) forwards; opacity: 0; }
      `}</style>

      {showModal && <AddOfferModal onClose={() => setShowModal(false)} onAdd={(o) => setOffres(prev => [o, ...prev])} />}
      {selectedOffre && <ViewOfferModal offre={selectedOffre} onClose={() => setSelectedOffre(null)} />}
      {editOffre && (
        <EditOfferModal
          offre={editOffre}
          onClose={() => setEditOffre(null)}
          onUpdate={(updated) => {
            setOffres(prev => prev.map(o => o.id === updated.id ? updated : o));
            setEditOffre(null);
          }}
        />
      )}

      <div className="p-6 space-y-5 bg-gradient-to-br from-slate-50 to-indigo-50/30 min-h-full">
        <div className="fu flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Gestion des Offres</h1>
            <p className="text-gray-500 text-sm mt-0.5">{offres.length} offres au total</p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-[#FF6B6B] to-rose-500 text-white font-semibold rounded-xl hover:opacity-90 transition-all shadow-sm text-sm"
          >
            <Plus size={16} /> Nouvelle offre
          </button>
        </div>

        <div className="fu flex items-center gap-2">
          {(['Toutes', 'active', 'inactive'] as const).map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all capitalize ${filter === f ? 'bg-[#0D3349] text-white' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'}`}
            >
              {f}
            </button>
          ))}
        </div>

        {loading && (
          <div className="text-center py-16 text-gray-400">
            <div className="w-8 h-8 border-2 border-[#0D3349] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            Chargement...
          </div>
        )}

        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">{error}</div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map((offre, i) => (
            <div
              key={offre.id}
              className="fu bg-white rounded-2xl border border-gray-100 shadow-sm p-5 hover:shadow-md transition-all"
              style={{ animationDelay: `${160 + i * 60}ms` }}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <h3 className="font-semibold text-gray-900 truncate">{offre.title}</h3>
                    <span className={`flex-shrink-0 px-2 py-0.5 rounded-full text-xs font-semibold ${offre.statut === 'active' ? 'bg-emerald-50 text-emerald-700' : 'bg-gray-100 text-gray-500'}`}>
                      {offre.statut}
                    </span>
                    {offre.type_contrat && (
                      <span className={`flex-shrink-0 px-2 py-0.5 rounded-full text-xs font-semibold border ${TYPE_CONTRAT_CLS[offre.type_contrat] ?? 'bg-gray-50 text-gray-600 border-gray-200'}`}>
                        {offre.type_contrat}
                      </span>
                    )}
                  </div>
                  <p className="text-gray-400 text-xs mt-1 line-clamp-2">{offre.description}</p>
                  <div className="flex items-center gap-3 text-gray-400 text-xs mt-2">
                    <span>{offre.experience}</span>
                    <span>•</span>
                    <span>{offre.niveau_etudes}</span>
                  </div>
                </div>
                <div className="flex items-center gap-1 flex-shrink-0">
                  <button
                    onClick={() => setSelectedOffre(offre)}
                    className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-blue-50 text-blue-400 transition-colors"
                    title="Voir les détails"
                  >
                    <Eye size={15} />
                  </button>
                  <button
                    onClick={() => setEditOffre(offre)}
                    className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-amber-50 text-amber-400 transition-colors"
                    title="Modifier"
                  >
                    <Edit2 size={15} />
                  </button>
                  <Link
                    href={`/recruteur/toutes-candidatures?offre_id=${offre.id}&titre=${encodeURIComponent(offre.title)}`}
                    className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-indigo-50 text-indigo-400 transition-colors"
                    title="Candidatures"
                  >
                    <Users size={15} />
                  </Link>
                  <button
                    onClick={() => handleDelete(offre.id)}
                    className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-red-50 text-red-400 transition-colors"
                    title="Supprimer"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-50">
                <div className="flex items-center gap-4 text-sm">
                  <div className="flex items-center gap-1.5 text-gray-600">
                    <Briefcase size={14} className="text-[#FF6B6B]" />
                    <span className="font-semibold text-gray-900">{offre.nombre_postes}</span>
                    <span className="text-gray-400">postes</span>
                  </div>
                  {offre.date_limite && (
                    <span className="text-gray-400 text-xs">Limite: {offre.date_limite}</span>
                  )}
                </div>
                <span className="text-gray-400 text-xs">
                  {new Date(offre.date_creation).toLocaleDateString('fr-FR')}
                </span>
              </div>
            </div>
          ))}
        </div>

        {!loading && filtered.length === 0 && (
          <div className="text-center py-16 text-gray-400">
            <Briefcase size={40} className="mx-auto mb-3 opacity-30" />
            <p className="font-medium">Aucune offre trouvée</p>
          </div>
        )}
      </div>
    </>
  );
}