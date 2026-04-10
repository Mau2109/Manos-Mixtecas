"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { listarMetodosPago } from "@/lib/services/carritoService";
import { useCart } from "@/app/lib/context/ CardContext";

const IVA = 0.16;

export default function PagoPage() {
  const router = useRouter();
  const { items, total } = useCart();
  const [metodos, setMetodos] = useState<any[]>([]);
  const [seleccionado, setSeleccionado] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const subtotal = total;
  const totalFinal = subtotal * (1 + IVA);

  useEffect(() => {
    listarMetodosPago()
      .then((data) => setMetodos(data ?? []))
      .catch(() =>
        setMetodos([
          { id_metodo_pago: 1, nombre: "Tarjeta de crédito/débito", descripcion: "Visa, Mastercard, AMEX" },
          { id_metodo_pago: 2, nombre: "Transferencia bancaria", descripcion: "SPEI o depósito bancario" },
          { id_metodo_pago: 3, nombre: "PayPal", descripcion: "Pago seguro con PayPal" },
        ])
      )
      .finally(() => setLoading(false));
  }, []);

  const iconoPago: Record<string, string> = {
    "tarjeta": "💳",
    "transferencia": "🏦",
    "paypal": "🅿",
    "efectivo": "💵",
    "oxxo": "🏪",
  };

  const getIcono = (nombre: string) => {
    const key = Object.keys(iconoPago).find((k) => nombre.toLowerCase().includes(k));
    return key ? iconoPago[key] : "💰";
  };

  const handleContinuar = () => {
    if (!seleccionado) {
      setError("Selecciona un método de pago para continuar.");
      return;
    }
    const metodo = metodos.find((m) => m.id_metodo_pago === seleccionado);
    sessionStorage.setItem("mm_checkout_pago", JSON.stringify({ id: seleccionado, nombre: metodo?.nombre }));
    router.push("/client/checkout/confirmacion");
  };

  if (items.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-20 text-center">
        <p className="text-[#A08070]">Tu carrito está vacío.</p>
        <Link href="/client/catalogo" className="text-[#6B3A2A] hover:underline">← Explorar catálogo</Link>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-6 py-10">
      {/* Steps */}
      <div className="flex items-center justify-center gap-3 mb-12">
        {[
          { n: 1, label: "Envío", done: true },
          { n: 2, label: "Pago", active: true },
          { n: 3, label: "Revisión", active: false },
        ].map((step, i) => (
          <div key={step.n} className="flex items-center gap-3">
            <div className={`flex items-center gap-2 ${step.active ? "text-[#2C1810]" : step.done ? "text-[#6B3A2A]" : "text-[#C4B8A8]"}`}>
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                step.done ? "bg-[#6B3A2A] text-white" : step.active ? "bg-[#2C1810] text-white" : "bg-[#E8DDD0] text-[#A08070]"
              }`}>
                {step.done ? "✓" : step.n}
              </div>
              <span className="text-sm font-medium hidden md:block">{step.label}</span>
            </div>
            {i < 2 && <div className="w-8 h-px bg-[#D4C4B0]" />}
          </div>
        ))}
      </div>

      <h2 className="text-2xl font-bold text-[#2C1810] mb-2">Método de pago</h2>
      <p className="text-[#A08070] text-sm mb-8">Selecciona cómo deseas pagar tu pedido.</p>

      {/* Total a pagar */}
      <div className="bg-[#F0E8DC] rounded-2xl p-4 mb-6 flex justify-between items-center">
        <span className="text-sm text-[#5C4A3A]">Total a pagar</span>
        <span className="text-xl font-bold text-[#2C1810]">
          ${totalFinal.toLocaleString("es-MX", { minimumFractionDigits: 2 })} MXN
        </span>
      </div>

      {/* Métodos de pago */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-20 bg-[#E8DDD0] rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="space-y-3 mb-6">
          {metodos.map((m) => (
            <button
              key={m.id_metodo_pago}
              onClick={() => { setSeleccionado(m.id_metodo_pago); setError(""); }}
              className={`w-full flex items-center gap-4 p-4 rounded-2xl border-2 transition-all text-left ${
                seleccionado === m.id_metodo_pago
                  ? "border-[#6B3A2A] bg-[#FAF7F2]"
                  : "border-[#D4C4B0] bg-white hover:border-[#C4A882]"
              }`}
            >
              <div className="w-12 h-12 rounded-xl bg-[#F0E8DC] flex items-center justify-center text-2xl shrink-0">
                {getIcono(m.nombre)}
              </div>
              <div className="flex-1">
                <p className="font-medium text-[#2C1810]">{m.nombre}</p>
                {m.descripcion && (
                  <p className="text-xs text-[#A08070] mt-0.5">{m.descripcion}</p>
                )}
              </div>
              <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                seleccionado === m.id_metodo_pago
                  ? "border-[#6B3A2A] bg-[#6B3A2A]"
                  : "border-[#D4C4B0]"
              }`}>
                {seleccionado === m.id_metodo_pago && (
                  <div className="w-2 h-2 bg-white rounded-full" />
                )}
              </div>
            </button>
          ))}
        </div>
      )}

      {error && (
        <p className="text-sm text-red-500 mb-4">{error}</p>
      )}

      <div className="flex justify-between items-center">
        <Link href="/client/checkout" className="text-sm text-[#A08070] hover:text-[#6B3A2A]">
          ← Datos de envío
        </Link>
        <button
          onClick={handleContinuar}
          className="bg-[#2C1810] text-white px-8 py-3 rounded-full font-medium hover:bg-[#6B3A2A] transition-colors"
        >
          Revisar pedido →
        </button>
      </div>
    </div>
  );
}
