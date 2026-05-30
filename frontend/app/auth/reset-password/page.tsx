'use client';

import Link from 'next/link';
import { Lock, Eye, EyeOff, ArrowLeft } from 'lucide-react';
import { useState } from 'react';
import { useSearchParams } from 'next/navigation';

export default function ResetPasswordPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    code: '',
    new_password: '',
    confirmPassword: '',
  });

  const searchParams = useSearchParams();
  const email = searchParams.get('email') || '';

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (formData.new_password !== formData.confirmPassword) {
      setError('Les mots de passe ne correspondent pas');
      return;
    }

    if (formData.new_password.length < 6) {
      setError('Le mot de passe doit contenir au moins 6 caractères');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('http://localhost:8000/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          code: formData.code,
          new_password: formData.new_password,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.detail || 'Code invalide ou expiré');
        return;
      }

      setSuccess(true);
    } catch {
      setError('Impossible de contacter le serveur');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="w-full max-w-md">
        <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-8 shadow-2xl text-center">
          <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-white mb-3">Mot de passe réinitialisé !</h2>
          <p className="text-white/70 mb-8">
            Votre mot de passe a été réinitialisé avec succès. Vous pouvez maintenant vous connecter.
          </p>
          <Link
            href="/auth/login"
            className="inline-flex items-center gap-2 px-6 py-3 bg-[#FF6B6B] text-white font-semibold rounded-lg hover:bg-[#ff5555] transition"
          >
            Se connecter
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md">
      <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-8 shadow-2xl">
        <Link
          href="/auth/forgot-password"
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
          <h1 className="text-2xl font-bold text-white mb-2">Réinitialiser le mot de passe</h1>
          <p className="text-white/70 text-sm">
            Entrez le code reçu par email et votre nouveau mot de passe
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-500/20 border border-red-500/50 rounded-lg text-red-300 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Code */}
          <div>
            <label className="block text-white text-sm font-medium mb-2">
              Code de vérification
            </label>
            <input
              type="text"
              name="code"
              value={formData.code}
              onChange={handleChange}
              placeholder="123456"
              maxLength={6}
              required
              className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-[#FF6B6B] focus:border-transparent transition"
            />
          </div>

          {/* New Password */}
          <div>
            <label className="block text-white text-sm font-medium mb-2">
              Nouveau mot de passe
            </label>
            <div className="relative">
              <Lock size={18} className="absolute left-4 top-3.5 text-white/50" />
              <input
                type={showPassword ? 'text' : 'password'}
                name="new_password"
                value={formData.new_password}
                onChange={handleChange}
                placeholder="••••••••"
                required
                className="w-full pl-12 pr-12 py-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-[#FF6B6B] focus:border-transparent transition"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-3.5 text-white/50 hover:text-white/70"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {/* Confirm Password */}
          <div>
            <label className="block text-white text-sm font-medium mb-2">
              Confirmer le mot de passe
            </label>
            <div className="relative">
              <Lock size={18} className="absolute left-4 top-3.5 text-white/50" />
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="••••••••"
                required
                className="w-full pl-12 pr-12 py-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-[#FF6B6B] focus:border-transparent transition"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-4 top-3.5 text-white/50 hover:text-white/70"
              >
                {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-[#FF6B6B] text-white font-semibold rounded-lg hover:bg-[#ff5555] transition mt-6 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Réinitialisation...' : 'Réinitialiser le mot de passe'}
          </button>
        </form>
      </div>
    </div>
  );
}