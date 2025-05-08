"use client"

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

const forgotPasswordSchema = z.object({
  email: z.string().email('Vul een geldig e-mailadres in'),
});

type ForgotPasswordForm = z.infer<typeof forgotPasswordSchema>;

export default function ForgotPassword() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordForm>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const onSubmit = async (data: ForgotPasswordForm) => {
    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: data.email }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Er is iets misgegaan');
      }

      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Verzoek kon niet worden verwerkt');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-[#F2F2F2]">
      <div className="w-full max-w-xl bg-white border border-gray-200 p-10 rounded-2xl shadow-lg mt-[-80px]">
        <div className="">
          <h2 className="text-2xl font-bold text-[#1E2A78] text-center mb-6">Wachtwoord vergeten?</h2>
          {success ? (
            <div className="rounded-md bg-green-50 p-4">
              <div className="flex">
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-green-800">Verzoek verzonden</h3>
                  <div className="mt-2 text-sm text-green-700">
                    <p>
                      Instructies voor het resetten van je wachtwoord zijn naar je e-mailadres gestuurd.
                      Controleer je inbox.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
              <div>
                <label htmlFor="email" className="block text-sm font-medium leading-6 text-gray-900 mt-8">
                  E-mailadres
                </label>
                <div className="mt-2">
                  <input
                    id="email"
                    type="email"
                    autoComplete="email"
                    {...register('email')}
                    className="w-full border border-gray-300 p-2 rounded-md text-lg focus:outline-none focus:ring-1 focus:ring-[#FFD700] text-black"
                    placeholder="naam@voorbeeld.nl"
                  />
                  {errors.email && (
                    <p className="mt-2 text-sm text-red-600">{errors.email.message}</p>
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

              <div>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex w-full justify-center rounded-md bg-[#1E2A78] px-3 py-3 mt-8 text-sm font-semibold text-white shadow-sm hover:bg-[#2E376F] focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:bg-indigo-400"
                >
                  {isSubmitting ? 'Bezig met verzenden...' : 'Stuur wachtwoord reset e-mail'}
                </button>
              </div>
              
              <div className="text-center text-sm text-gray-500 mt-4">
                <p>
                  Terug naar <a href="/login" className="font-medium text-indigo-600 hover:text-indigo-500">Inloggen</a>
                </p>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}  