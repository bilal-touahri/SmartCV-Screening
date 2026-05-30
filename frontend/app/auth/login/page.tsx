'use client';

import Link from 'next/link';
import { Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Login utilise form-data (OAuth2PasswordRequestForm)
      const formBody = new URLSearchParams();
      formBody.append('username', formData.email);
      formBody.append('password', formData.password);

      const res = await fetch('http://localhost:8000/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: formBody.toString(),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.detail || 'Email ou mot de passe incorrect');
        return;
      }

      // Sauvegarder le token
      localStorage.setItem('access_token', data.access_token);
      localStorage.setItem('user', JSON.stringify(data.user_details));

      // Premier accès recruteur : forcer le changement de mot de passe
      if (data.user_details.must_change_password) {
        router.push('/auth/change-password');
        return;
      }

      // Redirection selon le rôle
      const role = data.user_details.role_id;
      if (role === 1) router.push('/admin/dashboard');
      else if (role === 2) router.push('/recruteur/dashboard');
      else router.push('/candidat/dashboard');

    } catch {
      setError('Impossible de contacter le serveur');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md">
      <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-8 shadow-2xl">
        {/* Header */}
        <div className="text-center mb-8">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo-digitelx.svg" alt="DIGITELX" width={64} height={64} className="mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-white mb-2">DIGITELX</h1>
          <p className="text-white/70">Plateforme de recrutement tech au Maroc</p>
        </div>

        {/* Heading */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-white mb-2">Bon retour !</h2>
          <p className="text-white/70 text-sm">Connectez-vous à votre espace</p>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-4 p-3 bg-red-500/20 border border-red-500/50 rounded-lg text-red-300 text-sm">
            {error}
          </div>
        )}

        {/* Form */}
        <form className="space-y-4" onSubmit={handleSubmit}>
          {/* Email */}
          <div>
            <label className="block text-white text-sm font-medium mb-2">
              Adresse email
            </label>
            <div className="relative">
              <Mail size={18} className="absolute left-4 top-3.5 text-white/50" />
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="votre@email.com"
                required
                className="w-full pl-12 pr-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-[#FF6B6B] focus:border-transparent transition"
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="block text-white text-sm font-medium mb-2">
              Mot de passe
            </label>
            <div className="relative">
              <Lock size={18} className="absolute left-4 top-3.5 text-white/50" />
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                value={formData.password}
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

          {/* Forgot Password */}
          <div className="text-right">
            <Link
              href="/auth/forgot-password"
              className="text-[#FF6B6B] hover:text-[#ff5555] text-sm font-medium transition"
            >
              Mot de passe oublié ?
            </Link>
          </div>

          {/* Login Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-[#FF6B6B] text-white font-semibold rounded-lg hover:bg-[#ff5555] transition mt-6 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Connexion en cours...' : 'Se connecter'}
          </button>
        </form>

        {/* Sign Up Link */}
        <div className="text-center mt-6">
          <p className="text-white/70 text-sm">
            Pas encore de compte ?{' '}
            <Link
              href="/auth/register"
              className="text-[#FF6B6B] hover:text-[#ff5555] font-semibold transition"
            >
              S&apos;inscrire
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}