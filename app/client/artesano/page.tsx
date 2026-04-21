"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { obtenerArtesanos, obtenerPerfilArtesano, obtenerGaleriaArtesano } from "@/lib/services/artesanoService";
import { listarProductosPorArtesano } from "@/lib/services/productoService";

export default function ArtesanosPage() {
  const [artesanos, setArtesanos] = useState<any[]>([]);
  const [artesanoSeleccionado, setArtesanoSeleccionado] = useState<any>(null);
  const [productos, setProductos] = useState<any[]>([]);
  const [galeria, setGaleria] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [cargandoDetalle, setCargandoDetalle] = useState(false);

  useEffect(() => {
    async function cargarArtesanos() {
      try {
        const data = await obtenerArtesanos();
        setArtesanos(data || []);
      } catch (error) {
        console.error("Error al obtener artesanos", error);
      } finally {
        setLoading(false);
      }
    }
    cargarArtesanos();
  }, []);

  async function seleccionarArtesano(artesano: any) {
    setCargandoDetalle(true);
    try {
      const [art, prods, gal] = await Promise.allSettled([
        obtenerPerfilArtesano(artesano.id_artesano),
        listarProductosPorArtesano(artesano.id_artesano),
        obtenerGaleriaArtesano(artesano.id_artesano),
      ]);

      const artesanoDetalle = art.status === "fulfilled" ? art.value : artesano;
      setArtesanoSeleccionado(artesanoDetalle);
      setProductos(prods.status === "fulfilled" ? (prods.value ?? []) : []);
      setGaleria(gal.status === "fulfilled" ? (gal.value ?? []) : []);
    } catch (e) {
      console.error(e);
      setArtesanoSeleccionado(artesano);
    } finally {
      setCargandoDetalle(false);
    }
  }

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-12 text-center">
        <p className="text-[#A08070]">Cargando artesanos...</p>
      </div>
    );
  }

  if (artesanoSeleccionado) {
    return (
      <div>
        <div className="max-w-7xl mx-auto px-6 pt-6 pb-2">
          <button
            onClick={() => setArtesanoSeleccionado(null)}
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
        </div>

        {cargandoDetalle ? (
          <div className="animate-pulse max-w-7xl mx-auto px-6 py-20 space-y-8">
            <div className="h-12 bg-[#E8D8C4] rounded w-1/2" />
            <div className="h-64 bg-[#E8D8C4] rounded-2xl" />
          </div>
        ) : (
          <div>
            {/* ── HERO ─────────────────────────────────────────────── */}
            <section className="relative bg-[#2C1810] text-[#F5EFE6] overflow-hidden rounded-b-[2.5rem] shadow-xl mb-6 pb-4 md:pb-6">
              <div className="absolute inset-0 bg-gradient-to-tr from-[#1A0E09] via-[#2C1810]/70 to-[#2C1810]/40 z-10 opacity-80" />
              {artesanoSeleccionado.foto_perfil && (
                <img
                  src={artesanoSeleccionado.foto_perfil}
                  alt={artesanoSeleccionado.nombre}
                  className="absolute inset-0 w-full h-full object-cover opacity-50 filter saturate-75"
                />
              )}
              {/* Círculo decorativo */}
              <div className="absolute top-0 right-0 w-[40vw] h-[40vw] bg-[#6B3A2A] rounded-full blur-[100px] opacity-20 mix-blend-screen z-0"></div>

              <div className="relative z-20 max-w-7xl mx-auto px-6 pt-6 pb-4 lg:pt-10 lg:pb-8">
                <div className="grid lg:grid-cols-12 gap-8 items-center">
                  <div className="lg:col-span-7">
                    <p className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md px-3 py-1.5 rounded-full text-[10px] sm:text-xs font-bold tracking-[0.2em] uppercase text-[#E6D6C5] mb-4 border border-white/10 shadow-sm">
                      <span className="w-1.5 h-1.5 bg-[#C4A882] rounded-full"></span>
                      {[artesanoSeleccionado.tipo, artesanoSeleccionado.comunidad]
                        .filter(Boolean)
                        .join(" · ") || "Maestro Artesano"}
                    </p>
                    <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold leading-tight mb-6 tracking-tight text-white drop-shadow-md">
                      {artesanoSeleccionado.nombre}
                      {artesanoSeleccionado.apellido && (
                        <span className="block text-[#C4A882] italic font-light">{artesanoSeleccionado.apellido}</span>
                      )}
                    </h1>

                    <div className="flex gap-4 mt-2 items-center opacity-80 transistion-opacity hover:opacity-100">
                      <div className="h-[2px] w-12 bg-gradient-to-r from-[#C4A882] to-transparent"></div>
                      <span className="text-[#C4A882] text-[10px] font-bold uppercase tracking-[0.4em]">Hecho a mano</span>
                      <div className="h-[2px] w-12 bg-gradient-to-l from-[#C4A882] to-transparent"></div>
                    </div>
                  </div>

                  <div className="lg:col-span-5 relative mt-6 lg:mt-0 flex justify-center lg:justify-start lg:ml-8">
                    <div className="aspect-square sm:aspect-[4/5] w-full max-w-[280px] lg:max-w-[320px] rounded-[1.5rem] overflow-hidden border-[6px] border-white/5 shadow-2xl relative z-10 transform -rotate-2 hover:rotate-0 transition-transform duration-700">
                      {artesanoSeleccionado.foto_perfil ? (
                        <img
                          src={artesanoSeleccionado.foto_perfil}
                          alt={artesanoSeleccionado.nombre}
                          className="w-full h-full object-cover hover:scale-105 transition-transform duration-1000 ease-in-out"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-[#4A2C1C] to-[#2C1810] flex items-center justify-center">
                          <span className="text-8xl drop-shadow-xl">🧑‍🎨</span>
                        </div>
                      )}
                    </div>

                    {/* Badge Maestro verificado */}
                    <div className="absolute -bottom-4 left-6 lg:left-12 z-20 bg-white text-[#2C1810] px-4 py-2.5 rounded-xl shadow-xl flex items-center gap-2.5 transform rotate-2 hover:scale-105 transition-transform border border-[#F0E8DC]">
                      <div className="w-7 h-7 rounded-full bg-green-100 flex items-center justify-center">
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="3"><polyline points="20 6 9 17 4 12"></polyline></svg>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[9px] uppercase font-bold tracking-widest text-[#A08070]">Distintivo</span>
                        <span className="text-xs font-bold leading-tight">Maestro Verificado</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* ── NARRATIVA + STATS ────────────────────────────────── */}
            <section className="py-20 relative bg-transparent">
              <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-12 gap-16 items-start">
                <div className="lg:col-span-1" />
                <div className="lg:col-span-6 prose prose-lg">
                  <p className="text-xs tracking-[0.2em] uppercase text-[#6B3A2A] font-bold mb-4 flex items-center gap-4">
                    <span className="w-8 h-px bg-[#6B3A2A]"></span>
                    Historia y Raíces
                  </p>
                  <h2 className="text-3xl md:text-5xl font-bold text-[#2C1810] mb-8 leading-tight text-pretty">
                    {artesanoSeleccionado.comunidad
                      ? `Un oficio vivo que nace orgullosamente en ${artesanoSeleccionado.comunidad}.`
                      : "Un oficio vivo que preserva memoria y cultura en cada trazo."}
                  </h2>
                  <p className="text-[#5C4A3A] leading-loose text-lg font-medium text-pretty opacity-90">
                    <span className="float-left text-7xl font-bold text-[#E8D8C4] leading-[0.8] mr-3 mt-1">
                      {artesanoSeleccionado.historia ? artesanoSeleccionado.historia.charAt(0) : (artesanoSeleccionado.biografia ? artesanoSeleccionado.biografia.charAt(0) : "E")}
                    </span>
                    {artesanoSeleccionado.historia ? artesanoSeleccionado.historia.substring(1) : (artesanoSeleccionado.biografia ? artesanoSeleccionado.biografia.substring(1) : "ste maestro artesano ha dedicado su vida a preservar técnicas transmitidas de generación en generación, dotando a cada una de sus piezas de un espíritu inigualable que trasciende el tiempo y nos conecta con sus raíces.")}
                  </p>

                  {artesanoSeleccionado.ubicacion && (
                    <div className="mt-8 flex items-center gap-3 text-sm text-[#A08070] bg-white p-4 rounded-xl border border-[#F0E8DC] w-fit shadow-sm">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#6B3A2A" strokeWidth="2">
                        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                        <circle cx="12" cy="10" r="3" />
                      </svg>
                      <span className="font-semibold text-[#5C4A3A]">Taller ubicado en:</span> {artesanoSeleccionado.ubicacion}
                    </div>
                  )}
                </div>

                <div className="lg:col-span-4 space-y-6">
                  {artesanoSeleccionado.comunidad && (
                    <div className="relative rounded-[2rem] border border-[#E8D8C4] bg-gradient-to-br from-[#FCF8F3] to-[#F5EFE6] p-8 shadow-sm overflow-hidden group">
                      <div className="absolute top-0 right-0 w-32 h-32 bg-[#C4A882] rounded-full blur-[80px] opacity-30 group-hover:opacity-50 transition-opacity"></div>
                      <p className="text-xs tracking-[0.2em] uppercase text-[#A08070] font-bold mb-3 z-10 relative">La Comunidad</p>
                      <p className="text-2xl font-bold text-[#2C1810] mb-4 z-10 relative">{artesanoSeleccionado.comunidad}</p>
                      <p className="text-sm text-[#5C4A3A] leading-relaxed z-10 relative font-medium">
                        Las piezas de este perfil dialogan de manera directa con la identidad cultural viva de su comunidad y con las técnicas milenarias que sus habitantes preservan celosamente.
                      </p>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-4">
                    {[
                      { val: `${productos.length}+`, label: "Piezas", icon: "🏺" },
                      { val: artesanoSeleccionado.tipo || "Maestro", label: "Especialidad", icon: "✨" },
                    ].map((s) => (
                      <div key={s.label} className="bg-white rounded-[2rem] p-6 border border-[#F0E8DC] shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group flex flex-col justify-center min-h-[140px]">
                        <span className="absolute -bottom-4 -right-2 text-6xl opacity-5 grayscale group-hover:grayscale-0 group-hover:opacity-20 transition-all duration-500">{s.icon}</span>
                        <p className="text-[10px] tracking-widest uppercase text-[#A08070] font-bold mb-2 break-words">{s.label}</p>
                        <p className="text-xl md:text-3xl font-black text-[#2C1810] break-words leading-none">{s.val}</p>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="lg:col-span-1" />
              </div>
            </section>

            {/* ── CREACIONES DISPONIBLES ───────────────────────────── */}
            {productos.length > 0 && (
              <section className="py-20 bg-[#FAF7F2]">
                <div className="max-w-7xl mx-auto px-6">
                  <div className="flex items-end justify-between mb-10">
                    <div>
                      <p className="text-xs tracking-widest uppercase text-[#A08070] mb-1">
                        Inventario Actual
                      </p>
                      <h2 className="text-3xl font-bold text-[#2C1810]">Creaciones Disponibles</h2>
                    </div>
                    <Link
                      href="/client/catalogo"
                      className="text-xs tracking-widest uppercase text-[#6B3A2A] hover:underline hidden md:block"
                    >
                      Ir al catálogo →
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
                            <img
                              src={p.imagen}
                              alt={p.nombre}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            />
                          ) : (
                            <div className="w-full h-full bg-gradient-to-br from-[#C4A882] to-[#8B5E3C] flex items-center justify-center">
                              <span className="text-white/60 text-sm">Sin imagen</span>
                            </div>
                          )}
                        </div>
                        <div className="p-4">
                          <p className="font-medium text-[#2C1810]">{p.nombre}</p>
                          {p.materiales && (
                            <p className="text-xs text-[#A08070] mt-0.5">{p.materiales}</p>
                          )}
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

            {/* ── GALERÍA ────────────────────────────────────────── */}
            {galeria.length > 0 && (
              <section className="py-20 bg-white">
                <div className="max-w-7xl mx-auto px-6">
                  <div className="text-center mb-10">
                    <p className="text-xs tracking-widest uppercase text-[#A08070] mb-2">
                      Galería visual
                    </p>
                    <h2 className="text-3xl font-bold text-[#2C1810]">El artesano y su trabajo</h2>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {galeria.slice(0, 6).map((img: any, i: number) => (
                      <div
                        key={`${img.url}-${i}`}
                        className={`relative overflow-hidden rounded-2xl ${i === 0 ? "md:col-span-2 md:row-span-2" : ""
                          }`}
                      >
                        <img
                          src={img.url}
                          alt={img.descripcion ?? `Galería ${i + 1}`}
                          className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                        />
                        <div className="absolute left-3 bottom-3 rounded-full bg-white/90 px-3 py-1 text-[11px] uppercase tracking-wide text-[#6B3A2A]">
                          {img.tipo ?? (img.origen === "producto" ? "trabajo" : "perfil")}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </section>
            )}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      <div className="text-center mb-16">
        <h1 className="text-4xl md:text-5xl font-bold text-[#2C1810] mb-4">Nuestros Artesanos</h1>
        <p className="text-[#A08070] text-lg max-w-2xl mx-auto">
          Conoce a los guardianes de nuestra cultura. Cada pieza en nuestro catálogo cobra vida gracias a sus manos y su historia ancestral.
        </p>
      </div>

      {artesanos.length === 0 ? (
        <div className="text-center text-[#5C4A3A] py-20 bg-[#F0E8DC] rounded-3xl">
          <p className="text-xl">Actualmente no hay artesanos registrados.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
          {artesanos.map((artesano) => (
            <button
              key={artesano.id_artesano}
              onClick={() => seleccionarArtesano(artesano)}
              className="group relative flex flex-col bg-white rounded-[2rem] overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 text-left cursor-pointer border border-[#F0E8DC]"
            >
              <div className="relative h-72 overflow-hidden bg-[#F0E8DC] w-full">
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent z-10 transition-opacity group-hover:opacity-80" />
                {artesano.foto_perfil ? (
                  <img
                    src={artesano.foto_perfil}
                    alt={artesano.nombre}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-in-out"
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-[#6B3A2A] bg-gradient-to-br from-[#E8D8C4] to-[#C4A882]">
                    <span className="text-6xl mb-2 drop-shadow-md">🧑‍🎨</span>
                  </div>
                )}

                {/* Badge en la imagen */}
                {artesano.comunidad && (
                  <div className="absolute top-4 right-4 z-20 bg-white/95 backdrop-blur-md px-4 py-1.5 rounded-full text-[10px] uppercase font-bold tracking-widest text-[#6B3A2A] shadow-sm transform transition-transform group-hover:scale-105">
                    {artesano.comunidad}
                  </div>
                )}
              </div>

              <div className="p-8 flex flex-col flex-grow relative bg-white">
                <div className="absolute -top-10 right-8 w-16 h-16 bg-[#FAF7F2] rounded-full border-4 border-white flex items-center justify-center z-20 shadow-sm text-[#6B3A2A]">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
                  </svg>
                </div>

                <p className="text-[11px] uppercase tracking-widest text-[#A08070] font-bold mb-2">
                  {artesano.tipo || "Maestro Artesano"}
                </p>

                <h2 className="text-2xl font-bold text-[#2C1810] mb-4 group-hover:text-[#6B3A2A] transition-colors leading-tight">
                  {artesano.nombre} {artesano.apellido}
                </h2>

                <p className="text-[#5C4A3A] text-sm line-clamp-3 mb-8 leading-relaxed flex-grow">
                  {artesano.biografia ||
                    "Creador artesanal elaborando piezas únicas con alma y tradición, demostrando la magia de la Mixteca en cada detalle."}
                </p>

                <div className="mt-auto flex items-center justify-between pt-4 border-t border-[#F0E8DC]">
                  <span className="text-sm font-semibold text-[#2C1810] group-hover:text-[#6B3A2A] transition-colors">
                    Explorar creaciones
                  </span>
                  <div className="w-10 h-10 rounded-full bg-[#FAF7F2] group-hover:bg-[#6B3A2A] group-hover:text-white flex items-center justify-center transition-colors text-[#2C1810]">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="group-hover:translate-x-0.5 transition-transform">
                      <line x1="5" y1="12" x2="19" y2="12"></line>
                      <polyline points="12 5 19 12 12 19"></polyline>
                    </svg>
                  </div>
                </div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
