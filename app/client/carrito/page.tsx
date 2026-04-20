"use client";
import Link from "next/link";
import { useState } from "react";
import { useCart } from "@/app/lib/context/_CardContext";
import { calcularResumenCheckout } from "@/lib/checkout";

export default function CarritoPage() {
  const { items, removeItem, updateQty, total, itemCount, loading } = useCart();
  const [feedback, setFeedback] = useState("");

  const { subtotal, envio, total: totalFinal } = calcularResumenCheckout({
    subtotal: total,
    cantidadPiezas: itemCount,
  });

  const mostrarFeedback = (mensaje?: string) => {
    if (!mensaje) return;
    setFeedback(mensaje);
    setTimeout(() => setFeedback(""), 2200);
  };

  const handleRemove = async (idProducto: number) => {
    const confirmar = window.confirm("¿Desea eliminar este producto?");
    if (!confirmar) return;

    const resultado = await removeItem(idProducto);
    mostrarFeedback(resultado.message);
  };

  const handleQtyChange = async (idProducto: number, cantidad: number) => {
    const resultado = await updateQty(idProducto, cantidad);
    mostrarFeedback(resultado.message);
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-20 text-center text-[#A08070]">
        Cargando tu carrito...
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-20 text-center">
        <div className="max-w-md mx-auto">
          <div className="w-24 h-24 rounded-full bg-[#F0E8DC] flex items-center justify-center mx-auto mb-6">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#C4A882" strokeWidth="1.5">
              <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
              <line x1="3" y1="6" x2="21" y2="6" />
              <path d="M16 10a4 4 0 0 1-8 0" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-[#2C1810] mb-3">Tu carrito está vacío</h2>
          <p className="text-[#A08070] mb-8">Explora nuestra colección y agrega las piezas que te inspiren.</p>
          <Link
            href="/client/catalogo"
            className="bg-[#2C1810] text-white px-8 py-3 rounded-full hover:bg-[#6B3A2A] transition-colors"
          >
            Explorar catálogo
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-10">
      {/* Breadcrumb */}
      <nav className="text-xs text-[#A08070] mb-8 flex gap-2">
        <Link href="/client" className="hover:text-[#6B3A2A]">Inicio</Link>
        <span>/</span>
        <span className="text-[#2C1810]">Carrito</span>
      </nav>

      <h1 className="text-3xl font-bold text-[#2C1810] mb-8">
        Mi carrito <span className="text-[#A08070] text-xl font-normal">({itemCount} {itemCount === 1 ? "pieza" : "piezas"})</span>
      </h1>
      {feedback && <p className="mb-6 text-sm text-[#6B3A2A]">{feedback}</p>}

      <div className="grid md:grid-cols-3 gap-10">
        {/* ── Lista ítems (USD04, USD03) ───────────────── */}
        <div className="md:col-span-2 space-y-4">
          {items.map((item) => (
            <div
              key={item.id_producto}
              className="bg-white rounded-2xl p-4 flex gap-4 shadow-sm"
            >
              {/* Imagen */}
              <div className="w-24 h-24 rounded-xl overflow-hidden shrink-0 bg-[#F0E8DC]">
                {item.imagen ? (
                  <img src={item.imagen} alt={item.nombre} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-2xl">🏺</div>
                )}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <Link
                  href={`/client/producto/${item.id_producto}`}
                  className="font-medium text-[#2C1810] hover:text-[#6B3A2A] transition-colors line-clamp-2"
                >
                  {item.nombre}
                </Link>
                {item.artesano && (
                  <p className="text-xs text-[#A08070] mt-0.5">por {item.artesano}</p>
                )}
                <p className="font-bold text-[#6B3A2A] mt-1">
                  ${item.precio_unitario.toLocaleString("es-MX")} MXN
                </p>

                {/* Quantity control */}
                <div className="flex items-center gap-3 mt-3">
                  <div className="flex items-center border border-[#D4C4B0] rounded-full text-sm overflow-hidden">
                    <button
                      onClick={() => void handleQtyChange(item.id_producto, item.cantidad - 1)}
                      className="px-3 py-1 hover:bg-[#F0E8DC] transition-colors text-[#2C1810]"
                    >
                      −
                    </button>
                    <span className="px-3 py-1 font-medium text-[#2C1810]">{item.cantidad}</span>
                    <button
                      onClick={() => void handleQtyChange(item.id_producto, item.cantidad + 1)}
                      className="px-3 py-1 hover:bg-[#F0E8DC] transition-colors text-[#2C1810]"
                    >
                      +
                    </button>
                  </div>

                  <button
                    onClick={() => void handleRemove(item.id_producto)}
                    className="text-xs text-[#A08070] hover:text-[#C0392B] transition-colors flex items-center gap-1"
                  >
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="3 6 5 6 21 6" />
                      <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                      <path d="M10 11v6M14 11v6" />
                    </svg>
                    Eliminar
                  </button>
                </div>
              </div>

              {/* Subtotal item */}
              <div className="shrink-0 text-right">
                <p className="font-bold text-[#2C1810]">
                  ${(item.precio_unitario * item.cantidad).toLocaleString("es-MX")}
                </p>
                <p className="text-xs text-[#A08070] mt-0.5">MXN</p>
              </div>
            </div>
          ))}
        </div>

        {/* ── Resumen con total + IVA (USD05) ─────────── */}
        <div className="md:col-span-1">
          <div className="bg-white rounded-2xl p-6 shadow-sm sticky top-24">
            <h2 className="font-semibold text-[#2C1810] text-lg mb-6">Resumen del pedido</h2>

            <div className="space-y-3 text-sm mb-6">
              <div className="flex justify-between text-[#5C4A3A]">
                <span>Subtotal ({itemCount} piezas)</span>
                <span>${subtotal.toLocaleString("es-MX", { minimumFractionDigits: 2 })} MXN</span>
              </div>
              <div className="flex justify-between text-[#5C4A3A]">
                <span>Envío estimado</span>
                <span>
                  {envio > 0
                    ? `$${envio.toLocaleString("es-MX", { minimumFractionDigits: 2 })} MXN`
                    : "Se calcula en checkout"}
                </span>
              </div>
              <div className="border-t border-[#E8DDD0] pt-3 flex justify-between font-bold text-[#2C1810] text-base">
                <span>Total</span>
                <span>${totalFinal.toLocaleString("es-MX", { minimumFractionDigits: 2 })} MXN</span>
              </div>
            </div>

            <Link
              href="/client/checkout"
              className="block w-full bg-[#2C1810] text-white text-center py-3.5 rounded-full font-medium hover:bg-[#6B3A2A] transition-colors"
            >
              Proceder al pago
            </Link>

            <Link
              href="/client/catalogo"
              className="block w-full text-center text-sm text-[#A08070] mt-3 hover:text-[#6B3A2A] transition-colors"
            >
              ← Continuar comprando
            </Link>

            {/* Garantías */}
            <div className="mt-6 pt-6 border-t border-[#E8DDD0] space-y-2">
              {["Envío seguro garantizado", "Comercio justo certificado", "Devoluciones en 30 días"].map((g) => (
                <div key={g} className="flex items-center gap-2 text-xs text-[#7A6A5A]">
                  <span className="text-green-600">✓</span>
                  {g}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
