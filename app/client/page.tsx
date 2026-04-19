import Link from "next/link";
import { listarProductosDestacados } from "@/lib/services/productoService";
import { listarArtesanos } from "@/lib/services/artesanoService";
import { obtenerMisionYValores } from "@/lib/services/empresaService";


export default async function HomePage() {
  const [destacados, artesanos, empresa] = await Promise.allSettled([
    listarProductosDestacados(),
    listarArtesanos(),
    obtenerMisionYValores(),
  ]);

  const productos = destacados.status === "fulfilled" ? destacados.value ?? [] : [];
  const artesanosList = artesanos.status === "fulfilled" ? artesanos.value ?? [] : [];
  const mision = empresa.status === "fulfilled" ? empresa.value : null;
  const artesanoDelMes = artesanosList[0] ?? null;

  const textoMision =
    mision?.mision?.trim() ||
    "Preservamos la herencia Mixteca conectando a los maestros artesanos con personas que valoran lo hecho a mano.";
  const textoValores =
    mision?.valores?.trim() ||
    "Respeto por las comunidades, comercio justo, piezas únicas y procesos sustentables.";
  const valoresLista =
    mision?.valores
      ?.split(".")
      .map((item: string) => item.trim())
      .filter(Boolean)
      .slice(0, 3) ?? [];

  return (
    <div className="overflow-x-hidden">
      {/* ── HERO ─────────────────────────────────────────────── */}
      <section className="relative min-h-[90vh] flex items-center">
        <div className="absolute inset-0 bg-gradient-to-br from-[#FAF7F2] via-[#F0E8DC] to-[#E8D8C4] -z-10" />
        {/* decorative blob */}
        <div className="absolute top-20 right-0 w-[50%] h-[70%] bg-[#D4B896] opacity-20 rounded-full blur-3xl -z-10" />

        <div className="max-w-7xl mx-auto px-6 py-20 grid md:grid-cols-2 gap-12 items-center">
          <div>
            <span className="inline-block bg-[#6B3A2A] text-[#F5EFE6] text-xs tracking-widest px-3 py-1 rounded-full mb-6 uppercase">
              Edición Limitada 2024
            </span>
            <h1 className="text-5xl md:text-6xl font-bold text-[#2C1810] leading-tight mb-6">
              Artesanías con<br />
              historia, hechas<br />
              a mano
            </h1>
            <p className="text-[#5C4A3A] text-lg leading-relaxed mb-10 max-w-md">
              Preservamos la herencia Mixteca a través de piezas únicas que
              conectan el pasado ancestral con el diseño contemporáneo.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link
                href="/client/catalogo"
                className="bg-[#2C1810] text-[#F5EFE6] px-8 py-3 rounded-full font-medium hover:bg-[#6B3A2A] transition-colors"
              >
                Explorar Colección
              </Link>
              <Link
                href="/client/contacto"
                className="border border-[#2C1810] text-[#2C1810] px-8 py-3 rounded-full font-medium hover:bg-[#2C1810] hover:text-[#F5EFE6] transition-colors"
              >
                Nuestra Historia
              </Link>
            </div>
          </div>

          {/* Hero image placeholder / featured product */}
          <div className="relative">
            {productos[0]?.imagen ? (
              <img
                src={productos[0].imagen}
                alt={productos[0].nombre}
                className="w-full h-[500px] object-cover rounded-2xl shadow-2xl"
              />
            ) : (
              <div className="w-full h-[500px] bg-gradient-to-br from-[#8B5E3C] to-[#4A2C1C] rounded-2xl shadow-2xl flex items-center justify-center">
                <span className="text-[#C8B8A8] text-lg">Artesanía Mixteca</span>
              </div>
            )}
            {/* floating badge */}
            {productos[0] && (
              <div className="absolute bottom-6 left-6 right-6 bg-white/90 backdrop-blur-sm rounded-xl p-4 shadow-lg">
                <p className="text-[10px] text-[#A08070] tracking-widest uppercase mb-1">
                  ART-CODE: {String(productos[0].id_producto).padStart(3, "0")}
                </p>
                <p className="text-sm text-[#2C1810] italic">
                  "{productos[0].descripcion?.slice(0, 80) || 'Pieza única artesanal'}"
                </p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ── MISIÓN & VALORES (USD11) ─────────────────────────── */}
      <section className="py-20 bg-[#F7F1E8]">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-[1.15fr_0.85fr] gap-10 items-start">
            <div>
              <p className="text-xs tracking-widest uppercase text-[#A08070] mb-3">
                Misión y valores
              </p>
              <h2 className="text-3xl font-bold text-[#2C1810] mb-4">
                Nuestra misión
              </h2>
              <p className="text-[#5C4A3A] leading-relaxed text-base mb-6">
                {textoMision}
              </p>
              <h3 className="text-xl font-semibold text-[#2C1810] mb-3">
                Valores que guían el taller
              </h3>
              <p className="text-[#7A6A5A] leading-relaxed text-sm">
                {textoValores}
              </p>
            </div>

            <div className="grid gap-5">
              {[
                {
                  icon: "🤝",
                  title: "Comercio Justo",
                  desc:
                    valoresLista[0] ||
                    "Garantizamos precios que respetan la dignidad y el tiempo del maestro artesano.",
                },
                {
                  icon: "🏺",
                  title: "Herencia Ancestral",
                  desc:
                    valoresLista[1] ||
                    "Técnicas transmitidas por generaciones, manteniendo viva la identidad Mixteca.",
                },
                {
                  icon: "✦",
                  title: "Calidad Curada",
                  desc:
                    valoresLista[2] ||
                    "Cada objeto es seleccionado bajo estándares de excelencia y originalidad.",
                },
              ].map((v) => (
                <div
                  key={v.title}
                  className="group p-5 rounded-2xl bg-white border border-[#E6D6C5] shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-2xl">{v.icon}</span>
                    <h4 className="font-semibold text-[#2C1810]">{v.title}</h4>
                  </div>
                  <p className="text-sm text-[#7A6A5A] leading-relaxed">{v.desc}</p>
                </div>
              ))}
              <div className="rounded-2xl bg-gradient-to-br from-[#D8C2A4] via-[#E6D6C5] to-[#F5EFE6] p-5 border border-[#E6D6C5]">
                <p className="text-xs tracking-widest uppercase text-[#6B3A2A] mb-3">
                  Inspiración Mixteca
                </p>
                <div className="grid grid-cols-3 gap-2 text-center text-[#5C4A3A] text-sm">
                  {[
                    { icon: "🧵", label: "Bordado" },
                    { icon: "🪵", label: "Tallado en madera" },
                    { icon: "🪨", label: "Alfareria" },
                  ].map((item) => (
                    <div key={item.label} className="bg-white/70 rounded-xl py-4">
                      <div className="text-2xl">{item.icon}</div>
                      <p className="mt-2 text-xs">{item.label}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── PIEZAS DESTACADAS (USD10) ────────────────────────── */}
      <section className="py-20 bg-[#FAF7F2]">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-end justify-between mb-10">
            <div>
              <h2 className="text-3xl font-bold text-[#2C1810]">Piezas Destacadas</h2>
              <p className="text-[#7A6A5A] mt-1">Selección exclusiva de la temporada otoño-invierno.</p>
            </div>
            <Link
              href="/client/catalogo"
              className="text-xs tracking-widest uppercase text-[#6B3A2A] hover:underline hidden md:block"
            >
              Ver Catálogo Completo →
            </Link>
          </div>

          {productos.length === 0 ? (
            <p className="text-center text-[#A08070] py-20">
              Próximamente nuevas piezas destacadas.
            </p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {productos.slice(0, 3).map((p: any, i: number) => (
                <Link
                  key={p.id_producto}
                  href={`/client/producto/${p.id_producto}`}
                  className={`group rounded-2xl overflow-hidden bg-white shadow-sm hover:shadow-lg transition-shadow ${
                    i === 0 ? "md:row-span-2" : ""
                  }`}
                >
                  <div className={`overflow-hidden ${i === 0 ? "h-[420px]" : "h-52"}`}>
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
                    <p className="text-[#6B3A2A] font-bold mt-1">
                      ${Number(p.precio).toLocaleString("es-MX")} MXN
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          )}

          <div className="mt-6 md:hidden text-center">
            <Link href="/client/catalogo" className="text-sm text-[#6B3A2A] hover:underline">
              Ver Catálogo Completo →
            </Link>
          </div>
        </div>
      </section>

      {/* ── ARTESANO DEL MES ─────────────────────────────────── */}
      {artesanoDelMes && (
        <section className="py-20 bg-[#F0E8DC]">
          <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-2 gap-12 items-center">
            <div className="order-2 md:order-1">
              <div className="aspect-[4/5] rounded-2xl overflow-hidden shadow-xl">
                {artesanoDelMes.foto_perfil ? (
                  <img
                    src={artesanoDelMes.foto_perfil}
                    alt={`${artesanoDelMes.nombre || "Nombre desconocido"} ${artesanoDelMes.apellido || ""}`}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-[#4A2C1C] to-[#8B5E3C] flex items-center justify-center">
                    <span className="text-5xl">🏺</span>
                  </div>
                )}
              </div>
            </div>
            <div className="order-1 md:order-2">
              <p className="text-xs tracking-widest uppercase text-[#A08070] mb-3">Maestro del Mes</p>
              <h2 className="text-4xl font-bold text-[#2C1810] mb-4">
                {artesanoDelMes.nombre || "Nombre desconocido"} {artesanoDelMes.apellido || ""}
              </h2>
              <p className="text-[#5C4A3A] leading-relaxed mb-8">
                {artesanoDelMes.historia ||
                  artesanoDelMes.biografia ||
                  "Maestro artesano con décadas de experiencia preservando las tradiciones Mixtecas."}
              </p>
              <Link
                href={`/client/artesano/${artesanoDelMes.id_artesano || "#"}`}
                className="inline-flex items-center gap-2 text-[#6B3A2A] font-medium hover:gap-4 transition-all"
              >
                Conocer su proceso →
              </Link>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
