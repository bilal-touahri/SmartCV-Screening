'use client';

import { useEffect, useState } from 'react';
import {
  User, Mail, Edit2, Check, X, KeyRound,
  FileText, Download, Upload, AlertCircle,
} from 'lucide-react';

type UserInfo = { id: number; full_name: string; email: string; role_id: number | null };
type CV = { id: number; chemin_fichier: string; date_upload: string; valide: boolean };

function getToken() { return localStorage.getItem('access_token'); }

function initials(name: string) {
  return name.split(' ').map(w => w[0] ?? '').join('').toUpperCase().slice(0, 2) || '?';
}

export default function CandidatProfil() {
  /* ── user ── */
  const [user, setUser]           = useState<UserInfo | null>(null);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState('');

  /* ── edit info ── */
  const [editing, setEditing]     = useState(false);
  const [saving, setSaving]       = useState(false);
  const [saveError, setSaveError] = useState('');
  const [saveOk, setSaveOk]       = useState(false);
  const [form, setForm]           = useState({ full_name: '', email: '' });

  /* ── password ── */
  const [pwEditing, setPwEditing] = useState(false);
  const [pwSaving, setPwSaving]   = useState(false);
  const [pwError, setPwError]     = useState('');
  const [pwOk, setPwOk]           = useState(false);
  const [pwForm, setPwForm]       = useState({ current_password: '', new_password: '', confirm: '' });

  /* ── CV ── */
  const [cv, setCv]                   = useState<CV | null>(null);
  const [cvLoading, setCvLoading]     = useState(true);
  const [downloading, setDownloading] = useState(false);
  const [cvUploading, setCvUploading] = useState(false);
  const [cvError, setCvError]         = useState('');
  const [cvSuccess, setCvSuccess]     = useState(false);
  const [pendingFile, setPendingFile] = useState<File | null>(null);

  /* ── load user ── */
  useEffect(() => {
    fetch('http://localhost:8000/auth/me', {
      headers: { Authorization: `Bearer ${getToken()}` },
    })
      .then(r => r.ok ? r.json() : Promise.reject())
      .then((data: UserInfo) => {
        setUser(data);
        setForm({ full_name: data.full_name, email: data.email });
        try {
          const stored = JSON.parse(localStorage.getItem('user') ?? '{}');
          localStorage.setItem('user', JSON.stringify({ ...stored, full_name: data.full_name, email: data.email }));
        } catch { /* ignore */ }
      })
      .catch(() => {
        /* fallback to localStorage */
        try {
          const raw = localStorage.getItem('user');
          if (raw) {
            const u = JSON.parse(raw);
            const fake: UserInfo = { id: 0, full_name: u.full_name ?? u.name ?? '', email: u.email ?? '', role_id: null };
            setUser(fake);
            setForm({ full_name: fake.full_name, email: fake.email });
          } else {
            setError('Impossible de charger le profil.');
          }
        } catch { setError('Impossible de charger le profil.'); }
      })
      .finally(() => setLoading(false));
  }, []);

  /* ── load CV ── */
  useEffect(() => {
    fetch('http://localhost:8000/cvs/mon-cv', {
      headers: { Authorization: `Bearer ${getToken()}` },
    })
      .then(r => r.ok ? r.json() : r.status === 404 ? null : Promise.reject())
      .then((data: CV | null) => setCv(data))
      .catch(() => { /* CV non disponible */ })
      .finally(() => setCvLoading(false));
  }, []);

  /* ── save info ── */
  const handleSave = async () => {
    setSaving(true); setSaveError(''); setSaveOk(false);
    try {
      const res  = await fetch('http://localhost:8000/auth/me', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${getToken()}` },
        body: JSON.stringify({ full_name: form.full_name || undefined, email: form.email || undefined }),
      });
      const data = await res.json();
      if (!res.ok) {
        setSaveError(Array.isArray(data.detail) ? data.detail.map((e: { msg: string }) => e.msg).join(', ') : (data.detail ?? 'Erreur'));
        return;
      }
      setUser(data);
      setForm({ full_name: data.full_name, email: data.email });
      try {
        const stored = JSON.parse(localStorage.getItem('user') ?? '{}');
        localStorage.setItem('user', JSON.stringify({ ...stored, full_name: data.full_name, email: data.email }));
      } catch { /* ignore */ }
      setSaveOk(true);
      setEditing(false);
    } catch { setSaveError('Impossible de contacter le serveur.'); }
    finally { setSaving(false); }
  };

  /* ── save password ── */
  const handlePasswordSave = async () => {
    setPwError('');
    if (pwForm.new_password !== pwForm.confirm) { setPwError('Les mots de passe ne correspondent pas.'); return; }
    if (pwForm.new_password.length < 6)          { setPwError('Minimum 6 caractères.'); return; }
    setPwSaving(true);
    try {
      const res  = await fetch('http://localhost:8000/auth/me/password', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${getToken()}` },
        body: JSON.stringify({ current_password: pwForm.current_password, new_password: pwForm.new_password }),
      });
      const data = await res.json();
      if (!res.ok) { setPwError(data.detail ?? 'Erreur'); return; }
      setPwOk(true);
      setPwEditing(false);
      setPwForm({ current_password: '', new_password: '', confirm: '' });
    } catch { setPwError('Impossible de contacter le serveur.'); }
    finally { setPwSaving(false); }
  };

  /* ── upload / replace CV ── */
  const handleCvFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCvError(''); setCvSuccess(false);
    const f = e.target.files?.[0];
    if (!f) return;
    if (f.type !== 'application/pdf') { setCvError('Seuls les fichiers PDF sont acceptés.'); return; }
    if (f.size > 10 * 1024 * 1024)   { setCvError('Le fichier ne doit pas dépasser 10 MB.'); return; }
    setPendingFile(f);
  };

  const handleCvUpload = async () => {
    if (!pendingFile) return;
    setCvUploading(true); setCvError(''); setCvSuccess(false);
    try {
      const formData = new FormData();
      formData.append('fichier', pendingFile);
      const url    = cv ? `http://localhost:8000/cvs/${cv.id}` : 'http://localhost:8000/cvs/';
      const method = cv ? 'PUT' : 'POST';
      const res    = await fetch(url, {
        method,
        headers: { Authorization: `Bearer ${getToken()}` },
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) { setCvError(data.detail ?? 'Erreur lors de l\'upload.'); return; }
      setCv(data);
      setPendingFile(null);
      setCvSuccess(true);
    } catch { setCvError('Impossible de contacter le serveur.'); }
    finally { setCvUploading(false); }
  };

  /* ── download CV ── */
  const handleDownload = async () => {
    if (!cv) return;
    setDownloading(true);
    try {
      const res = await fetch(`http://localhost:8000/cvs/${cv.id}/download`, {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      if (!res.ok) { alert('Impossible de télécharger le CV.'); return; }
      const blob = await res.blob();
      const url  = URL.createObjectURL(blob);
      const a    = document.createElement('a');
      a.href     = url;
      a.download = cv.chemin_fichier.split(/[\\/]/).pop() ?? `cv_${cv.id}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch { alert('Impossible de contacter le serveur.'); }
    finally { setDownloading(false); }
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-full p-6">
      <div className="w-8 h-8 border-2 border-[#FF6B6B] border-t-transparent rounded-full animate-spin" />
    </div>
  );

  if (error) return (
    <div className="p-6">
      <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm flex items-center gap-2">
        <AlertCircle size={16} /> {error}
      </div>
    </div>
  );

  return (
    <>
      <style>{`
        @keyframes fadeUp { from { opacity:0; transform:translateY(16px); } to { opacity:1; transform:translateY(0); } }
        .fu { animation: fadeUp 0.45s cubic-bezier(.16,1,.3,1) forwards; opacity:0; }
      `}</style>

      <div className="p-6 space-y-5 bg-gradient-to-br from-slate-50 to-rose-50/20 min-h-full">

        {/* Header card */}
        <div className="fu bg-gradient-to-r from-[#0D3349] to-[#1a4a6b] rounded-2xl p-6 text-white flex items-center gap-5" style={{ animationDelay: '0ms' }}>
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#FF6B6B] to-rose-400 flex items-center justify-center text-white font-bold text-2xl flex-shrink-0">
            {initials(user?.full_name ?? '')}
          </div>
          <div>
            <h1 className="text-xl font-bold">{user?.full_name}</h1>
            <p className="text-white/60 text-sm mt-0.5">{user?.email}</p>
            <span className="mt-2 inline-block px-2.5 py-0.5 bg-white/15 rounded-full text-xs font-medium">Candidat</span>
          </div>
        </div>

        {/* Informations personnelles */}
        <div className="fu bg-white rounded-2xl border border-gray-100 shadow-sm" style={{ animationDelay: '80ms' }}>
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
            <h2 className="font-semibold text-gray-900">Informations personnelles</h2>
            {!editing ? (
              <button
                onClick={() => { setEditing(true); setSaveOk(false); }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#FF6B6B]/10 hover:bg-[#FF6B6B]/20 text-[#FF6B6B] text-sm font-medium transition-all"
              >
                <Edit2 size={14} /> Modifier
              </button>
            ) : (
              <div className="flex gap-2">
                <button
                  onClick={() => { setEditing(false); setSaveError(''); if (user) setForm({ full_name: user.full_name, email: user.email }); }}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-gray-200 text-gray-500 text-sm hover:bg-gray-50 transition-all"
                >
                  <X size={14} /> Annuler
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#FF6B6B] text-white text-sm font-medium hover:opacity-90 transition-all disabled:opacity-50"
                >
                  <Check size={14} /> {saving ? 'Enregistrement…' : 'Enregistrer'}
                </button>
              </div>
            )}
          </div>
          <div className="p-6 space-y-4">
            {saveError && <p className="text-red-600 text-sm bg-red-50 border border-red-200 rounded-xl px-4 py-2">{saveError}</p>}
            {saveOk    && <p className="text-emerald-600 text-sm bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-2">Profil mis à jour avec succès.</p>}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1.5">
                  <User size={12} className="inline mr-1" /> Nom complet
                </label>
                {editing ? (
                  <input
                    type="text"
                    value={form.full_name}
                    onChange={e => setForm({ ...form, full_name: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#FF6B6B]/30 transition"
                  />
                ) : (
                  <p className="text-gray-800 font-medium">{user?.full_name}</p>
                )}
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1.5">
                  <Mail size={12} className="inline mr-1" /> Adresse email
                </label>
                {editing ? (
                  <input
                    type="email"
                    value={form.email}
                    onChange={e => setForm({ ...form, email: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#FF6B6B]/30 transition"
                  />
                ) : (
                  <p className="text-gray-800 font-medium">{user?.email}</p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Mot de passe */}
        <div className="fu bg-white rounded-2xl border border-gray-100 shadow-sm" style={{ animationDelay: '160ms' }}>
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
            <h2 className="font-semibold text-gray-900">Mot de passe</h2>
            {!pwEditing ? (
              <button
                onClick={() => { setPwEditing(true); setPwOk(false); setPwError(''); }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#FF6B6B]/10 hover:bg-[#FF6B6B]/20 text-[#FF6B6B] text-sm font-medium transition-all"
              >
                <KeyRound size={14} /> Changer
              </button>
            ) : (
              <div className="flex gap-2">
                <button
                  onClick={() => { setPwEditing(false); setPwError(''); setPwForm({ current_password: '', new_password: '', confirm: '' }); }}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-gray-200 text-gray-500 text-sm hover:bg-gray-50 transition-all"
                >
                  <X size={14} /> Annuler
                </button>
                <button
                  onClick={handlePasswordSave}
                  disabled={pwSaving}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#FF6B6B] text-white text-sm font-medium hover:opacity-90 transition-all disabled:opacity-50"
                >
                  <Check size={14} /> {pwSaving ? 'Enregistrement…' : 'Enregistrer'}
                </button>
              </div>
            )}
          </div>
          <div className="p-6">
            {!pwEditing ? (
              <p className="text-gray-400 text-sm">••••••••••••</p>
            ) : (
              <div className="space-y-3 max-w-sm">
                {pwError && <p className="text-red-600 text-sm bg-red-50 border border-red-200 rounded-xl px-4 py-2">{pwError}</p>}
                {pwOk    && <p className="text-emerald-600 text-sm bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-2">Mot de passe mis à jour.</p>}
                {[
                  { label: 'Mot de passe actuel', key: 'current_password' },
                  { label: 'Nouveau mot de passe', key: 'new_password' },
                  { label: 'Confirmer le nouveau mot de passe', key: 'confirm' },
                ].map(({ label, key }) => (
                  <div key={key}>
                    <label className="block text-xs font-medium text-gray-500 mb-1">{label}</label>
                    <input
                      type="password"
                      value={pwForm[key as keyof typeof pwForm]}
                      onChange={e => setPwForm({ ...pwForm, [key]: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#FF6B6B]/30 transition"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* CV */}
        <div className="fu bg-white rounded-2xl border border-gray-100 shadow-sm" style={{ animationDelay: '240ms' }}>
          <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-2">
            <div className="w-6 h-6 bg-gradient-to-br from-[#FF6B6B] to-rose-500 rounded-lg flex items-center justify-center">
              <FileText size={12} className="text-white" />
            </div>
            <h2 className="font-semibold text-gray-900">Curriculum Vitae</h2>
          </div>
          <div className="p-6 space-y-4">
            {cvLoading ? (
              <div className="flex items-center gap-2 text-gray-400 text-sm">
                <div className="w-4 h-4 border-2 border-gray-300 border-t-transparent rounded-full animate-spin" />
                Chargement…
              </div>
            ) : cv ? (
              <div className="flex items-center justify-between p-4 bg-emerald-50 border border-emerald-200 rounded-xl">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center flex-shrink-0">
                    <FileText size={18} className="text-emerald-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-emerald-900 text-sm">
                      {cv.chemin_fichier.split(/[\\/]/).pop() ?? `cv_${cv.id}.pdf`}
                    </p>
                    <p className="text-emerald-600 text-xs mt-0.5">
                      Uploadé le {new Date(cv.date_upload).toLocaleDateString('fr-FR')}
                      {cv.valide && ' · Validé'}
                    </p>
                  </div>
                </div>
                <button
                  onClick={handleDownload}
                  disabled={downloading}
                  className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-medium rounded-xl transition-all disabled:opacity-50"
                >
                  <Download size={14} />
                  {downloading ? 'Téléchargement…' : 'Télécharger'}
                </button>
              </div>
            ) : (
              <p className="text-gray-400 text-sm">Aucun CV enregistré. Uploadez-en un ci-dessous.</p>
            )}

            {/* Zone upload / remplacement */}
            {cvError  && <p className="text-red-600 text-sm bg-red-50 border border-red-200 rounded-xl px-4 py-2">{cvError}</p>}
            {cvSuccess && <p className="text-emerald-600 text-sm bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-2">CV {cv ? 'remplacé' : 'uploadé'} avec succès.</p>}

            <label className={`flex flex-col items-center justify-center gap-2 w-full h-28 rounded-xl border-2 border-dashed cursor-pointer transition-all
              ${pendingFile ? 'border-[#FF6B6B]/60 bg-rose-50' : 'border-gray-200 hover:border-[#FF6B6B]/40 hover:bg-gray-50'}`}>
              <input type="file" accept=".pdf,application/pdf" onChange={handleCvFileChange} className="hidden" />
              {pendingFile ? (
                <>
                  <FileText size={20} className="text-[#FF6B6B]" />
                  <span className="text-sm font-medium text-[#FF6B6B] truncate max-w-xs">{pendingFile.name}</span>
                  <span className="text-xs text-rose-400">{(pendingFile.size / 1024 / 1024).toFixed(2)} MB · cliquez pour changer</span>
                </>
              ) : (
                <>
                  <Upload size={20} className="text-gray-300" />
                  <span className="text-sm text-gray-500">{cv ? 'Remplacer le CV' : 'Uploader un CV'} (PDF · max 10 MB)</span>
                </>
              )}
            </label>

            {pendingFile && (
              <button
                onClick={handleCvUpload}
                disabled={cvUploading}
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-[#FF6B6B] to-rose-500 text-white text-sm font-semibold hover:opacity-90 transition-all disabled:opacity-50"
              >
                {cvUploading ? 'Upload en cours…' : cv ? 'Remplacer le CV' : 'Enregistrer le CV'}
              </button>
            )}
          </div>
        </div>

      </div>
    </>
  );
}
