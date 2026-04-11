"use client";
import { useEffect, useState } from "react";
import { guardarPerfilCliente } from "@/lib/services/clienteService";

type Tab = "datos" | "pedidos" | "direcciones";

interface PerfilDatos {
  nombre: string;
  apellido: string;
  email: string;
  telefono: string;
  direccion: string;
}

const DEFAULT: PerfilDatos = {
  nombre: "",
  apellido: "",
  email: "",
  telefono: "",
  direccion: "",
};

export default function PerfilPage() {
  const [tab, setTab] = useState<Tab>("datos");
  const [datos, setDatos] = useState<PerfilDatos>(DEFAULT);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [erroresCampos, setErroresCampos] = useState<Partial<Record<keyof PerfilDatos, string>>>({});

  const nombreCompleto = [datos.nombre, datos.apellido].filter(Boolean).join(" ").trim();

  useEffect(() => {
    const local = localStorage.getItem("mm_perfil");
    if (!local) return;

    try {
      const parsed = JSON.parse(local) as Partial<PerfilDatos>;
      setDatos({
        nombre: parsed.nombre ?? "",
        apellido: parsed.apellido ?? "",
        email: parsed.email ?? "",
        telefono: parsed.telefono ?? "",
        direccion: parsed.direccion ?? "",
      });
    } catch { }
  }, []);

  const validarCampo = (key: keyof PerfilDatos, valor: string) => {
    let errorMsg = "";
    if (key !== "apellido" && !valor.trim()) {
      errorMsg = "Este campo es obligatorio.";
    } else if (key === "email" && valor.trim()) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(valor.trim())) errorMsg = "El email debe tener un formato válido.";
    } else if (key === "telefono" && valor.trim()) {
      const nums = valor.replace(/\D/g, "");
      if (nums.length !== 10) errorMsg = "El teléfono debe tener 10 dígitos.";
    }
    setErroresCampos((prev) => ({ ...prev, [key]: errorMsg }));
    return errorMsg === "";
  };

  const handleGuardar = async () => {
    const validNombre = validarCampo("nombre", datos.nombre);
    const validEmail = validarCampo("email", datos.email);
    const validTel = validarCampo("telefono", datos.telefono);
    const validDir = validarCampo("direccion", datos.direccion);

    if (!validNombre || !validEmail || !validTel || !validDir) {
      setError("Por favor corrige los errores resaltados en el formulario.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      await guardarPerfilCliente({
        nombre: datos.nombre,
        apellido: datos.apellido,
        email: datos.email,
        telefono: numerosTelefono,
        direccion: datos.direccion,
      });
      localStorage.setItem("mm_perfil", JSON.stringify(datos));
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (e: any) {
      if (e?.code === "23505" || e?.message?.toLowerCase().includes("unique constraint")) {
        setError("Este email ya se encuentra registrado (duplicado).");
      } else {
        setError(e?.message ?? "Error al guardar el perfil.");
      }
    } finally {
      setLoading(false);
    }
  };

  const tabs: { id: Tab; label: string }[] = [
    { id: "datos", label: "Datos personales" },
    { id: "pedidos", label: "Mis pedidos" },
    { id: "direcciones", label: "Direcciones" },
  ];

  const campos: {
    key: keyof PerfilDatos;
    label: string;
    type: string;
    placeholder: string;
  }[] = [
      { key: "nombre", label: "Nombre", type: "text", placeholder: "Juan" },
      { key: "apellido", label: "Apellido", type: "text", placeholder: "Garcia" },
      { key: "email", label: "Correo electronico", type: "email", placeholder: "tu@email.com" },
      { key: "telefono", label: "Telefono", type: "tel", placeholder: "+52 000 000 0000" },
      { key: "direccion", label: "Direccion principal", type: "text", placeholder: "Calle, numero, colonia" },
    ];

  return (
    <div className="max-w-4xl mx-auto px-6 py-10">
      <div className="flex items-center gap-4 mb-10">
        <div className="w-16 h-16 rounded-full bg-[#6B3A2A] flex items-center justify-center text-white text-2xl font-bold">
          {datos.nombre ? datos.nombre.charAt(0).toUpperCase() : "?"}
        </div>
        <div>
          <h1 className="text-2xl font-bold text-[#2C1810]">{nombreCompleto || "Mi perfil"}</h1>
          {datos.email && <p className="text-sm text-[#A08070]">{datos.email}</p>}
        </div>
      </div>

      <div className="flex gap-1 bg-[#F0E8DC] rounded-2xl p-1 mb-8 w-fit">
        {tabs.map(({ id, label }) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            className={`px-5 py-2.5 rounded-xl text-sm font-medium transition-all ${tab === id ? "bg-[#2C1810] text-white shadow-sm" : "text-[#5C4A3A] hover:text-[#2C1810]"
              }`}
          >
            {label}
          </button>
        ))}
      </div>

      {tab === "datos" && (
        <div className="grid md:grid-cols-2 gap-8">
          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <h2 className="font-semibold text-[#2C1810] mb-6">Informacion de contacto</h2>
            <div className="space-y-4">
              {campos.map(({ key, label, type, placeholder }) => (
                <div key={key}>
                  <label className="block text-xs font-medium text-[#5C4A3A] mb-1 uppercase tracking-wide">
                    {label}
                  </label>
                  <input
                    type={type}
                    placeholder={placeholder}
                    value={datos[key]}
                    onChange={(e) => {
                      const val = e.target.value;
                      setDatos((prev) => ({ ...prev, [key]: val }));
                      validarCampo(key, val);
                    }}
                    onBlur={(e) => validarCampo(key, e.target.value)}
                    className={`w-full border rounded-xl px-4 py-3 text-sm focus:outline-none transition-colors ${erroresCampos[key]
                        ? "border-red-500 bg-red-50 text-red-900 focus:border-red-600"
                        : "border-[#D4C4B0] text-[#2C1810] focus:border-[#6B3A2A]"
                      } placeholder:text-[#C4B8A8]`}
                  />
                  {erroresCampos[key] && (
                    <p className="text-xs text-red-500 mt-1.5 ml-1">{erroresCampos[key]}</p>
                  )}
                </div>
              ))}
            </div>
            {error && <p className="mt-3 text-sm text-red-500">{error}</p>}
            <button
              onClick={handleGuardar}
              disabled={loading}
              className={`mt-6 w-full py-3 rounded-full font-medium transition-all disabled:opacity-50 ${saved ? "bg-green-700 text-white" : "bg-[#2C1810] text-white hover:bg-[#6B3A2A]"
                }`}
            >
              {loading ? "Guardando..." : saved ? "Perfil guardado correctamente" : "Guardar cambios"}
            </button>
          </div>

          <div className="space-y-4">
            <div className="bg-[#F0E8DC] rounded-2xl p-5">
              <h3 className="text-sm font-semibold text-[#2C1810] mb-3">Por que completar tu perfil?</h3>
              <ul className="space-y-2 text-sm text-[#5C4A3A]">
                {[
                  "Agiliza el proceso de compra",
                  "Recibe actualizaciones de tus pedidos",
                  "Guarda tus direcciones favoritas",
                  "Accede a ofertas exclusivas",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-2">
                    <span className="text-[#6B3A2A]">*</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {tab === "pedidos" && (
        <div className="bg-white rounded-2xl p-10 shadow-sm text-center max-w-md mx-auto">
          <div className="w-20 h-20 bg-[#F0E8DC] rounded-full flex items-center justify-center mx-auto mb-5 text-4xl">
            #
          </div>
          <h3 className="font-semibold text-[#2C1810] text-lg mb-2">Sin pedidos todavia</h3>
          <p className="text-[#A08070] text-sm mb-6">
            Tus pedidos apareceran aqui una vez que completes tu primera compra.
          </p>
          <a
            href="/client/catalogo"
            className="inline-block bg-[#2C1810] text-white px-7 py-2.5 rounded-full text-sm font-medium hover:bg-[#6B3A2A] transition-colors"
          >
            Explorar catalogo
          </a>
        </div>
      )}

      {tab === "direcciones" && (
        <div className="space-y-4">
          {datos.direccion ? (
            <div className="bg-white rounded-2xl p-5 shadow-sm flex items-start gap-4">
              <div className="w-12 h-12 bg-[#F0E8DC] rounded-xl flex items-center justify-center shrink-0">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#6B3A2A" strokeWidth="2">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                  <circle cx="12" cy="10" r="3" />
                </svg>
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <p className="font-medium text-[#2C1810]">{nombreCompleto || "Mi direccion"}</p>
                  <span className="text-[10px] bg-[#6B3A2A] text-white px-2 py-0.5 rounded-full">
                    Principal
                  </span>
                </div>
                <p className="text-sm text-[#5C4A3A]">{datos.direccion}</p>
                {datos.telefono && <p className="text-xs text-[#A08070] mt-1">{datos.telefono}</p>}
              </div>
              <button onClick={() => setTab("datos")} className="text-xs text-[#6B3A2A] hover:underline shrink-0">
                Editar
              </button>
            </div>
          ) : (
            <div className="bg-white rounded-2xl p-10 shadow-sm text-center max-w-md mx-auto">
              <div className="w-20 h-20 bg-[#F0E8DC] rounded-full flex items-center justify-center mx-auto mb-5 text-4xl">
                @
              </div>
              <h3 className="font-semibold text-[#2C1810] mb-2">Sin direcciones guardadas</h3>
              <p className="text-[#A08070] text-sm mb-4">Agrega tu direccion desde datos personales.</p>
              <button onClick={() => setTab("datos")} className="text-sm text-[#6B3A2A] hover:underline">
                Ir a datos personales
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
