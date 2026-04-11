"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { signUpCliente } from "@/lib/services/authClienteService";
import { obtenerClientePorEmail, sincronizarClienteAuth } from "@/lib/services/clienteService";
import { useCart } from "@/app/lib/context/_CardContext";

export default function RegistroPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect") ?? "/client/perfil";
  const { setClienteSession } = useCart();

  const [form, setForm] = useState({
    nombre: "",
    apellido: "",
    email: "",
    telefono: "",
    direccion: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [mensaje, setMensaje] = useState("");
  const [error, setError] = useState("");

  const handleRegistro = async () => {
    if (!form.nombre.trim() || !form.email.trim() || !form.password.trim()) {
      setError("Nombre, email y contraseña son obligatorios.");
      return;
    }

    const telefonoDigits = form.telefono.replace(/\D/g, "");
    if (telefonoDigits && telefonoDigits.length !== 10) {
      setError("El teléfono debe tener 10 dígitos.");
      return;
    }

    setLoading(true);
    setError("");
    try {
      const existente = await obtenerClientePorEmail(form.email.trim());
      if (existente?.id_cliente) {
        setError("Ya existe un perfil con este email. Inicia sesión.");
        setLoading(false);
        return;
      }

      const resultado = await signUpCliente({
        email: form.email.trim(),
        password: form.password,
        nombre: form.nombre.trim(),
        apellido: form.apellido.trim(),
      });

      const perfil = await sincronizarClienteAuth({
        auth_user_id: resultado.user?.id,
        email: form.email.trim(),
        nombre: form.nombre.trim(),
        apellido: form.apellido.trim(),
        telefono: telefonoDigits,
        direccion: form.direccion.trim(),
      });

      const cliente = perfil.cliente as { id_cliente: number };
      await setClienteSession(cliente.id_cliente);

      if (resultado.session) {
        router.replace(redirect);
        return;
      }

      setMensaje("Cuenta creada. Inicia sesión para continuar.");
    } catch (e: any) {
      if (e?.code === "23505" || e?.message?.toLowerCase().includes("clientes_email_key")) {
        setError("Ya existe un perfil con este email. Inicia sesión.");
      } else {
        setError(e?.message ?? "No se pudo crear la cuenta.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-6 py-16">
      <h1 className="text-3xl font-bold text-[#2C1810] mb-2">Crear cuenta</h1>
      <p className="text-sm text-[#A08070] mb-8">
        Regístrate para guardar tus pedidos y datos de envío.
      </p>

      <div className="bg-white rounded-2xl p-6 shadow-sm space-y-4">
        {[
          { key: "nombre", label: "Nombre", type: "text" },
          { key: "apellido", label: "Apellido", type: "text" },
          { key: "email", label: "Email", type: "email" },
          { key: "telefono", label: "Teléfono", type: "tel" },
          { key: "direccion", label: "Dirección", type: "text" },
          { key: "password", label: "Contraseña", type: "password" },
        ].map(({ key, label, type }) => (
          <div key={key}>
            <label className="block text-xs font-medium text-[#5C4A3A] mb-1 uppercase tracking-wide">
              {label}
            </label>
            <input
              type={type}
              value={(form as any)[key]}
              onChange={(e) => setForm((prev) => ({ ...prev, [key]: e.target.value }))}
              className="w-full border rounded-xl px-4 py-3 text-sm focus:outline-none border-[#D4C4B0] text-[#2C1810] focus:border-[#6B3A2A]"
            />
          </div>
        ))}
        {error && <p className="text-sm text-red-500">{error}</p>}
        {mensaje && <p className="text-sm text-green-700">{mensaje}</p>}
        <button
          onClick={handleRegistro}
          disabled={loading}
          className="w-full bg-[#2C1810] text-white py-3 rounded-full font-medium hover:bg-[#6B3A2A] transition-colors disabled:opacity-50"
        >
          {loading ? "Creando..." : "Crear cuenta"}
        </button>
      </div>

      <p className="text-sm text-[#A08070] mt-6 text-center">
        ¿Ya tienes cuenta?{" "}
        <Link
          href={`/client/login?redirect=${encodeURIComponent(redirect)}`}
          className="text-[#6B3A2A] hover:underline"
        >
          Iniciar sesión
        </Link>
      </p>
    </div>
  );
}
