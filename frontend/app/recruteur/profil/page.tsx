'use client';

import { useEffect, useState } from 'react';
import { User, Mail, Edit2, Check, X, KeyRound } from 'lucide-react';

type UserInfo = { id: number; full_name: string; email: string; role_id: number | null };

function getToken() { return localStorage.getItem('access_token'); }

export default function RecruteurProfil() {
  const [user, setUser]         = useState<UserInfo | null>(null);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState('');
  const [editing, setEditing]   = useState(false);
  const [saving, setSaving]     = useState(false);
  const [saveError, setSaveError]   = useState('');
  const [saveSuccess, setSaveSuccess] = useState(false);

  const [form, setForm] = useState({ full_name: '', email: '' });

  // Password change state
  const [pwEditing, setPwEditing]   = useState(false);
  const [pwSaving, setPwSaving]     = useState(false);
  const [pwError, setPwError]       = useState('');
  const [pwSuccess, setPwSuccess]   = useState(false);
  const [pwForm, setPwForm]         = useState({ current_password: '', new_password: '', confirm: '' });

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch('http://localhost:8000/auth/me', {
          headers: { Authorization: `Bearer ${getToken()}` },
        });
        if (!res.ok) { setError('Impossible de charger le profil.'); return; }
        const data: UserInfo = await res.json();
        setUser(data);
        setForm({ full_name: data.full_name, email: data.email });
      } catch {
        setError('Impossible de contacter le serveur.');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    setSaveError('');
    setSaveSuccess(false);
    try {
      const res = await fetch('http://localhost:8000/auth/me', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${getToken()}`,
        },
        body: JSON.stringify({ full_name: form.full_name || undefined, email: form.email || undefined }),
      });
      const data = await res.json();
      if (!res.ok) {
        setSaveError(Array.isArray(data.detail) ? data.detail.map((e: { msg: string }) => e.msg).join(', ') : (data.detail ?? 'Erreur'));
        return;
      }
      setUser(data);
      setForm({ full_name: data.full_name, email: data.email });
      // Sync localStorage so sidebar updates
      try {
        const stored = JSON.parse(localStorage.getItem('user') ?? '{}');
        localStorage.setItem('user', JSON.stringify({ ...stored, full_name: data.full_name, email: data.email }));
      } catch { /* ignore */ }
      setSaveSuccess(true);
      setEditing(false);
    } catch {
      setSaveError('Impossible de contacter le serveur.');
    } finally {
      setSaving(false);
    }
  };

  const handleCancelEdit = () => {
    if (user) setForm({ full_name: user.full_name, email: user.email });
    setEditing(false);
    setSaveError('');
  };

  const handlePasswordSave = async () => {
    setPwError('');
    if (pwForm.new_password !== pwForm.confirm) { setPwError('Les mots de passe ne correspondent pas.'); return; }
    if (pwForm.new_password.length < 6) { setPwError('Le mot de passe doit faire au moins 6 caractères.'); return; }
    setPwSaving(true);
    try {
      const res = await fetch('http://localhost:8000/auth/me/password', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${getToken()}` },
        body: JSON.stringify({ current_password: pwForm.current_password, new_password: pwForm.new_password }),
      });
      const data = await res.json();
      if (!res.ok) { setPwError(data.detail ?? 'Erreur'); return; }
      setPwSuccess(true);
      setPwEditing(false);
      setPwForm({ current_password: '', new_password: '', confirm: '' });
    } catch {
      setPwError('Impossible de contacter le serveur.');
    } finally {
      setPwSaving(false);
    }
  };

  const initials = user?.full_name
    ? user.full_name.split(' ').map(w => w[0] ?? '').join('').toUpperCase().slice(0, 2)
    : 'R';

  if (loading) return (
    <div className="flex items-center justify-center min-h-full p-6">
      <div className="w-8 h-8 border-2 border-[#0D3349] border-t-transparent rounded-full animate-spin" />
    </div>
  );

  if (error) return (
    <div className="p-6">
      <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">{error}</div>
    </div>
  );

  return (
    <>
      <style>{`
        @keyframes fadeUp { from { opacity:0; transform:translateY(16px); } to { opacity:1; transform:translateY(0); } }
        .fu { animation: fadeUp 0.45s cubic-bezier(.16,1,.3,1) forwards; opacity:0; }
      `}</style>

      <div className="p-6 space-y-5 bg-gradient-to-br from-slate-50 to-indigo-50/30 min-h-full">

        {/* Header card */}
        <div className="fu bg-gradient-to-r from-[#0D3349] to-[#1a4a6b] rounded-2xl p-6 text-white flex items-center gap-5" style={{ animationDelay: '0ms' }}>
          <div className="w-16 h-16 rounded-2xl bg-white/20 flex items-center justify-center text-2xl font-bold flex-shrink-0">
            {initials}
          </div>
          <div>
            <h1 className="text-xl font-bold">{user?.full_name}</h1>
            <p className="text-white/60 text-sm mt-0.5">{user?.email}</p>
            <span className="mt-2 inline-block px-2.5 py-0.5 bg-white/15 rounded-full text-xs font-medium">Recruteur</span>
          </div>
        </div>

        {/* Informations personnelles */}
        <div className="fu bg-white rounded-2xl border border-gray-100 shadow-sm" style={{ animationDelay: '80ms' }}>
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
            <h2 className="font-semibold text-gray-900">Informations personnelles</h2>
            {!editing ? (
              <button
                onClick={() => { setEditing(true); setSaveSuccess(false); }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#0D3349]/8 hover:bg-[#0D3349]/15 text-[#0D3349] text-sm font-medium transition-all"
              >
                <Edit2 size={14} /> Modifier
              </button>
            ) : (
              <div className="flex gap-2">
                <button
                  onClick={handleCancelEdit}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-gray-200 text-gray-500 text-sm hover:bg-gray-50 transition-all"
                >
                  <X size={14} /> Annuler
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#0D3349] text-white text-sm font-medium hover:opacity-90 transition-all disabled:opacity-50"
                >
                  <Check size={14} /> {saving ? 'Enregistrement…' : 'Enregistrer'}
                </button>
              </div>
            )}
          </div>

          <div className="p-6 space-y-4">
            {saveError && <p className="text-red-600 text-sm bg-red-50 border border-red-200 rounded-xl px-4 py-2">{saveError}</p>}
            {saveSuccess && <p className="text-emerald-600 text-sm bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-2">Profil mis à jour avec succès.</p>}

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
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#0D3349]/30 transition"
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
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#0D3349]/30 transition"
                  />
                ) : (
                  <p className="text-gray-800 font-medium">{user?.email}</p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Changer le mot de passe */}
        <div className="fu bg-white rounded-2xl border border-gray-100 shadow-sm" style={{ animationDelay: '160ms' }}>
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
            <h2 className="font-semibold text-gray-900">Mot de passe</h2>
            {!pwEditing ? (
              <button
                onClick={() => { setPwEditing(true); setPwSuccess(false); setPwError(''); }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#0D3349]/8 hover:bg-[#0D3349]/15 text-[#0D3349] text-sm font-medium transition-all"
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
                  className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#0D3349] text-white text-sm font-medium hover:opacity-90 transition-all disabled:opacity-50"
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
                {pwSuccess && <p className="text-emerald-600 text-sm bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-2">Mot de passe mis à jour.</p>}
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Mot de passe actuel</label>
                  <input
                    type="password"
                    value={pwForm.current_password}
                    onChange={e => setPwForm({ ...pwForm, current_password: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#0D3349]/30 transition"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Nouveau mot de passe</label>
                  <input
                    type="password"
                    value={pwForm.new_password}
                    onChange={e => setPwForm({ ...pwForm, new_password: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#0D3349]/30 transition"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Confirmer le nouveau mot de passe</label>
                  <input
                    type="password"
                    value={pwForm.confirm}
                    onChange={e => setPwForm({ ...pwForm, confirm: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#0D3349]/30 transition"
                  />
                </div>
              </div>
            )}
          </div>
        </div>

      </div>
    </>
  );
}
