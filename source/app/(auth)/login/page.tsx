"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LoginPage() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
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
    <div className="flex items-center justify-center min-h-screen bg-[#F2F2F2]">
      <div className="w-full max-w-xl bg-white border border-gray-200 p-10 rounded-2xl shadow-lg mt-[-80px]">
        <h1 className="text-3xl font-bold text-[#1E2A78] text-center mb-8">Inloggen</h1>

        <form onSubmit={handleSubmit} className="space-y-5 mt-20">
          <input
            name="email"
            type="email"
            placeholder="Email"
            value={form.email}
            onChange={handleChange}
            className="w-full border border-gray-300 p-3 rounded-md text-lg focus:outline-none focus:ring-2 focus:ring-[#FFD700] text-black"
            required
            disabled={isLoading}
          />
          <input
            name="password"
            type="password"
            placeholder="Wachtwoord"
            value={form.password}
            onChange={handleChange}
            className="w-full border border-gray-300 p-3 rounded-md text-lg focus:outline-none focus:ring-2 focus:ring-[#FFD700] text-black"
            required
            disabled={isLoading}
          />

          <div className="text-right">
            <Link href="/forgot-password" className="text-[#1E2A78] font-medium hover:underline text-sm">
              Wachtwoord vergeten?
            </Link>
          </div>

          <button
            type="submit"
            className="w-full bg-[#E4C76B] hover:bg-[#FFD700] text-[#1E2A78] py-3 rounded-md font-semibold text-lg transition mt-10 disabled:opacity-70"
            disabled={isLoading}
          >
            {isLoading ? "Bezig met inloggen..." : "Inloggen"}
          </button>

          {error && (
            <div className="bg-red-50 border border-red-200 p-3 rounded-md">
              <p className="text-red-500 text-sm text-center">{error}</p>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}