"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { crearVenta, agregarProductoVenta, confirmarYActualizarStock } from "@/lib/services/ventaService";
import { guardarPerfilCliente } from "@/lib/services/clienteService";
import { useCart } from "@/app/lib/context/_CardContext";
import { calcularResumenCheckout } from "@/lib/checkout";

export default function ConfirmacionPage() {
  const router = useRouter();
  const {
    items,
    total,
    clearCart,
    clienteId,
    setClienteSession,
    loading,
    isAuthenticated,
    authLoading,
    authEmail,
    authUserId,
  } = useCart();
  const [estado, setEstado] = useState<"revision" | "procesando" | "confirmado" | "error">("revision");
  const [folio, setFolio] = useState("");
  const [datosEnvio, setDatosEnvio] = useState<any>(null);
  const [metodoPago, setMetodoPago] = useState<any>(null);
  const [errorMsg, setErrorMsg] = useState("");

  const { subtotal, envio, total: totalFinal } = calcularResumenCheckout({
    subtotal: total,
    cantidadPiezas: items.reduce((sum, item) => sum + item.cantidad, 0),
    datosEnvio: datosEnvio
      ? {
          nombre: datosEnvio.nombre,
          apellido: datosEnvio.apellido,
          email: datosEnvio.email,
          telefono: datosEnvio.telefono,
          direccion: datosEnvio.direccion,
          ciudad: datosEnvio.ciudad,
          estado: datosEnvio.estado_,
          codigo_postal: datosEnvio.codigo_postal,
        }
      : undefined,
  });

  useEffect(() => {
    const envio = sessionStorage.getItem("mm_checkout_envio");
    const pago = sessionStorage.getItem("mm_checkout_pago");
    if (envio) setDatosEnvio(JSON.parse(envio));
    if (pago) setMetodoPago(JSON.parse(pago));

    if (!envio || (!loading && items.length === 0)) {
      router.push("/client/carrito");
    }
  }, [items.length, loading, router]);

  const handleConfirmar = async () => {
    if (!isAuthenticated) {
      setErrorMsg("Necesitas iniciar sesión para finalizar el pago.");
      return;
    }
    if (!datosEnvio || !metodoPago) return;
    setEstado("procesando");

    try {
      // 1. Guardar/actualizar cliente actual para mantener el carrito ligado al mismo registro
      const perfil = await guardarPerfilCliente({
        id_cliente: clienteId ?? undefined,
        auth_user_id: authUserId ?? undefined,
        nombre: datosEnvio.nombre,
        apellido: datosEnvio.apellido,
        email: authEmail ?? datosEnvio.email,
        telefono: datosEnvio.telefono.replace(/\D/g, ""),
        direccion: datosEnvio.direccion,
      });
      const cliente = perfil.cliente as { id_cliente: number };
      await setClienteSession(cliente.id_cliente);

      // 2. Crear venta
      const venta = await crearVenta({
        id_cliente: cliente.id_cliente,
        total: totalFinal,
        subtotal,
        id_metodo_pago: metodoPago.id,
        datos_envio: {
          nombre: datosEnvio.nombre,
          apellido: datosEnvio.apellido,
          direccion: datosEnvio.direccion,
          ciudad: datosEnvio.ciudad,
          estado: datosEnvio.estado_,
          codigo_postal: datosEnvio.codigo_postal,
          telefono: datosEnvio.telefono,
        },
      });

      // 3. Agregar productos a la venta
      await Promise.all(
        items.map((item) =>
          agregarProductoVenta({
            id_venta: venta.id_venta,
            id_producto: item.id_producto,
            cantidad: item.cantidad,
            precio_unitario: item.precio_unitario,
          })
        )
      );

      // 4. Confirmar pedido y afectar stock
      await confirmarYActualizarStock(venta.id_venta);

      // Generar folio
      const folioNum = `MM-${new Date().getFullYear()}${String(venta.id_venta).padStart(4, "0")}`;
      setFolio(folioNum);

      // Limpiar carrito y sessión
      clearCart();
      sessionStorage.removeItem("mm_checkout_envio");
      sessionStorage.removeItem("mm_checkout_pago");

      setEstado("confirmado");
    } catch (e: any) {
      console.error(e);
      setErrorMsg(e?.message ?? "Ocurrió un error al procesar tu pedido.");
      setEstado("error");
    }
  };

  // ── Pantalla de revisión ──────────────────────────────────
  if (estado === "revision") {
    return (
      <div className="max-w-3xl mx-auto px-6 py-10">
        {/* Steps */}
        <div className="flex items-center justify-center gap-3 mb-12">
          {[
            { n: 1, label: "Envío", done: true },
            { n: 2, label: "Pago", done: true },
            { n: 3, label: "Revisión", active: true },
          ].map((step, i) => (
            <div key={step.n} className="flex items-center gap-3">
              <div className={`flex items-center gap-2 ${step.active ? "text-[#2C1810]" : "text-[#6B3A2A]"}`}>
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                  step.done ? "bg-[#6B3A2A] text-white" : "bg-[#2C1810] text-white"
                }`}>
                  {step.done ? "✓" : step.n}
                </div>
                <span className="text-sm font-medium hidden md:block">{step.label}</span>
              </div>
              {i < 2 && <div className="w-8 h-px bg-[#D4C4B0]" />}
            </div>
          ))}
        </div>

        <h2 className="text-2xl font-bold text-[#2C1810] mb-8">Revisa tu pedido</h2>
        {!authLoading && !isAuthenticated && (
          <div className="bg-[#F0E8DC] border border-[#E8DDD0] rounded-2xl p-4 text-sm text-[#5C4A3A] mb-6">
            Para confirmar el pago necesitas iniciar sesión.
            <div className="mt-3">
              <Link
                href="/client/login?redirect=/client/checkout/confirmacion"
                className="text-[#6B3A2A] font-medium hover:underline"
              >
                Iniciar sesión
              </Link>
              <span className="mx-2 text-[#A08070]">•</span>
              <Link
                href="/client/registro?redirect=/client/checkout/confirmacion"
                className="text-[#6B3A2A] font-medium hover:underline"
              >
                Crear cuenta
              </Link>
            </div>
          </div>
        )}

        <div className="space-y-4 mb-6">
          {/* Productos */}
          <div className="bg-white rounded-2xl p-5 shadow-sm">
            <h3 className="text-xs tracking-widest uppercase text-[#A08070] mb-4">Piezas</h3>
            <div className="space-y-3">
              {items.map((item) => (
                <div key={item.id_producto} className="flex gap-3">
                  <div className="w-14 h-14 rounded-xl overflow-hidden bg-[#F0E8DC] shrink-0">
                    {item.imagen ? (
                      <img src={item.imagen} alt="" className="w-full h-full object-cover" />
                    ) : <div className="w-full h-full flex items-center justify-center">🏺</div>}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-[#2C1810] line-clamp-1">{item.nombre}</p>
                    <p className="text-xs text-[#A08070]">x{item.cantidad}</p>
                  </div>
                  <p className="text-sm font-bold text-[#6B3A2A] shrink-0">
                    ${(item.precio_unitario * item.cantidad).toLocaleString("es-MX")} MXN
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Envío */}
          {datosEnvio && (
            <div className="bg-white rounded-2xl p-5 shadow-sm">
              <h3 className="text-xs tracking-widest uppercase text-[#A08070] mb-3">Dirección de envío</h3>
              <p className="text-sm text-[#2C1810]">
                {datosEnvio.nombre} {datosEnvio.apellido}<br />
                {datosEnvio.direccion}<br />
                {datosEnvio.ciudad}{datosEnvio.estado_ ? `, ${datosEnvio.estado_}` : ""}{datosEnvio.codigo_postal ? ` CP ${datosEnvio.codigo_postal}` : ""}
              </p>
            </div>
          )}

          {/* Pago + Total */}
          <div className="bg-white rounded-2xl p-5 shadow-sm">
            <div className="flex justify-between mb-3">
              <h3 className="text-xs tracking-widest uppercase text-[#A08070]">Método de pago</h3>
              <p className="text-sm text-[#2C1810]">{metodoPago?.nombre}</p>
            </div>
            <div className="border-t border-[#E8DDD0] pt-3 space-y-2 text-sm">
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

        <div className="flex justify-between items-center">
          <Link href="/client/checkout/pago" className="text-sm text-[#A08070] hover:text-[#6B3A2A]">
            ← Método de pago
          </Link>
          <button
            onClick={handleConfirmar}
            disabled={!isAuthenticated}
            className="bg-[#2C1810] text-white px-8 py-3 rounded-full font-medium hover:bg-[#6B3A2A] transition-colors"
          >
            Confirmar y pagar
          </button>
        </div>
        {errorMsg && <p className="mt-4 text-sm text-red-500">{errorMsg}</p>}
      </div>
    );
  }

  // ── Procesando ───────────────────────────────────────────
  if (estado === "procesando") {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#E8DDD0] border-t-[#6B3A2A] rounded-full animate-spin mx-auto mb-4" />
          <p className="text-[#5C4A3A]">Procesando tu pedido con cuidado...</p>
        </div>
      </div>
    );
  }

  // ── Error ────────────────────────────────────────────────
  if (estado === "error") {
    return (
      <div className="max-w-md mx-auto px-6 py-20 text-center">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <span className="text-2xl">⚠️</span>
        </div>
        <h2 className="text-xl font-bold text-[#2C1810] mb-3">Hubo un problema</h2>
        <p className="text-[#A08070] mb-6">{errorMsg}</p>
        <button
          onClick={() => setEstado("revision")}
          className="bg-[#2C1810] text-white px-8 py-3 rounded-full hover:bg-[#6B3A2A] transition-colors"
        >
          Intentar nuevamente
        </button>
      </div>
    );
  }

  // ── Confirmado (USD13) ───────────────────────────────────
  return (
    <div className="min-h-[80vh] flex items-center justify-center px-6 py-20">
      <div className="max-w-lg w-full text-center">
        {/* Check icon */}
        <div className="w-20 h-20 bg-[#6B3A2A] rounded-full flex items-center justify-center mx-auto mb-8">
          <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </div>

        <h1 className="text-4xl font-bold text-[#2C1810] mb-3">¡Pedido confirmado!</h1>
        <div className="inline-block bg-[#F0E8DC] px-4 py-1.5 rounded-full mb-6">
          <p className="text-xs tracking-widest uppercase text-[#6B3A2A] font-bold">FOLIO: #{folio}</p>
        </div>

        <p className="text-[#5C4A3A] leading-relaxed mb-10">
          Gracias por apoyar el arte mixteco. Tu pieza está siendo preparada con el cuidado que merece una obra única.
        </p>

        {/* Detalles */}
        <div className="bg-white rounded-2xl p-6 shadow-sm mb-8 text-left grid grid-cols-2 gap-6">
          <div>
            <p className="text-[10px] tracking-widest uppercase text-[#A08070] mb-1">Entrega estimada</p>
            <p className="font-semibold text-[#2C1810]">7 – 14 días hábiles</p>
            <p className="text-xs text-[#A08070]">Vía Mensajería Artesanal</p>
          </div>
          {datosEnvio && (
            <div>
              <p className="text-[10px] tracking-widest uppercase text-[#A08070] mb-1">Dirección de envío</p>
              <p className="text-sm text-[#2C1810]">{datosEnvio.direccion}</p>
              <p className="text-xs text-[#A08070]">{datosEnvio.ciudad}, México</p>
            </div>
          )}
          <div>
            <p className="text-[10px] tracking-widest uppercase text-[#A08070] mb-1">Método de pago</p>
            <p className="text-sm text-[#2C1810]">{metodoPago?.nombre}</p>
          </div>
          <div>
            <p className="text-[10px] tracking-widest uppercase text-[#A08070] mb-1">Total pagado</p>
            <p className="text-xl font-bold text-[#6B3A2A]">
              ${totalFinal.toLocaleString("es-MX", { minimumFractionDigits: 2 })} MXN
            </p>
          </div>
        </div>

        <div className="flex gap-3 justify-center">
          <Link
            href="/client"
            className="bg-[#2C1810] text-white px-7 py-3 rounded-full font-medium hover:bg-[#6B3A2A] transition-colors"
          >
            Volver al inicio
          </Link>
          <Link
            href="/client/perfil"
            className="border border-[#2C1810] text-[#2C1810] px-7 py-3 rounded-full hover:bg-[#2C1810] hover:text-white transition-colors"
          >
            Ver mis pedidos
          </Link>
        </div>

        {/* Quote */}
        <div className="mt-10 flex items-center gap-3 justify-center">
          <div className="w-10 h-10 rounded-full bg-[#C4A882] flex items-center justify-center text-lg">🧑‍🎨</div>
          <p className="text-xs text-[#A08070] italic max-w-xs text-left">
            "Cada pieza lleva el alma de nuestra tierra y el pulso de mis ancestros." — Maestro Alfarero
          </p>
        </div>
      </div>
    </div>
  );
}
