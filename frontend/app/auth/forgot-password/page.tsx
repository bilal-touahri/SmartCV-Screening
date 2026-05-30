'use client';

import Link from 'next/link';
import { Mail, ArrowLeft } from 'lucide-react';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('http://localhost:8000/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.detail || 'Une erreur est survenue');
        return;
      }

      setSubmitted(true);
    } catch {
      setError('Impossible de contacter le serveur');
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="w-full max-w-md">
        <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-8 shadow-2xl text-center">
          <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-white mb-3">Vérifiez votre email</h2>
          <p className="text-white/70 mb-6">
            Nous avons envoyé un code de réinitialisation à{' '}
            <span className="text-[#FF6B6B] font-semibold">{email}</span>
          </p>
          <p className="text-white/60 text-sm mb-8">
            Si vous ne recevez pas l&apos;email, vérifiez votre dossier spam.
          </p>
          <Link
            href={`/auth/reset-password?email=${encodeURIComponent(email)}`}
            className="inline-flex items-center gap-2 px-6 py-3 bg-[#FF6B6B] text-white font-semibold rounded-lg hover:bg-[#ff5555] transition"
          >
            Entrer le code
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md">
      <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-8 shadow-2xl">
        <Link
          href="/auth/login"
          className="inline-flex items-center gap-2 text-white/70 hover:text-white transition mb-8"
        >
          <ArrowLeft size={18} />
          Retour
        </Link>

        <div className="flex justify-center mb-6">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo-digitelx.svg" alt="DIGITELX" width={56} height={56} />
        </div>

        <div className="mb-8">
          <h1 className="text-2xl font-bold text-white mb-2">Mot de passe oublié</h1>
          <p className="text-white/70 text-sm">
            Entrez votre adresse email et nous vous enverrons un code pour réinitialiser votre mot de passe.
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-500/20 border border-red-500/50 rounded-lg text-red-300 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-white text-sm font-medium mb-2">
              Adresse email
            </label>
            <div className="relative">
              <Mail size={18} className="absolute left-4 top-3.5 text-white/50" />
              <input
                type="email"
                placeholder="votre@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full pl-12 pr-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-[#FF6B6B] focus:border-transparent transition"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-[#FF6B6B] text-white font-semibold rounded-lg hover:bg-[#ff5555] transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Envoi en cours...' : 'Envoyer le code'}
          </button>
        </form>
      </div>
    </div>
  );
}