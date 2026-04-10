"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { obtenerPerfilArtesano, obtenerGaleriaArtesano } from "@/lib/services/artesanoService";
import { listarProductosPorArtesano } from "@/lib/services/productoService";
import { useParams } from "next/navigation";

export default function ArtesanoPage() {
  const params = useParams();
  const id = Number(params.id);

  const [artesano, setArtesano] = useState<any>(null);
  const [productos, setProductos] = useState<any[]>([]);
  const [galeria, setGaleria] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [art, prods, gal] = await Promise.allSettled([
          obtenerPerfilArtesano(id),
          listarProductosPorArtesano(id),
          obtenerGaleriaArtesano(id),
        ]);
        if (art.status === "fulfilled") setArtesano(art.value);
        if (prods.status === "fulfilled") setProductos(prods.value ?? []);
        if (gal.status === "fulfilled") setGaleria(gal.value ?? []);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    if (id) load();
  }, [id]);

  if (loading) {
    return (
      <div className="animate-pulse max-w-7xl mx-auto px-6 py-20 space-y-8">
        <div className="h-12 bg-[#E8D8C4] rounded w-1/2" />
        <div className="h-64 bg-[#E8D8C4] rounded-2xl" />
      </div>
    );
  }

  if (!artesano) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-20 text-center">
        <p className="text-5xl mb-4">🧑‍🎨</p>
        <p className="text-[#A08070]">Artesano no encontrado.</p>
        <Link href="/client" className="mt-4 inline-block text-[#6B3A2A] hover:underline">← Inicio</Link>
      </div>
    );
  }

  return (
    <div>
      {/* ── HERO ─────────────────────────────────────────────── */}
      <section className="relative bg-[#2C1810] text-white overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-[#2C1810] via-[#2C1810]/80 to-transparent z-10" />
        {artesano.foto_perfil && (
          <img
            src={artesano.foto_perfil}
            alt={artesano.nombre}
            className="absolute inset-0 w-full h-full object-cover opacity-30"
          />
        )}
        <div className="relative z-20 max-w-7xl mx-auto px-6 py-24">
          <nav className="text-xs text-[#C8B8A8] mb-8 flex gap-2">
            <Link href="/client" className="hover:text-white">Inicio</Link>
            <span>/</span>
            <span>Artesanos</span>
          </nav>

          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <p className="text-xs tracking-widest uppercase text-[#C8B8A8] mb-3">
                {artesano.tipo ?? "Maestro Artesano"} · {artesano.comunidad ?? ""}
              </p>
              <h1 className="text-5xl md:text-7xl font-bold leading-tight mb-6">
                {artesano.nombre}<br />{artesano.apellido}
              </h1>
              <p className="text-[#C8B8A8] leading-relaxed max-w-md mb-8">
                {artesano.biografia ?? artesano.historia}
              </p>
              {artesano.email && (
                <a
                  href={`mailto:${artesano.email}`}
                  className="inline-flex items-center gap-2 bg-[#6B3A2A] text-white px-6 py-3 rounded-full hover:bg-[#8B5E3C] transition-colors"
                >
                  Contactar Taller →
                </a>
              )}
            </div>

            <div className="relative">
              <div className="aspect-[4/5] rounded-2xl overflow-hidden">
                {artesano.foto_perfil ? (
                  <img src={artesano.foto_perfil} alt={artesano.nombre} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-[#4A2C1C] flex items-center justify-center">
                    <span className="text-8xl">🧑‍🎨</span>
                  </div>
                )}
              </div>
              <div className="absolute bottom-4 left-4 bg-[#6B3A2A] text-white text-xs px-3 py-1.5 rounded-full flex items-center gap-2">
                <span className="w-2 h-2 bg-green-400 rounded-full" />
                Maestro Verificado
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── NARRATIVA + STATS ────────────────────────────────── */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-2 gap-16 items-start">
          <div>
            <p className="text-xs tracking-widest uppercase text-[#A08070] mb-3">La Narrativa</p>
            <h2 className="text-3xl font-bold text-[#2C1810] mb-6 leading-tight">
              Preservando el alma de la tierra a través del fuego y la paciencia.
            </h2>
            <p className="text-[#5C4A3A] leading-relaxed">
              {artesano.historia ?? artesano.biografia ?? "Este maestro artesano ha dedicado su vida a perfeccionar técnicas ancestrales transmitidas de generación en generación."}
            </p>
            {artesano.ubicacion && (
              <div className="mt-6 flex items-center gap-2 text-sm text-[#A08070]">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                  <circle cx="12" cy="10" r="3" />
                </svg>
                {artesano.ubicacion}
              </div>
            )}
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-4">
            {[
              { val: `${productos.length}+`, label: "Piezas creadas" },
              { val: artesano.tipo ?? "Maestro", label: "Especialidad" },
              { val: artesano.comunidad ?? "Oaxaca", label: "Comunidad" },
              { val: "MX", label: "Reconocimiento" },
            ].map((s) => (
              <div key={s.label} className="bg-[#FAF7F2] rounded-2xl p-6">
                <p className="text-3xl font-bold text-[#2C1810] mb-1">{s.val}</p>
                <p className="text-xs tracking-widest uppercase text-[#A08070]">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CREACIONES DISPONIBLES ───────────────────────────── */}
      {productos.length > 0 && (
        <section className="py-20 bg-[#FAF7F2]">
          <div className="max-w-7xl mx-auto px-6">
            <div className="flex items-end justify-between mb-10">
              <div>
                <p className="text-xs tracking-widest uppercase text-[#A08070] mb-1">Inventario Actual</p>
                <h2 className="text-3xl font-bold text-[#2C1810]">Creaciones Disponibles</h2>
              </div>
              <Link href="/client/catalogo" className="text-xs tracking-widest uppercase text-[#6B3A2A] hover:underline hidden md:block">
                Ver todas las obras →
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {productos.slice(0, 6).map((p: any) => (
                <Link
                  key={p.id_producto}
                  href={`/client/producto/${p.id_producto}`}
                  className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-shadow"
                >
                  <div className="aspect-square overflow-hidden">
                    {p.imagen ? (
                      <img src={p.imagen} alt={p.nombre} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-[#C4A882] to-[#8B5E3C] flex items-center justify-center">
                        <span className="text-white/60 text-sm">Sin imagen</span>
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    <p className="font-medium text-[#2C1810]">{p.nombre}</p>
                    {p.materiales && <p className="text-xs text-[#A08070] mt-0.5">{p.materiales}</p>}
                    <div className="flex items-center justify-between mt-2">
                      <span className="font-bold text-[#6B3A2A]">
                        ${Number(p.precio).toLocaleString("es-MX")} MXN
                      </span>
                      {p.es_unico && (
                        <span className="text-[10px] bg-[#F0E8DC] text-[#6B3A2A] px-2 py-0.5 rounded-full">
                          Artesano único
                        </span>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── PROCESO / GALERÍA ────────────────────────────────── */}
      {galeria.length > 0 && (
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center mb-10">
              <p className="text-xs tracking-widest uppercase text-[#A08070] mb-2">La Técnica</p>
              <h2 className="text-3xl font-bold text-[#2C1810]">Su Proceso</h2>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {galeria.slice(0, 6).map((img: any, i: number) => (
                <div key={i} className={`overflow-hidden rounded-2xl ${i === 0 ? "md:col-span-2 md:row-span-2" : ""}`}>
                  <img
                    src={img.url}
                    alt={img.descripcion ?? `Proceso ${i + 1}`}
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                  />
                </div>
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
