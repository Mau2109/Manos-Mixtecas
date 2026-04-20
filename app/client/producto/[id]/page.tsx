"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { obtenerProductoDetalle, obtenerImagenesProducto } from "@/lib/services/productoService";

import { useParams, useRouter } from "next/navigation";
import { useCart } from "@/app/lib/context/_CardContext";

export default function ProductoPage() {
  const params = useParams();
  const id = Number(params.id);
  const router = useRouter();
  const { addItem, items } = useCart();

  const [producto, setProducto] = useState<any>(null);
  const [imagenes, setImagenes] = useState<any[]>([]);
  const [imgActiva, setImgActiva] = useState(0);
  const [cantidad, setCantidad] = useState(1);
  const [loading, setLoading] = useState(true);
  const [agregado, setAgregado] = useState(false);
  const [mensajeCarrito, setMensajeCarrito] = useState("");

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

  const handleAgregarCarrito = async () => {
    if (!producto) return;
    const resultado = await addItem({
      id_producto: producto.id_producto,
      nombre: producto.nombre,
      precio_unitario: precioFinal,
      cantidad,
      imagen: producto.imagen,
      artesano: nombreArtesano,
      stock: producto.stock,
    });
    setAgregado(resultado.ok);
    setMensajeCarrito(resultado.message ?? "");
    setTimeout(() => {
      setAgregado(false);
      setMensajeCarrito("");
    }, 2000);
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

  const artesano = producto.artesanos ?? null;
  const nombreArtesano = artesano
    ? [artesano.nombre, artesano.apellido].filter(Boolean).join(" ")
    : "";
  const tipoArtesano = artesano?.tipo?.trim() ?? "";
  const comunidadArtesano = artesano?.comunidad?.trim() ?? "";
  const historiaArtesano =
    artesano?.historia?.trim() ||
    (comunidadArtesano ? `Originario de ${comunidadArtesano}.` : "");

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
      {/* Botón Volver y Breadcrumb */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <button
          onClick={() => router.back()}
          className="group flex items-center gap-2 bg-white/80 backdrop-blur-md border border-[#E6D6C5] shadow-sm text-[#5C4A3A] px-5 py-2.5 rounded-full hover:bg-[#6B3A2A] hover:text-white transition-all duration-300 w-fit"
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            className="group-hover:-translate-x-1 transition-transform"
          >
            <line x1="19" y1="12" x2="5" y2="12"></line>
            <polyline points="12 19 5 12 12 5"></polyline>
          </svg>
          <span className="font-medium text-sm tracking-wide">Volver</span>
        </button>

        {/* Breadcrumb */}
        <nav className="text-xs text-[#A08070] flex max-w-[50%] md:max-w-none ml-auto md:ml-0 overflow-hidden text-ellipsis whitespace-nowrap">
          <Link href="/client" className="hover:text-[#6B3A2A]">Inicio</Link>
          <span className="mx-2">/</span>
          <Link href="/client/catalogo" className="hover:text-[#6B3A2A]">Catálogo</Link>
          <span className="mx-2">/</span>
          <span className="text-[#2C1810] truncate block">{producto.nombre}</span>
        </nav>
      </div>

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
              <span className="bg-[#6B3A2A] text-white text-xs px-4 py-1.5 rounded-full uppercase font-bold tracking-widest flex items-center gap-2 shadow-sm">
                Pieza Única
              </span>
            )}
            {fragInfo && (
              <span
                className="text-xs px-4 py-1.5 rounded-full uppercase font-medium tracking-wide text-white"
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
          {artesano && (
            <div className="mb-8 rounded-2xl border border-[#E6D6C5] bg-[#FCF8F3] p-5">
              <p className="text-xs tracking-widest uppercase text-[#A08070] mb-4">
                Elaborado por
              </p>
              <Link
                href={`/client/artesano/${artesano.id_artesano}`}
                className="group flex items-start gap-4"
              >
                <div className="w-14 h-14 rounded-full bg-[#C4A882] overflow-hidden flex items-center justify-center shrink-0">
                  {artesano.foto_perfil ? (
                    <img
                      src={artesano.foto_perfil}
                      alt={nombreArtesano || "Artesano"}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-xl">🧑‍🎨</span>
                  )}
                </div>
                <div className="min-w-0">
                  <p className="text-lg font-semibold text-[#2C1810] group-hover:text-[#6B3A2A] transition-colors">
                    {nombreArtesano}
                  </p>
                  {(tipoArtesano || comunidadArtesano) && (
                    <p className="text-sm text-[#A08070] mt-1">
                      {[tipoArtesano, comunidadArtesano].filter(Boolean).join(" · ")}
                    </p>
                  )}
                  {historiaArtesano && (
                    <p className="text-sm text-[#5C4A3A] leading-relaxed mt-3 line-clamp-3">
                      {historiaArtesano}
                    </p>
                  )}
                  <p className="text-sm font-medium text-[#6B3A2A] mt-3">
                    Conocer al artesano →
                  </p>
                </div>
              </Link>
            </div>
          )}

          {/* Cantidad + Agregar */}
          {producto.stock > 0 ? (
            <div className="space-y-4">
              {producto.es_unico && (
                <p className="text-sm font-medium text-[#6B3A2A]">
                  Existen {producto.stock} disponibles.
                </p>
              )}
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
              {mensajeCarrito && (
                <p className={`text-sm ${agregado ? "text-green-700" : "text-red-600"}`}>
                  {mensajeCarrito}
                </p>
              )}
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
