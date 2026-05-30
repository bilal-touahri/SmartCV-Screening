'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';

export default function VerifyEmailPage() {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get('email') || '';

  const handleOtpChange = (index: number, value: string) => {
    if (value.length <= 1 && /^[0-9]*$/.test(value)) {
      const newOtp = [...otp];
      newOtp[index] = value;
      setOtp(newOtp);
      if (value && index < 5) {
        const nextInput = document.querySelector(
          `input[data-otp-index="${index + 1}"]`
        ) as HTMLInputElement;
        nextInput?.focus();
      }
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      const prevInput = document.querySelector(
        `input[data-otp-index="${index - 1}"]`
      ) as HTMLInputElement;
      prevInput?.focus();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const code = otp.join('');
    try {
      const res = await fetch('http://localhost:8000/auth/verify-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.detail || 'Code invalide ou expiré');
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
          <h2 className="text-2xl font-bold text-white mb-3">Email vérifié !</h2>
          <p className="text-white/70 mb-8">
            Votre adresse email a été vérifiée avec succès. Vous pouvez maintenant accéder à votre compte.
          </p>
          <a
            href="/auth/login"
            className="inline-flex items-center gap-2 px-6 py-3 bg-[#FF6B6B] text-white font-semibold rounded-lg hover:bg-[#ff5555] transition"
          >
            Se connecter
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md">
      <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-8 shadow-2xl">
        <a
          href="/auth/register"
          className="inline-flex items-center gap-2 text-white/70 hover:text-white transition mb-8"
        >
          <ArrowLeft size={18} />
          Retour
        </a>

        <div className="flex justify-center mb-6">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo-digitelx.svg" alt="DIGITELX" width={56} height={56} />
        </div>

        <div className="mb-8">
          <h1 className="text-2xl font-bold text-white mb-2">Vérifier votre email</h1>
          <p className="text-white/70 text-sm">
            Entrez le code à 6 chiffres envoyé à{' '}
            <span className="text-white font-medium">{email}</span>
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-500/20 border border-red-500/50 rounded-lg text-red-300 text-sm">
            {error}
          </div>
        )}

        {resendSuccess && (
          <div className="mb-4 p-3 bg-green-500/20 border border-green-500/50 rounded-lg text-green-300 text-sm">
            Code renvoyé avec succès !
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="flex justify-center gap-3">
            {otp.map((digit, index) => (
              <input
                key={index}
                type="text"
                inputMode="numeric"
                data-otp-index={index}
                maxLength={1}
                value={digit}
                onChange={(e) => handleOtpChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                className="w-12 h-12 text-center bg-white/10 border border-white/20 text-white font-semibold rounded-lg text-xl focus:outline-none focus:ring-2 focus:ring-[#FF6B6B] focus:border-transparent transition"
              />
            ))}
          </div>

          <button
            type="submit"
            disabled={!otp.every((digit) => digit !== '') || loading}
            className="w-full py-3 bg-[#FF6B6B] text-white font-semibold rounded-lg hover:bg-[#ff5555] transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Vérification...' : 'Vérifier'}
          </button>

          <div className="text-center">
            <p className="text-white/70 text-sm">
              Vous n&apos;avez pas reçu le code ?{' '}
              <button
                type="button"
                disabled={resendLoading}
                onClick={async () => {
                  setResendLoading(true);
                  setResendSuccess(false);
                  setError('');
                  try {
                    await fetch('http://localhost:8000/auth/forgot-password', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ email }),
                    });
                    setResendSuccess(true);
                  } catch {
                    setError('Impossible de renvoyer le code');
                  } finally {
                    setResendLoading(false);
                  }
                }}
                className="text-[#FF6B6B] hover:text-[#ff5555] font-semibold transition disabled:opacity-50"
              >
                {resendLoading ? 'Envoi...' : 'Renvoyer'}
              </button>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}