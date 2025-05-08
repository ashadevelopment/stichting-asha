"use client"

import { useState, useEffect, Suspense } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Eye, EyeOff } from "lucide-react";

const resetPasswordSchema = z
  .object({
    password: z.string()
      .min(8, 'Wachtwoord moet minimaal 8 tekens bevatten')
      .regex(/[A-Z]/, 'Wachtwoord moet minimaal 1 hoofdletter bevatten')
      .regex(/[0-9]/, 'Wachtwoord moet minimaal 1 cijfer bevatten'),
    confirmPassword: z.string(),
  })
  .refine(data => data.password === data.confirmPassword, {
    message: "Wachtwoorden komen niet overeen",
    path: ["confirmPassword"],
  });

type ResetPasswordForm = z.infer<typeof resetPasswordSchema>;

// Create a client component that uses useSearchParams
function ResetPasswordForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tokenValid, setTokenValid] = useState<boolean | null>(null);
  const [tokenChecked, setTokenChecked] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const router = useRouter();
  
  // Move useSearchParams inside this component
  const { useSearchParams } = require('next/navigation');
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordForm>({
    resolver: zodResolver(resetPasswordSchema),
  });

  // Verify token when component mounts
  useEffect(() => {
    const verifyToken = async () => {
      if (!token) {
        setTokenValid(false);
        setError('Ongeldige of ontbrekende token');
        setTokenChecked(true);
        return;
      }

      try {
        const response = await fetch(`/api/auth/verify-reset-token?token=${token}`);
        const data = await response.json();
        
        setTokenValid(response.ok);
        if (!response.ok) {
          setError(data.error || 'Token is ongeldig of verlopen');
        }
      } catch (err) {
        setTokenValid(false);
        setError('Er is een fout opgetreden bij het verifiëren van de token');
      } finally {
        setTokenChecked(true);
      }
    };

    verifyToken();
  }, [token]);

  const onSubmit = async (data: ResetPasswordForm) => {
    if (!token) return;
    
    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          token, 
          password: data.password 
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Er is iets misgegaan');
      }

      setSuccess(true);
      
      // Redirect to login page after 3 seconds
      setTimeout(() => {
        router.push('/login');
      }, 3000);
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Wachtwoord resetten mislukt');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!tokenChecked) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#F2F2F2] px-4 py-6 sm:py-12">
        <div className="w-full max-w-md bg-white border border-gray-200 p-6 sm:p-10 rounded-2xl shadow-lg sm:mt-[-80px]">
          <h2 className="text-2xl font-bold text-[#1E2A78] text-center mb-6">
            Token verifiëren...
          </h2>
          <div className="flex justify-center mt-6">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#1E2A78]"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-[#F2F2F2] px-4 py-6 sm:py-12">
      <div className="w-full max-w-md bg-white border border-gray-200 p-6 sm:p-10 rounded-2xl shadow-lg sm:mt-[-80px]">
        <h2 className="text-2xl font-bold text-[#1E2A78] text-center mb-6">
          {tokenValid ? 'Nieuw wachtwoord instellen' : 'Ongeldige token'}
        </h2>

        {!tokenValid ? (
          <div className="rounded-md bg-red-50 p-4">
            <div className="flex">
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">Ongeldige of verlopen token</h3>
                <div className="mt-2 text-sm text-red-700">
                  <p>{error || 'De wachtwoord reset link is ongeldig of verlopen. Vraag een nieuwe reset link aan.'}</p>
                </div>
                <div className="mt-6">
                  <button
                    type="button"
                    onClick={() => router.push('/forgot-password')}
                    className="w-full rounded-md bg-[#1E2A78] px-3 py-3 text-sm font-semibold text-white shadow-sm hover:bg-[#2E376F] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#1E2A78] transition-colors"
                  >
                    Terug naar wachtwoord vergeten
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : success ? (
          <div className="rounded-md bg-green-50 p-4">
            <div className="flex">
              <div className="ml-3">
                <h3 className="text-sm font-medium text-green-800">Wachtwoord gewijzigd</h3>
                <div className="mt-2 text-sm text-green-700">
                  <p>
                    Uw wachtwoord is succesvol gewijzigd. U wordt doorgestuurd naar de inlogpagina.
                  </p>
                </div>
                <div className="flex justify-center mt-4">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
            <div>
              <label htmlFor="password" className="block text-sm font-medium leading-6 text-gray-900 mb-1">
                Nieuw wachtwoord
              </label>
              <div className="mt-2">
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="new-password"
                    {...register('password')}
                    className="w-full border border-gray-300 p-3 rounded-md text-base sm:text-lg focus:outline-none focus:ring-2 focus:ring-[#1E2A78] focus:border-transparent text-black pr-10"
                  />
                  <button 
                    type="button" 
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-600 hover:text-gray-800 focus:outline-none"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? "Verberg wachtwoord" : "Toon wachtwoord"}
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
                {errors.password && (
                  <p className="mt-2 text-sm text-red-600">{errors.password.message}</p>
                )}
                <div className="mt-2 text-xs text-gray-500">
                  <p className="font-semibold mb-1">Wachtwoord moet voldoen aan:</p>
                  <ul className="space-y-1 pl-5 list-disc">
                    <li>Minimaal 8 tekens</li>
                    <li>Minimaal 1 hoofdletter</li>
                    <li>Minimaal 1 cijfer</li>
                  </ul>
                </div>
              </div>
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium leading-6 text-gray-900 mb-1">
                Bevestig wachtwoord
              </label>
              <div className="mt-2">
                <div className="relative">
                  <input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    autoComplete="new-password"
                    {...register('confirmPassword')}
                    className="w-full border border-gray-300 p-3 rounded-md text-base sm:text-lg focus:outline-none focus:ring-2 focus:ring-[#1E2A78] focus:border-transparent text-black pr-10"
                  />
                  <button 
                    type="button" 
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-600 hover:text-gray-800 focus:outline-none"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    aria-label={showConfirmPassword ? "Verberg wachtwoord" : "Toon wachtwoord"}
                  >
                    {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <p className="mt-2 text-sm text-red-600">{errors.confirmPassword.message}</p>
                )}
              </div>
            </div>

            {error && (
              <div className="rounded-md bg-red-50 p-4">
                <div className="flex">
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-red-800">Fout</h3>
                    <div className="mt-2 text-sm text-red-700">
                      <p>{error}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="mt-6">
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex w-full justify-center rounded-md bg-[#1E2A78] px-3 py-3 text-sm font-semibold text-white shadow-sm hover:bg-[#2E376F] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#1E2A78] transition-colors disabled:bg-indigo-400"
              >
                {isSubmitting ? 'Bezig...' : 'Wijzig wachtwoord'}
              </button>
            </div>

            <div className="text-center text-sm text-gray-500 mt-4">
              <p>
                Terug naar <Link href="/login" className="font-medium text-[#1E2A78] hover:text-[#2E376F] transition-colors">Inloggen</Link>
              </p>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

export default function ResetPassword() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen bg-[#F2F2F2] px-4 py-6 sm:py-12">
        <div className="w-full max-w-md bg-white border border-gray-200 p-6 sm:p-10 rounded-2xl shadow-lg sm:mt-[-80px]">
          <h2 className="text-2xl font-bold text-[#1E2A78] text-center mb-6">
            Laden...
          </h2>
          <div className="flex justify-center mt-6">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#1E2A78]"></div>
          </div>
        </div>
      </div>
    }>
      <ResetPasswordForm />
    </Suspense>
  );
}