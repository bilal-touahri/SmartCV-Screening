'use client';

import { useEffect, useState } from 'react';
import { UserPlus, X, CheckCircle, XCircle, Loader2 } from 'lucide-react';

type UserRow = {
  id: number;
  full_name: string;
  email: string;
  role_id: number | null;
  is_active: boolean;
  created_at: string | null;
};

function getToken() { return localStorage.getItem('access_token'); }

const ROLE_CFG: Record<number, { label: string; cls: string }> = {
  1: { label: 'Admin',     cls: 'bg-red-50 text-red-700 border-red-200' },
  2: { label: 'Recruteur', cls: 'bg-violet-50 text-violet-700 border-violet-200' },
  3: { label: 'Candidat',  cls: 'bg-blue-50 text-blue-700 border-blue-200' },
};
function roleCfg(id: number | null) {
  return ROLE_CFG[id ?? 3] ?? { label: `Rôle ${id}`, cls: 'bg-gray-50 text-gray-600 border-gray-200' };
}
function initials(n: string) {
  return n.split(' ').map(w => w[0] ?? '').join('').toUpperCase().slice(0, 2) || '?';
}

/* ── Modal créer recruteur ─────────────────────────────────────── */
function CreateRecruteurModal({
  onClose,
  onCreated,
}: {
  onClose: () => void;
  onCreated: (u: UserRow) => void;
}) {
  const [form, setForm] = useState({ full_name: '', email: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); setError('');
    try {
      const res  = await fetch('http://localhost:8000/admin/users', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${getToken()}` },
        body:    JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.detail ?? 'Erreur'); return; }
      onCreated(data);
      onClose();
    } catch { setError('Impossible de contacter le serveur.'); }
    finally  { setLoading(false); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md">
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
          <div>
            <h2 className="text-lg font-bold text-gray-900">Créer un recruteur</h2>
            <p className="text-gray-500 text-sm mt-0.5">Un mot de passe temporaire sera envoyé par email</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-400 transition">
            <X size={18} />
          </button>
        </div>
        {error && <div className="mx-6 mt-4 p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">{error}</div>}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {[
            { label: 'Nom complet',    key: 'full_name', type: 'text',  placeholder: 'ex: Karim Benali' },
            { label: 'Adresse e-mail', key: 'email',     type: 'email', placeholder: 'ex: karim@digitelx.ma' },
          ].map(f => (
            <div key={f.key}>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">{f.label}</label>
              <input
                type={f.type}
                placeholder={f.placeholder}
                required
                value={form[f.key as keyof typeof form]}
                onChange={e => setForm({ ...form, [f.key]: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#0D3349]/30 transition"
              />
            </div>
          ))}
          <div className="flex gap-3 pt-1">
            <button type="button" onClick={onClose}
              className="flex-1 py-2.5 rounded-xl border border-gray-200 text-gray-700 text-sm font-medium hover:bg-gray-50 transition">
              Annuler
            </button>
            <button type="submit" disabled={loading}
              className="flex-1 py-2.5 rounded-xl bg-[#0D3349] text-white text-sm font-semibold hover:opacity-90 transition disabled:opacity-50">
              {loading ? 'Création…' : 'Créer le compte'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ── Page principale ───────────────────────────────────────────── */
export default function AdminUtilisateurs() {
  const [users, setUsers]         = useState<UserRow[]>([]);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState('');
  const [showModal, setShowModal] = useState(false);
  const [filter, setFilter]       = useState<'tous' | '1' | '2' | '3'>('tous');
  const [toggling, setToggling]   = useState<number | null>(null);

  const fetchUsers = () => {
    fetch('http://localhost:8000/admin/users', {
      headers: { Authorization: `Bearer ${getToken()}` },
    })
      .then(r => r.ok ? r.json() : Promise.reject())
      .then(data => setUsers(data))
      .catch(() => setError('Impossible de charger les utilisateurs.'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchUsers(); }, []);

  const toggleActive = async (user: UserRow) => {
    setToggling(user.id);
    try {
      const res  = await fetch(`http://localhost:8000/admin/users/${user.id}`, {
        method:  'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${getToken()}` },
        body:    JSON.stringify({ is_active: !user.is_active }),
      });
      if (res.ok) {
        setUsers(prev => prev.map(u => u.id === user.id ? { ...u, is_active: !u.is_active } : u));
      }
    } finally { setToggling(null); }
  };

  const filtered = filter === 'tous' ? users : users.filter(u => String(u.role_id) === filter);

  return (
    <>
      {showModal && (
        <CreateRecruteurModal
          onClose={() => setShowModal(false)}
          onCreated={u => setUsers(prev => [u, ...prev])}
        />
      )}

      <div className="p-6 space-y-5 bg-gradient-to-br from-slate-50 to-indigo-50/30 min-h-full">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Utilisateurs</h1>
            <p className="text-gray-500 text-sm mt-0.5">{users.length} au total</p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-[#FF6B6B] to-rose-500 text-white font-semibold rounded-xl hover:opacity-90 transition text-sm shadow-sm"
          >
            <UserPlus size={16} /> Créer recruteur
          </button>
        </div>

        {/* Filtres */}
        <div className="flex items-center gap-2">
          {([['tous', 'Tous'], ['1', 'Admin'], ['2', 'Recruteurs'], ['3', 'Candidats']] as const).map(([v, l]) => (
            <button key={v} onClick={() => setFilter(v)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition ${filter === v ? 'bg-[#0D3349] text-white' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'}`}>
              {l}
            </button>
          ))}
        </div>

        {error && <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">{error}</div>}

        {/* Table */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center py-16 text-gray-400 gap-2">
              <Loader2 size={18} className="animate-spin" /> Chargement…
            </div>
          ) : filtered.length === 0 ? (
            <div className="py-16 text-center text-gray-400 text-sm">Aucun utilisateur trouvé</div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/60">
                  {['#', 'Utilisateur', 'E-mail', 'Rôle', 'Statut', 'Inscription', 'Action'].map(h => (
                    <th key={h} className="px-5 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map(u => {
                  const role = roleCfg(u.role_id);
                  return (
                    <tr key={u.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="px-5 py-4 text-gray-400 text-xs font-mono">#{u.id}</td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#0D3349] to-[#1a4a6b] flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                            {initials(u.full_name)}
                          </div>
                          <span className="font-semibold text-gray-900 text-sm">{u.full_name}</span>
                        </div>
                      </td>
                      <td className="px-5 py-4 text-gray-500 text-sm">{u.email}</td>
                      <td className="px-5 py-4">
                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${role.cls}`}>{role.label}</span>
                      </td>
                      <td className="px-5 py-4">
                        {u.is_active
                          ? <span className="flex items-center gap-1.5 text-emerald-600 text-xs font-semibold"><CheckCircle size={13} /> Actif</span>
                          : <span className="flex items-center gap-1.5 text-gray-400 text-xs font-semibold"><XCircle size={13} /> Inactif</span>}
                      </td>
                      <td className="px-5 py-4 text-gray-400 text-xs">
                        {u.created_at ? new Date(u.created_at).toLocaleDateString('fr-FR') : '—'}
                      </td>
                      <td className="px-5 py-4">
                        <button
                          onClick={() => toggleActive(u)}
                          disabled={toggling === u.id}
                          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition disabled:opacity-50 ${
                            u.is_active
                              ? 'bg-red-50 text-red-600 hover:bg-red-100 border border-red-200'
                              : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200'
                          }`}
                        >
                          {toggling === u.id ? '…' : u.is_active ? 'Désactiver' : 'Activer'}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </>
  );
}
