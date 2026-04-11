"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { signInCliente } from "@/lib/services/authClienteService";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect") ?? "/client/perfil";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      setError("Completa email y contraseña.");
      return;
    }

    setLoading(true);
    setError("");
    try {
      await signInCliente(email.trim(), password);
      router.replace(redirect);
    } catch (e: any) {
      setError(e?.message ?? "No se pudo iniciar sesión.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-6 py-16">
      <h1 className="text-3xl font-bold text-[#2C1810] mb-2">Iniciar sesión</h1>
      <p className="text-sm text-[#A08070] mb-8">
        Accede para confirmar tu compra y consultar tus pedidos.
      </p>

      <div className="bg-white rounded-2xl p-6 shadow-sm space-y-4">
        <div>
          <label className="block text-xs font-medium text-[#5C4A3A] mb-1 uppercase tracking-wide">
            Email
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full border rounded-xl px-4 py-3 text-sm focus:outline-none border-[#D4C4B0] text-[#2C1810] focus:border-[#6B3A2A]"
            placeholder="tu@email.com"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-[#5C4A3A] mb-1 uppercase tracking-wide">
            Contraseña
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full border rounded-xl px-4 py-3 text-sm focus:outline-none border-[#D4C4B0] text-[#2C1810] focus:border-[#6B3A2A]"
            placeholder="••••••••"
          />
        </div>
        {error && <p className="text-sm text-red-500">{error}</p>}
        <button
          onClick={handleLogin}
          disabled={loading}
          className="w-full bg-[#2C1810] text-white py-3 rounded-full font-medium hover:bg-[#6B3A2A] transition-colors disabled:opacity-50"
        >
          {loading ? "Ingresando..." : "Iniciar sesión"}
        </button>
      </div>

      <p className="text-sm text-[#A08070] mt-6 text-center">
        ¿No tienes cuenta?{" "}
        <Link
          href={`/client/registro?redirect=${encodeURIComponent(redirect)}`}
          className="text-[#6B3A2A] hover:underline"
        >
          Crear cuenta
        </Link>
      </p>
    </div>
  );
}
