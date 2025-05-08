"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";
import Link from "next/link";

export default function LoginPage() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    // Reset error when user types
    if (error) setError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      // Normalize email to lowercase
      const normalizedEmail = form.email.toLowerCase();
      
      // First check if email exists
      const emailCheckResponse = await fetch("/api/auth/check-email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: normalizedEmail }),
      });
      
      const emailCheckData = await emailCheckResponse.json();
      
      if (!emailCheckData.exists) {
        setError("E-mailadres bestaat niet. Controleer uw e-mailadres.");
        setIsLoading(false);
        return;
      }
      
      // If email exists, attempt login
      const res = await signIn("credentials", {
        redirect: false,
        email: normalizedEmail,
        password: form.password,
      });

      if (res?.error) {
        setError("Onjuist wachtwoord. Probeer het opnieuw.");
        console.error("Login fout:", res.error);
      } else {
        router.push("/beheer/dashboard");
      }
    } catch (err) {
      console.error("Onverwachte fout bij inloggen:", err);
      setError("Er is een onverwachte fout opgetreden. Probeer het opnieuw.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-[#F2F2F2] px-4 py-6 sm:py-12">
      <div className="w-full max-w-md bg-white border border-gray-200 p-6 sm:p-10 rounded-2xl shadow-lg sm:mt-[-80px]">
        <h1 className="text-2xl sm:text-3xl font-bold text-[#1E2A78] text-center mb-4 sm:mb-8">Inloggen</h1>
        <p className="text-[15px] text-gray-500 text-center mb-6 sm:mb-8">Deze inlogomgeving is uitsluitend bestemd voor geautoriseerde gebruikers.</p>

        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5 mt-8 sm:mt-10">
          <div>
            <label htmlFor="email" className="block text-sm font-medium leading-6 text-gray-900 mb-1">
              E-mailadres
            </label>
            <input
              id="email"
              name="email"
              type="email"
              placeholder="naam@voorbeeld.nl"
              value={form.email}
              onChange={handleChange}
              className="w-full border border-gray-300 p-3 rounded-md text-base sm:text-lg focus:outline-none focus:ring-2 focus:ring-[#1E2A78] focus:border-transparent text-black"
              required
              disabled={isLoading}
            />
          </div>
          
          <div>
            <label htmlFor="password" className="block text-sm font-medium leading-6 text-gray-900 mb-1">
              Wachtwoord
            </label>
            <div className="relative">
              <input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                placeholder="Wachtwoord"
                value={form.password}
                onChange={handleChange}
                className="w-full border border-gray-300 p-3 pr-10 rounded-md text-base sm:text-lg focus:outline-none focus:ring-2 focus:ring-[#1E2A78] focus:border-transparent text-black"
                required
                disabled={isLoading}
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute inset-y-0 right-3 flex items-center text-gray-500 hover:text-gray-700"
                tabIndex={-1}
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          <div className="text-right">
            <Link href="/forgot-password" className="text-[#1E2A78] hover:text-[#2E376F] font-medium hover:underline text-sm transition-colors">
              Wachtwoord vergeten?
            </Link>
          </div>

          <button
            type="submit"
            className="w-full bg-[#1E2A78] hover:bg-[#2E376F] text-white py-3 rounded-md font-semibold text-base sm:text-lg transition-colors mt-8 disabled:opacity-70 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#1E2A78]"
            disabled={isLoading}
          >
            {isLoading ? "Bezig met inloggen..." : "Inloggen"}
          </button>

          {error && (
            <div className="bg-red-50 border border-red-200 p-3 rounded-md mt-4">
              <p className="text-red-500 text-sm text-center">{error}</p>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}