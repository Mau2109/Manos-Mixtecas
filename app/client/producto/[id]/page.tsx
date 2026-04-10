"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { obtenerProductoDetalle, obtenerImagenesProducto } from "@/lib/services/productoService";

import { useParams, useRouter } from "next/navigation";
import { useCart } from "@/app/lib/context/ CardContext";

export default function ProductoPage() {
  const params = useParams();
  const router = useRouter();
  const id = Number(params.id);
  const { addItem, items } = useCart();

  const [producto, setProducto] = useState<any>(null);
  const [imagenes, setImagenes] = useState<any[]>([]);
  const [imgActiva, setImgActiva] = useState(0);
  const [cantidad, setCantidad] = useState(1);
  const [loading, setLoading] = useState(true);
  const [agregado, setAgregado] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const [prod, imgs] = await Promise.all([
          obtenerProductoDetalle(id),
          obtenerImagenesProducto(id),
        ]);
        setProducto(prod);
        setImagenes(imgs ?? []);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    if (id) load();
  }, [id]);

  const yaEnCarrito = items.some((i) => i.id_producto === id);

  const handleAgregarCarrito = () => {
    if (!producto) return;
    addItem({
      id_producto: producto.id_producto,
      nombre: producto.nombre,
      precio_unitario: Number(producto.precio),
      cantidad,
      imagen: producto.imagen,
      artesano: producto.artesano_nombre,
    });
    setAgregado(true);
    setTimeout(() => setAgregado(false), 2000);
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-20 flex items-center justify-center">
        <div className="animate-pulse space-y-4 w-full">
          <div className="h-8 bg-[#E8D8C4] rounded w-48" />
          <div className="grid md:grid-cols-2 gap-10">
            <div className="aspect-square bg-[#E8D8C4] rounded-2xl" />
            <div className="space-y-4">
              <div className="h-10 bg-[#E8D8C4] rounded w-3/4" />
              <div className="h-6 bg-[#E8D8C4] rounded w-1/4" />
              <div className="h-24 bg-[#E8D8C4] rounded" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!producto) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-20 text-center">
        <p className="text-5xl mb-4">🏺</p>
        <p className="text-[#A08070]">Producto no encontrado.</p>
        <Link href="/client/catalogo" className="mt-4 inline-block text-[#6B3A2A] hover:underline">
          ← Volver al catálogo
        </Link>
      </div>
    );
  }

  // Lista de imágenes: imagen principal + galería
  const todasImagenes = [
    ...(producto.imagen ? [{ url: producto.imagen, descripcion: producto.nombre }] : []),
    ...imagenes.filter((img) => img.url !== producto.imagen),
  ];

  const precioFinal = producto.descuento_pct > 0
    ? Number(producto.precio) * (1 - producto.descuento_pct / 100)
    : Number(producto.precio);

  const fragFragilidad: Record<string, { label: string; color: string }> = {
    alta: { label: "Alta fragilidad", color: "#C0392B" },
    media: { label: "Fragilidad media", color: "#E67E22" },
    baja: { label: "Baja fragilidad", color: "#27AE60" },
    ninguna: { label: "Resistente", color: "#27AE60" },
  };
  const fragInfo = fragFragilidad[producto.fragilidad] ?? null;

  return (
    <div className="max-w-7xl mx-auto px-6 py-10">
      {/* Breadcrumb */}
      <nav className="text-xs text-[#A08070] mb-8 flex gap-2">
        <Link href="/client" className="hover:text-[#6B3A2A]">Inicio</Link>
        <span>/</span>
        <Link href="/client/catalogo" className="hover:text-[#6B3A2A]">Catálogo</Link>
        <span>/</span>
        <span className="text-[#2C1810] line-clamp-1">{producto.nombre}</span>
      </nav>

      <div className="grid md:grid-cols-2 gap-12 lg:gap-20">
        {/* ── Galería (USD08) ─────────────────────────────── */}
        <div className="space-y-4">
          <div className="aspect-square rounded-2xl overflow-hidden bg-[#F0E8DC]">
            {todasImagenes[imgActiva] ? (
              <img
                src={todasImagenes[imgActiva].url}
                alt={todasImagenes[imgActiva].descripcion ?? producto.nombre}
                className="w-full h-full object-cover transition-all duration-300"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <span className="text-8xl">🏺</span>
              </div>
            )}
          </div>
          {todasImagenes.length > 1 && (
            <div className="flex gap-3 overflow-x-auto pb-2">
              {todasImagenes.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setImgActiva(i)}
                  className={`shrink-0 w-20 h-20 rounded-xl overflow-hidden border-2 transition-colors ${
                    imgActiva === i ? "border-[#6B3A2A]" : "border-transparent hover:border-[#C4A882]"
                  }`}
                >
                  <img src={img.url} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* ── Detalle (USD09) ─────────────────────────────── */}
        <div>
          {/* Tags */}
          <div className="flex flex-wrap gap-2 mb-4">
            {producto.es_unico && (
              <span className="bg-[#6B3A2A] text-white text-[10px] px-3 py-1 rounded-full uppercase tracking-wide">
                Pieza Única
              </span>
            )}
            {fragInfo && (
              <span
                className="text-[10px] px-3 py-1 rounded-full uppercase tracking-wide text-white"
                style={{ backgroundColor: fragInfo.color }}
              >
                {fragInfo.label}
              </span>
            )}
          </div>

          <h1 className="text-3xl md:text-4xl font-bold text-[#2C1810] mb-3">{producto.nombre}</h1>

          {/* Precio */}
          <div className="flex items-baseline gap-3 mb-6">
            <span className="text-2xl font-bold text-[#6B3A2A]">
              ${precioFinal.toLocaleString("es-MX")} MXN
            </span>
            {producto.descuento_pct > 0 && (
              <>
                <span className="text-lg text-[#A08070] line-through">
                  ${Number(producto.precio).toLocaleString("es-MX")}
                </span>
                <span className="bg-[#FEE2E2] text-[#C0392B] text-xs px-2 py-0.5 rounded-full">
                  -{producto.descuento_pct}%
                </span>
              </>
            )}
          </div>

          {/* Descripción */}
          <p className="text-[#5C4A3A] leading-relaxed mb-6">{producto.descripcion}</p>

          {/* Ficha técnica */}
          <div className="bg-[#F0E8DC] rounded-2xl p-5 mb-8 space-y-3">
            <h3 className="text-xs tracking-widest uppercase text-[#A08070] font-medium">Ficha Técnica</h3>
            {producto.materiales && (
              <div className="flex justify-between text-sm">
                <span className="text-[#7A6A5A]">Materiales</span>
                <span className="text-[#2C1810] font-medium">{producto.materiales}</span>
              </div>
            )}
            {producto.tecnica && (
              <div className="flex justify-between text-sm">
                <span className="text-[#7A6A5A]">Técnica</span>
                <span className="text-[#2C1810] font-medium">{producto.tecnica}</span>
              </div>
            )}
            <div className="flex justify-between text-sm">
              <span className="text-[#7A6A5A]">Disponibilidad</span>
              <span className={`font-medium ${producto.stock > 5 ? "text-green-700" : producto.stock > 0 ? "text-amber-600" : "text-red-600"}`}>
                {producto.stock > 0 ? `${producto.stock} en stock` : "Agotado"}
              </span>
            </div>
          </div>

          {/* Artesano */}
          {producto.artesano_nombre && (
            <Link
              href={`/client/artesano/${producto.id_artesano}`}
              className="flex items-center gap-3 mb-8 group"
            >
              <div className="w-12 h-12 rounded-full bg-[#C4A882] overflow-hidden flex items-center justify-center">
                {producto.artesano_foto ? (
                  <img src={producto.artesano_foto} alt="" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-xl">🧑‍🎨</span>
                )}
              </div>
              <div>
                <p className="text-xs text-[#A08070]">Creado por</p>
                <p className="text-sm font-medium text-[#2C1810] group-hover:text-[#6B3A2A] transition-colors">
                  {producto.artesano_nombre}
                </p>
              </div>
            </Link>
          )}

          {/* Cantidad + Agregar */}
          {producto.stock > 0 ? (
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="flex items-center border border-[#D4C4B0] rounded-full overflow-hidden">
                  <button
                    onClick={() => setCantidad(Math.max(1, cantidad - 1))}
                    className="px-4 py-2 text-[#2C1810] hover:bg-[#F0E8DC] transition-colors"
                  >
                    −
                  </button>
                  <span className="px-4 py-2 font-medium text-[#2C1810]">{cantidad}</span>
                  <button
                    onClick={() => setCantidad(Math.min(producto.stock, cantidad + 1))}
                    className="px-4 py-2 text-[#2C1810] hover:bg-[#F0E8DC] transition-colors"
                  >
                    +
                  </button>
                </div>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={handleAgregarCarrito}
                  className={`flex-1 py-3.5 rounded-full font-medium transition-all ${
                    agregado
                      ? "bg-green-700 text-white"
                      : "bg-[#2C1810] text-white hover:bg-[#6B3A2A]"
                  }`}
                >
                  {agregado ? "✓ Agregado al carrito" : yaEnCarrito ? "Agregar más" : "Agregar al carrito"}
                </button>
                <Link
                  href="/client/carrito"
                  className="border border-[#2C1810] text-[#2C1810] px-6 py-3.5 rounded-full hover:bg-[#2C1810] hover:text-white transition-colors"
                >
                  Ver carrito
                </Link>
              </div>
            </div>
          ) : (
            <p className="text-center py-4 bg-[#F0E8DC] rounded-full text-[#A08070]">
              Pieza agotada — contáctanos para más info
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
