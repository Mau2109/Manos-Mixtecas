import Link from "next/link";
import { imprimirListadoProductos } from "@/lib/services/productoService";

export default async function CatalogoPage({
  searchParams,
}: {
  searchParams: { categoria?: string; q?: string; pagina?: string };
}) {
  const productos = (await imprimirListadoProductos()) ?? [];

  // Filtrar por categoría o búsqueda en el servidor
  const q = searchParams.q?.toLowerCase() ?? "";
  const cat = searchParams.categoria ?? "";
  const pagina = Number(searchParams.pagina ?? 1);
  const POR_PAGINA = 12;

  const filtrados = productos.filter((p: any) => {
    const matchQ = q ? p.nombre?.toLowerCase().includes(q) || p.descripcion?.toLowerCase().includes(q) : true;
    const matchCat = cat ? String(p.id_categoria) === cat : true;
    return matchQ && matchCat && p.estado !== false;
  });

  const totalPaginas = Math.ceil(filtrados.length / POR_PAGINA);
  const paginados = filtrados.slice((pagina - 1) * POR_PAGINA, pagina * POR_PAGINA);

  // Categorías únicas
  const categorias = [...new Map(productos.map((p: any) => [p.id_categoria, { id: p.id_categoria, nombre: p.categoria_nombre ?? `Cat. ${p.id_categoria}` }])).values()];

  return (
    <div className="max-w-7xl mx-auto px-6 py-10">
      {/* Breadcrumb */}
      <nav className="text-xs text-[#A08070] mb-8 flex gap-2">
        <Link href="/client" className="hover:text-[#6B3A2A]">Inicio</Link>
        <span>/</span>
        <span className="text-[#2C1810]">Catálogo</span>
      </nav>

      <div className="flex gap-10">
        {/* ── Sidebar filtros ──────────────────────────────── */}
        <aside className="hidden md:block w-56 shrink-0">
          <div className="sticky top-24">
            <h3 className="text-xs tracking-widest uppercase text-[#A08070] mb-4">Filtrar por</h3>

            {/* Search */}
            <form className="mb-6">
              <input
                name="q"
                defaultValue={q}
                placeholder="Buscar..."
                className="w-full border border-[#D4C4B0] rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:border-[#6B3A2A] text-[#2C1810] placeholder:text-[#A08070]"
              />
              {cat && <input type="hidden" name="categoria" value={cat} />}
              <button type="submit" className="mt-2 w-full bg-[#2C1810] text-white text-xs py-2 rounded-lg hover:bg-[#6B3A2A] transition-colors">
                Buscar
              </button>
            </form>

            {/* Categorías */}
            <div>
              <p className="text-xs font-semibold text-[#5C4A3A] mb-3">Categorías</p>
              <div className="flex flex-col gap-1">
                <Link
                  href="/client/catalogo"
                  className={`text-sm py-1.5 px-3 rounded-lg transition-colors ${!cat ? "bg-[#2C1810] text-white" : "text-[#5C4A3A] hover:bg-[#F0E8DC]"}`}
                >
                  Todos
                </Link>
                {categorias.map((c: any) => (
                  <Link
                    key={c.id}
                    href={`/client/catalogo?categoria=${c.id}`}
                    className={`text-sm py-1.5 px-3 rounded-lg transition-colors ${cat === String(c.id) ? "bg-[#2C1810] text-white" : "text-[#5C4A3A] hover:bg-[#F0E8DC]"}`}
                  >
                    {c.nombre}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </aside>

        {/* ── Grid de productos ────────────────────────────── */}
        <div className="flex-1">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold text-[#2C1810]">
              {cat ? "Colección filtrada" : "Toda la colección"}
            </h1>
            <p className="text-sm text-[#A08070]">{filtrados.length} piezas</p>
          </div>

          {paginados.length === 0 ? (
            <div className="text-center py-24">
              <p className="text-5xl mb-4">🏺</p>
              <p className="text-[#A08070]">No se encontraron piezas con esos criterios.</p>
              <Link href="/client/catalogo" className="mt-4 inline-block text-sm text-[#6B3A2A] hover:underline">
                Ver todo el catálogo
              </Link>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-5">
                {paginados.map((p: any) => (
                  <Link
                    key={p.id_producto}
                    href={`/client/producto/${p.id_producto}`}
                    className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-shadow"
                  >
                    {/* Imagen (USD07) */}
                    <div className="aspect-square overflow-hidden relative">
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
                      {p.es_unico && (
                        <span className="absolute top-3 left-3 bg-[#6B3A2A] text-white text-[10px] px-2 py-0.5 rounded-full uppercase tracking-wide">
                          Único
                        </span>
                      )}
                      {p.descuento_pct > 0 && (
                        <span className="absolute top-3 right-3 bg-[#C0392B] text-white text-[10px] px-2 py-0.5 rounded-full">
                          -{p.descuento_pct}%
                        </span>
                      )}
                    </div>

                    {/* Precio e info (USD07) */}
                    <div className="p-4">
                      <p className="text-xs text-[#A08070] mb-1">{p.tecnica || p.materiales || "Artesanía"}</p>
                      <p className="font-medium text-[#2C1810] text-sm line-clamp-2">{p.nombre}</p>
                      <div className="mt-2 flex items-center gap-2">
                        {p.descuento_pct > 0 ? (
                          <>
                            <span className="font-bold text-[#6B3A2A]">
                              ${(Number(p.precio) * (1 - p.descuento_pct / 100)).toLocaleString("es-MX")} MXN
                            </span>
                            <span className="text-xs text-[#A08070] line-through">
                              ${Number(p.precio).toLocaleString("es-MX")}
                            </span>
                          </>
                        ) : (
                          <span className="font-bold text-[#6B3A2A]">
                            ${Number(p.precio).toLocaleString("es-MX")} MXN
                          </span>
                        )}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>

              {/* Paginación */}
              {totalPaginas > 1 && (
                <div className="mt-10 flex justify-center gap-2">
                  {Array.from({ length: totalPaginas }, (_, i) => i + 1).map((n) => (
                    <Link
                      key={n}
                      href={`/client/catalogo?pagina=${n}${cat ? `&categoria=${cat}` : ""}${q ? `&q=${q}` : ""}`}
                      className={`w-9 h-9 rounded-full flex items-center justify-center text-sm transition-colors ${
                        n === pagina
                          ? "bg-[#2C1810] text-white"
                          : "border border-[#D4C4B0] text-[#5C4A3A] hover:border-[#6B3A2A]"
                      }`}
                    >
                      {n}
                    </Link>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
