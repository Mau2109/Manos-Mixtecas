import Link from "next/link";
import { listarProductosDestacados } from "@/lib/services/productoService";
import { listarArtesanos } from "@/lib/services/artesanoService";

export default async function HomePage() {
  const [destacados, artesanos] = await Promise.allSettled([
    listarProductosDestacados(),
    listarArtesanos(),
  ]);

  const productos = destacados.status === "fulfilled" ? destacados.value ?? [] : [];
  const artesanosList = artesanos.status === "fulfilled" ? artesanos.value ?? [] : [];
  const artesanoDelMes = artesanosList[0] ?? null;

  return (
    <div className="bg-[#FAF7F2] text-[#2C1810] selection:bg-[#D4B896] selection:text-white">
      {/* ── HERO SECTION ───────────────────────────────────── */}
      <section className="relative min-h-[90vh] flex items-center pt-16 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,#F0E8DC_0%,#FAF7F2_60%)] -z-10" />
        
        <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-16 items-center w-full">
          <div className="relative z-10">
            <span className="inline-flex items-center gap-2 bg-[#6B3A2A]/5 text-[#6B3A2A] text-[10px] font-bold tracking-[0.3em] px-4 py-2 rounded-full mb-8 uppercase">
              <span className="w-1.5 h-1.5 bg-[#6B3A2A] rounded-full animate-pulse" />
              Herencia Mixteca Viva
            </span>
            <h1 className="text-6xl md:text-7xl font-bold leading-[1.1] mb-8">
              El arte que <br />
              <span className="text-[#6B3A2A] italic">trasciende</span> <br />
              generaciones.
            </h1>
            <p className="text-[#5C4A3A] text-lg leading-relaxed mb-12 max-w-lg">
              Conectamos la maestría de los artesanos mixtecos con el mundo, preservando técnicas milenarias en piezas de diseño contemporáneo.
            </p>
            <div className="flex flex-wrap gap-6">
              <Link
                href="/client/catalogo"
                className="bg-[#2C1810] text-white px-10 py-5 rounded-full font-bold text-sm uppercase tracking-widest hover:bg-[#6B3A2A] transition-all shadow-xl hover:shadow-[#6B3A2A]/20 hover:-translate-y-1"
              >
                Explorar Catálogo
              </Link>
            </div>
          </div>

          <div className="relative flex justify-center lg:justify-end">
            <div className="aspect-[4/5] w-full max-w-md rounded-[3rem] overflow-hidden shadow-2xl transition-all duration-700 hover:shadow-[#6B3A2A]/20">
              {productos[0]?.imagen ? (
                <img
                  src={productos[0].imagen}
                  alt="Artesanía Principal"
                  className="w-full h-full object-cover transition-transform duration-1000 hover:scale-105"
                />
              ) : (
                <div className="w-full h-full bg-[#E8D8C4] flex items-center justify-center text-8xl">🏺</div>
              )}
            </div>
            <div className="absolute -bottom-6 -left-6 bg-white p-6 rounded-[2rem] shadow-2xl max-w-[200px] hidden md:block">
              <p className="text-[10px] font-bold uppercase tracking-widest text-[#8B6A55] mb-2">Pieza Destacada</p>
              <p className="text-xs text-[#5C4A3A] leading-relaxed italic">
                "Cada trazo cuenta una historia de orgullo cultural."
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── QUIÉNES SOMOS ──────────────────────────────────── */}
      <section className="py-32 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-24 items-center">
            <div className="flex justify-center items-center bg-[#FAF7F2] rounded-[3rem] p-16 border border-[#F0E8DC]">
              <img 
                src="/assets/logo_manos_mixtecas.png" 
                alt="Logo Manos Mixtecas" 
                className="w-full max-w-sm h-auto object-contain opacity-90"
              />
            </div>
            
            <div>
              <span className="text-[11px] font-bold uppercase tracking-[0.3em] text-[#8B6A55] mb-6 block">Nuestra Identidad</span>
              <h2 className="text-5xl font-bold mb-8 leading-tight">Somos el puente entre la tradición y el mañana.</h2>
              <div className="space-y-6 text-[#5C4A3A] text-lg leading-relaxed">
                <p>
                  Manos Mixtecas nace del profundo respeto por las comunidades de la Mixteca y la necesidad de valorar el trabajo artesanal en su forma más pura.
                </p>
                <p>
                  No somos solo una tienda; somos una plataforma que documenta, promueve y protege la propiedad intelectual y cultural de nuestros maestros artesanos.
                </p>
              </div>
              <div className="mt-12 grid grid-cols-2 gap-8 border-t border-[#F0E8DC] pt-12">
                <div>
                  <p className="text-3xl font-bold text-[#2C1810] mb-1">100%</p>
                  <p className="text-xs uppercase tracking-widest text-[#8B6A55]">Hecho a Mano</p>
                </div>
                <div>
                  <p className="text-3xl font-bold text-[#2C1810] mb-1">Directo</p>
                  <p className="text-xs uppercase tracking-widest text-[#8B6A55]">Del Taller al Hogar</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── IMPACTO SOCIAL & OBJETIVOS ─────────────────────── */}
      <section className="py-32 bg-[#2C1810] text-white overflow-hidden relative">
        <div className="absolute top-0 right-0 w-1/2 h-full bg-[#3D2519] skew-x-12 translate-x-32" />
        
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="max-w-3xl mb-24">
            <span className="text-[11px] font-bold uppercase tracking-[0.3em] text-[#D4B896] mb-6 block">Compromiso Social</span>
            <h2 className="text-5xl font-bold mb-8">Transformando vidas a través del arte.</h2>
            <p className="text-[#A08070] text-xl leading-relaxed">
              Nuestro objetivo trasciende lo comercial. Buscamos crear un impacto sostenible que fortalezca el tejido social de nuestras comunidades.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-12">
            <div className="group">
              <div className="w-16 h-16 bg-[#D4B896]/10 rounded-2xl flex items-center justify-center mb-8 group-hover:bg-[#D4B896] group-hover:text-[#2C1810] transition-all">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M22 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold mb-4">Economía Circular</h3>
              <p className="text-[#A08070] leading-relaxed">
                Aseguramos que el mayor porcentaje del valor de cada pieza regrese directamente a la comunidad, fomentando el desarrollo local.
              </p>
            </div>
            <div className="group">
              <div className="w-16 h-16 bg-[#D4B896]/10 rounded-2xl flex items-center justify-center mb-8 group-hover:bg-[#D4B896] group-hover:text-[#2C1810] transition-all">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold mb-4">Preservación</h3>
              <p className="text-[#A08070] leading-relaxed">
                Documentamos las técnicas en peligro de extinción para que las nuevas generaciones encuentren orgullo y sustento en su herencia.
              </p>
            </div>
            <div className="group">
              <div className="w-16 h-16 bg-[#D4B896]/10 rounded-2xl flex items-center justify-center mb-8 group-hover:bg-[#D4B896] group-hover:text-[#2C1810] transition-all">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" /><line x1="2" y1="12" x2="22" y2="12" /><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold mb-4">Visibilidad Global</h3>
              <p className="text-[#A08070] leading-relaxed">
                Llevamos la historia de la Mixteca a mercados internacionales, posicionando la artesanía mexicana como arte de lujo.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── PIEZAS DESTACADAS ──────────────────────────────── */}
      <section className="py-32 bg-[#FAF7F2]">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-20 gap-8">
            <div className="max-w-2xl">
              <span className="text-[11px] font-bold uppercase tracking-[0.3em] text-[#8B6A55] mb-4 block">Colección Curada</span>
              <h2 className="text-5xl font-bold text-[#2C1810]">Piezas que cuentan una historia única.</h2>
            </div>
            <Link
              href="/client/catalogo"
              className="inline-flex items-center gap-2 font-bold text-sm uppercase tracking-widest text-[#6B3A2A] hover:gap-4 transition-all"
            >
              Ver Catálogo Completo →
            </Link>
          </div>

          {productos.length === 0 ? (
            <div className="text-center py-24 bg-white rounded-[3rem] border border-dashed border-[#E6D8C7]">
              <p className="text-[#A08070]">Preparando la próxima colección...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
              {productos.slice(0, 6).map((p: any) => (
                <Link
                  key={p.id_producto}
                  href={`/client/producto/${p.id_producto}`}
                  className="group flex flex-col bg-white rounded-[2.5rem] overflow-hidden border border-[#E6D8C7] shadow-[0_15px_45px_rgba(86,55,32,0.04)] hover:shadow-[0_25px_65px_rgba(86,55,32,0.1)] transition-all duration-700 hover:-translate-y-4"
                >
                  <div className="relative aspect-[4/5] overflow-hidden bg-[#F5EFE6]">
                    {p.imagen ? (
                      <img
                        src={p.imagen}
                        alt={p.nombre}
                        className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-6xl">🏺</div>
                    )}
                    {p.es_unico && (
                      <div className="absolute top-6 left-6">
                        <span className="bg-[#2C1810] text-white text-[10px] px-4 py-2 rounded-full uppercase font-bold tracking-[0.2em] shadow-xl">
                          Pieza Única
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="p-10 flex flex-col flex-1">
                    <div className="flex-1">
                      <p className="text-[10px] uppercase tracking-[0.25em] text-[#A08070] mb-4 font-bold">
                        {p.categoriaNombre || "Artesanía"}
                      </p>
                      <h3 className="text-2xl font-bold text-[#2C1810] leading-tight group-hover:text-[#6B3A2A] transition-colors mb-4">
                        {p.nombre}
                      </h3>
                      <p className="text-[#7A6A5A] line-clamp-2 leading-relaxed text-sm">
                        {p.descripcion || "Una expresión sublime del arte mixteco."}
                      </p>
                    </div>
                    <div className="mt-8 pt-8 border-t border-[#F0E8DC] flex items-center justify-between">
                      <span className="text-xl font-bold text-[#6B3A2A]">
                        ${Number(p.precio).toLocaleString("es-MX")} <span className="text-[10px] text-[#A08070] ml-1">MXN</span>
                      </span>
                      <span className="w-12 h-12 rounded-full bg-[#FAF7F2] flex items-center justify-center group-hover:bg-[#2C1810] group-hover:text-white transition-all duration-500">
                        →
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ── ARTESANO DEL MES ───────────────────────────────── */}
      {artesanoDelMes && (
        <section className="py-20 bg-[#F0E8DC] relative overflow-hidden">
          {/* Fondo decorativo sutil */}
          <div className="absolute -bottom-12 -left-12 w-64 h-64 bg-[#D4B896] opacity-10 rounded-full blur-3xl" />
          
          <div className="max-w-7xl mx-auto px-6">
            <div className="bg-white/40 backdrop-blur-sm rounded-[3rem] p-8 md:p-12 border border-white/20 shadow-xl">
              <div className="grid lg:grid-cols-2 gap-12 items-center">
                <div className="relative order-2 lg:order-1">
                  <div className="aspect-square max-w-md mx-auto rounded-[2.5rem] overflow-hidden shadow-2xl relative z-10 border-4 border-white">
                    {artesanoDelMes.foto_perfil ? (
                      <img
                        src={artesanoDelMes.foto_perfil}
                        alt={artesanoDelMes.nombre}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-[#2C1810] flex items-center justify-center text-8xl">👨‍🎨</div>
                    )}
                  </div>
                </div>
                
                <div className="order-1 lg:order-2">
                  <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-[#8B6A55] mb-4 block">Maestro de la Comunidad</span>
                  <h2 className="text-4xl font-bold text-[#2C1810] mb-6 leading-tight">
                    {artesanoDelMes.nombre} {artesanoDelMes.apellido}
                  </h2>
                  <div className="space-y-4 text-[#5C4A3A] text-base leading-relaxed mb-10">
                    <p className="italic border-l-2 border-[#D4B896] pl-6 py-1">
                      "{artesanoDelMes.historia?.slice(0, 220) || "Dedicado a la preservación de las tradiciones mixtecas a través del arte manual."}..."
                    </p>
                    <p className="text-sm font-medium">
                      Origen: <span className="text-[#6B3A2A] font-bold">{artesanoDelMes.comunidad || "Mixteca Alta"}</span>
                    </p>
                  </div>
                  <Link
                    href={`/client/artesano/${artesanoDelMes.id_artesano}`}
                    className="inline-flex items-center justify-center px-8 py-4 bg-[#2C1810] text-white rounded-full font-bold text-xs uppercase tracking-widest hover:bg-[#6B3A2A] transition-all shadow-lg hover:shadow-xl"
                  >
                    Conocer su Historia
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
