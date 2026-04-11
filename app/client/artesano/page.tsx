import Link from "next/link";
import { obtenerArtesanos } from "@/lib/services/artesanoService";

export const dynamic = "force-dynamic";

export default async function ArtesanosPage() {
  let artesanos = [];
  try {
    artesanos = await obtenerArtesanos();
  } catch (error) {
    console.error("Error al obtener artesanos", error);
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {artesanos.map((artesano) => (
            <div
              key={artesano.id_artesano}
              className="bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-md transition-shadow group border border-[#E8DDD0]"
            >
              <div className="relative h-64 overflow-hidden bg-[#F0E8DC]">
                {artesano.foto_perfil ? (
                  <img
                    src={artesano.foto_perfil}
                    alt={artesano.nombre}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-[#6B3A2A]">
                    <span className="text-6xl mb-2">🧑‍🎨</span>
                  </div>
                )}
                {artesano.comunidad && (
                  <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-semibold text-[#6B3A2A]">
                    📍 {artesano.comunidad}
                  </div>
                )}
              </div>

              <div className="p-8">
                <h2 className="text-2xl font-bold text-[#2C1810] mb-2 group-hover:text-[#6B3A2A] transition-colors">
                  {artesano.nombre} {artesano.apellido}
                </h2>

                {artesano.tipo && (
                  <p className="text-xs uppercase tracking-widest text-[#A08070] font-bold mb-4">
                    {artesano.tipo}
                  </p>
                )}

                <p className="text-[#5C4A3A] text-sm line-clamp-3 mb-6 leading-relaxed">
                  {artesano.biografia || "Creador artesanal elaborando piezas únicas con alma y tradición, demostrando la magia de la Mixteca en cada detalle."}
                </p>

                <Link
                  href={`/client/artesano/${artesano.id_artesano}`}
                  className="inline-flex items-center gap-2 text-sm font-semibold text-[#2C1810] hover:text-[#6B3A2A] transition-colors"
                >
                  Conocer su historia
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <line x1="5" y1="12" x2="19" y2="12"></line>
                    <polyline points="12 5 19 12 12 19"></polyline>
                  </svg>
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
