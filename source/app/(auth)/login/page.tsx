"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const res = await signIn("credentials", {
      redirect: false,
      email: form.email,
      password: form.password,
    });

    if (res?.error) {
      setError("Ongeldige gegevens of gebruiker bestaat niet.");
    } else {
      router.push("/dashboard");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-white">
      <div className="w-full max-w-xl bg-white border border-gray-200 p-10 rounded-2xl shadow-lg mt-[-80px]">
        <h1 className="text-3xl font-bold text-[#1E2A78] text-center mb-8">Inloggen</h1>

        <form onSubmit={handleSubmit} className="space-y-5 mt-20">
          <input
            name="email"
            type="email"
            placeholder="Email"
            value={form.email}
            onChange={handleChange}
            className="w-full border border-gray-300 p-3 rounded-md text-lg focus:outline-none focus:ring-2 focus:ring-[#FFD700]"
            required
          />
          <input
            name="password"
            type="password"
            placeholder="Wachtwoord"
            value={form.password}
            onChange={handleChange}
            className="w-full border border-gray-300 p-3 rounded-md text-lg focus:outline-none focus:ring-2 focus:ring-[#FFD700]"
            required
          />

          <button
            type="submit"
            className="w-full bg-[#E4C76B] hover:bg-[#FFD700] text-[#1E2A78] py-3 rounded-md font-semibold text-lg transition mt-10"
          >
            Inloggen
          </button>

          {error && <p className="text-red-500 text-sm text-center">{error}</p>}
        </form>

        <p className="text-center text-lg text-gray-600 mt-30">
          Nog geen account?{" "}
          <a href="/register" className="text-[#1E2A78] font-semibold hover:underline">
            Maak hier een account aan
          </a>
        </p>
      </div>
    </div>
  );
}
