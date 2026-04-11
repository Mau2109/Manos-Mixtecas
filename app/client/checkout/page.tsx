"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCart } from "@/app/lib/context/_CardContext";
import { calcularResumenCheckout } from "@/lib/checkout";

type DatosEnvio = {
  nombre: string;
  apellido: string;
  email: string;
  telefono: string;
  direccion: string;
  ciudad: string;
  estado_: string;
  codigo_postal: string;
};

export default function CheckoutPage() {
  const router = useRouter();
  const { items, total, itemCount, loading, cliente, authEmail } = useCart();

  const [datos, setDatos] = useState<DatosEnvio>({
    nombre: "", apellido: "", email: "", telefono: "",
    direccion: "", ciudad: "", estado_: "", codigo_postal: "",
  });
  const [errors, setErrors] = useState<Partial<DatosEnvio>>({});

  const { subtotal, envio, total: totalFinal } = calcularResumenCheckout({
    subtotal: total,
    cantidadPiezas: itemCount,
    datosEnvio: {
      nombre: datos.nombre,
      apellido: datos.apellido,
      email: datos.email,
      telefono: datos.telefono,
      direccion: datos.direccion,
      ciudad: datos.ciudad,
      estado: datos.estado_,
      codigo_postal: datos.codigo_postal,
    },
  });

  const validate = () => {
    const e: Partial<DatosEnvio> = {};
    if (!datos.nombre.trim()) e.nombre = "Requerido";
    if (!datos.apellido.trim()) e.apellido = "Requerido";
    if (!datos.email.trim() || !datos.email.includes("@")) e.email = "Email inválido";
    if (!datos.telefono.trim()) e.telefono = "Requerido";
    if (datos.telefono.trim() && datos.telefono.replace(/\D/g, "").length !== 10) {
      e.telefono = "El teléfono debe tener 10 dígitos";
    }
    if (!datos.direccion.trim()) e.direccion = "Requerido";
    if (!datos.ciudad.trim()) e.ciudad = "Requerido";
    if (!datos.codigo_postal.trim()) e.codigo_postal = "Requerido";
    if (datos.codigo_postal.trim() && !/^\d{5}$/.test(datos.codigo_postal.trim())) {
      e.codigo_postal = "El código postal debe tener 5 dígitos";
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  useEffect(() => {
    if (!cliente && !authEmail) return;

    setDatos((prev) => ({
      nombre: prev.nombre || cliente?.nombre || "",
      apellido: prev.apellido || cliente?.apellido || "",
      email: prev.email || authEmail || cliente?.email || "",
      telefono: prev.telefono || cliente?.telefono || "",
      direccion: prev.direccion || cliente?.direccion || "",
      ciudad: prev.ciudad || "",
      estado_: prev.estado_ || "",
      codigo_postal: prev.codigo_postal || "",
    }));
  }, [cliente, authEmail]);

  const handleNext = () => {
    if (validate()) {
      // Guardar en sessionStorage para el siguiente paso
      sessionStorage.setItem("mm_checkout_envio", JSON.stringify(datos));
      router.push("/client/checkout/pago");
    }
  };

  if (!loading && items.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-20 text-center">
        <p className="text-[#A08070] mb-4">Tu carrito está vacío.</p>
        <Link href="/client/catalogo" className="text-[#6B3A2A] hover:underline">
          Explorar catálogo →
        </Link>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-20 text-center text-[#A08070]">
        Cargando checkout...
      </div>
    );
  }

  const campo = (
    name: keyof DatosEnvio,
    label: string,
    type = "text",
    placeholder = ""
  ) => (
    <div>
      <label className="block text-xs font-medium text-[#5C4A3A] mb-1 uppercase tracking-wide">
        {label}
      </label>
      <input
        type={type}
        value={datos[name]}
        onChange={(e) => {
          const value = e.target.value;
          if (name === "telefono") {
            const digits = value.replace(/\D/g, "").slice(0, 10);
            setDatos((d) => ({ ...d, [name]: digits }));
            return;
          }
          setDatos((d) => ({ ...d, [name]: value }));
        }}
        placeholder={placeholder}
        inputMode={name === "telefono" ? "numeric" : undefined}
        maxLength={name === "telefono" ? 10 : undefined}
        className={`w-full border rounded-xl px-4 py-3 text-sm bg-white focus:outline-none transition-colors ${
          errors[name]
            ? "border-red-400 focus:border-red-500"
            : "border-[#D4C4B0] focus:border-[#6B3A2A]"
        } text-[#2C1810] placeholder:text-[#C4B8A8]`}
      />
      {errors[name] && <p className="text-xs text-red-500 mt-1">{errors[name]}</p>}
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-6 py-10">
      {/* Breadcrumb / Steps */}
      <div className="flex items-center justify-center gap-3 mb-12">
        {[
          { n: 1, label: "Envío", active: true },
          { n: 2, label: "Pago", active: false },
          { n: 3, label: "Revisión", active: false },
        ].map((step, i) => (
          <div key={step.n} className="flex items-center gap-3">
            <div className={`flex items-center gap-2 ${step.active ? "text-[#2C1810]" : "text-[#C4B8A8]"}`}>
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                step.active ? "bg-[#2C1810] text-white" : "bg-[#E8DDD0] text-[#A08070]"
              }`}>
                {step.n}
              </div>
              <span className="text-sm font-medium hidden md:block">{step.label}</span>
            </div>
            {i < 2 && <div className="w-8 h-px bg-[#D4C4B0]" />}
          </div>
        ))}
      </div>

      <div className="grid md:grid-cols-3 gap-10">
        {/* ── Formulario de envío (USD14) ─────────────── */}
        <div className="md:col-span-2">
          <h2 className="text-2xl font-bold text-[#2C1810] mb-6">Datos de Envío</h2>

          <div className="bg-white rounded-2xl p-6 shadow-sm space-y-5">
            <div className="grid grid-cols-2 gap-4">
              {campo("nombre", "Nombre")}
              {campo("apellido", "Apellido")}
            </div>
            {campo("email", "Correo electrónico", "email", "tu@email.com")}
            {campo("telefono", "Teléfono", "tel", "+52 000 000 0000")}
            {campo("direccion", "Dirección", "text", "Calle, número, colonia")}
            <div className="grid grid-cols-2 gap-4">
              {campo("ciudad", "Ciudad")}
              {campo("estado_", "Estado")}
            </div>
            {campo("codigo_postal", "Código Postal")}
          </div>

          <div className="mt-6 flex justify-between">
            <Link href="/client/carrito" className="text-sm text-[#A08070] hover:text-[#6B3A2A]">
              ← Volver al carrito
            </Link>
            <button
              onClick={handleNext}
              className="bg-[#2C1810] text-white px-8 py-3 rounded-full font-medium hover:bg-[#6B3A2A] transition-colors"
            >
              Continuar al pago →
            </button>
          </div>
        </div>

        {/* ── Resumen de compra (USD15) ────────────────── */}
        <div>
          <div className="bg-white rounded-2xl p-6 shadow-sm sticky top-24">
            <h3 className="font-semibold text-[#2C1810] mb-4">Resumen del pedido</h3>

            <div className="space-y-3 mb-6 max-h-64 overflow-y-auto pr-1">
              {items.map((item) => (
                <div key={item.id_producto} className="flex gap-3">
                  <div className="w-14 h-14 rounded-xl overflow-hidden bg-[#F0E8DC] shrink-0">
                    {item.imagen ? (
                      <img src={item.imagen} alt={item.nombre} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-lg">🏺</div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-[#2C1810] line-clamp-1">{item.nombre}</p>
                    <p className="text-xs text-[#A08070]">x{item.cantidad}</p>
                  </div>
                  <p className="text-sm font-bold text-[#6B3A2A] shrink-0">
                    ${(item.precio_unitario * item.cantidad).toLocaleString("es-MX")}
                  </p>
                </div>
              ))}
            </div>

            <div className="border-t border-[#E8DDD0] pt-4 space-y-2 text-sm">
              <div className="flex justify-between text-[#5C4A3A]">
                <span>Subtotal</span>
                <span>${subtotal.toLocaleString("es-MX", { minimumFractionDigits: 2 })}</span>
              </div>
              <div className="flex justify-between text-[#5C4A3A]">
                <span>Envío</span>
                <span>${envio.toLocaleString("es-MX", { minimumFractionDigits: 2 })}</span>
              </div>
              <div className="flex justify-between font-bold text-[#2C1810] text-base pt-2 border-t border-[#E8DDD0]">
                <span>Total</span>
                <span>${totalFinal.toLocaleString("es-MX", { minimumFractionDigits: 2 })} MXN</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
