'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Lock, Eye, EyeOff, ShieldCheck } from 'lucide-react';

function getToken() { return localStorage.getItem('access_token'); }

export default function ChangePasswordPage() {
  const router = useRouter();

  const [form, setForm] = useState({
    current_password: '',
    new_password: '',
    confirm: '',
  });
  const [show, setShow] = useState({
    current: false,
    next: false,
    confirm: false,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (form.new_password.length < 6) {
      setError('Le nouveau mot de passe doit contenir au moins 6 caractères.');
      return;
    }
    if (form.new_password !== form.confirm) {
      setError('Les mots de passe ne correspondent pas.');
      return;
    }
    if (form.new_password === form.current_password) {
      setError('Le nouveau mot de passe doit être différent du mot de passe temporaire.');
      return;
    }

    setLoading(true);
    try {
      const res  = await fetch('http://localhost:8000/auth/me/password', {
        method:  'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization:  `Bearer ${getToken()}`,
        },
        body: JSON.stringify({
          current_password: form.current_password,
          new_password:     form.new_password,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.detail ?? 'Erreur lors de la mise à jour.');
        return;
      }

      // Mettre à jour le localStorage (must_change_password = false)
      try {
        const stored = JSON.parse(localStorage.getItem('user') ?? '{}');
        localStorage.setItem('user', JSON.stringify({ ...stored, must_change_password: false }));
      } catch { /* ignore */ }

      router.push('/recruteur/dashboard');
    } catch {
      setError('Impossible de contacter le serveur.');
    } finally {
      setLoading(false);
    }
  };

  const fields = [
    {
      key:         'current_password' as const,
      label:       'Mot de passe temporaire',
      placeholder: 'Votre mot de passe reçu par email',
      showKey:     'current' as const,
    },
    {
      key:         'new_password' as const,
      label:       'Nouveau mot de passe',
      placeholder: 'Minimum 6 caractères',
      showKey:     'next' as const,
    },
    {
      key:         'confirm' as const,
      label:       'Confirmer le nouveau mot de passe',
      placeholder: 'Répétez le nouveau mot de passe',
      showKey:     'confirm' as const,
    },
  ];

  return (
    <div className="w-full max-w-md">
      <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-8 shadow-2xl">

        {/* Header */}
        <div className="text-center mb-8">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo-digitelx.svg" alt="DIGITELX" width={60} height={60} className="mx-auto mb-4" />
          <div className="flex items-center justify-center gap-2 mb-2">
            <ShieldCheck size={18} className="text-amber-400" />
            <h1 className="text-xl font-bold text-white">Première connexion</h1>
          </div>
          <p className="text-white/65 text-sm">
            Pour votre sécurité, veuillez définir un nouveau mot de passe avant de continuer.
          </p>
        </div>

        {error && (
          <div className="mb-5 p-3 bg-red-500/20 border border-red-500/40 rounded-xl text-red-300 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {fields.map(f => (
            <div key={f.key}>
              <label className="block text-white/80 text-sm font-medium mb-1.5">{f.label}</label>
              <div className="relative">
                <Lock size={16} className="absolute left-4 top-3.5 text-white/40 pointer-events-none" />
                <input
                  type={show[f.showKey] ? 'text' : 'password'}
                  placeholder={f.placeholder}
                  required
                  value={form[f.key]}
                  onChange={e => setForm({ ...form, [f.key]: e.target.value })}
                  className="w-full pl-10 pr-11 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-[#FF6B6B]/50 text-sm transition"
                />
                <button
                  type="button"
                  onClick={() => setShow(s => ({ ...s, [f.showKey]: !s[f.showKey] }))}
                  className="absolute right-3 top-3.5 text-white/40 hover:text-white/70 transition"
                >
                  {show[f.showKey] ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
          ))}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 mt-2 rounded-xl bg-gradient-to-r from-[#FF6B6B] to-rose-500 text-white font-semibold hover:opacity-90 transition disabled:opacity-50 text-sm"
          >
            {loading ? 'Mise à jour…' : 'Définir mon mot de passe'}
          </button>
        </form>
      </div>
    </div>
  );
}
