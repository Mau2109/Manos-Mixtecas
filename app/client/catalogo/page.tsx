import Link from "next/link";
import { consultarProductos } from "@/lib/services/productoService";

export const dynamic = "force-dynamic";

type CatalogoSearchParams = {
  categoria?: string;
  q?: string;
  pagina?: string;
};

export default async function CatalogoPage({
  searchParams,
}: {
  searchParams: Promise<CatalogoSearchParams>;
}) {
  const params = await searchParams;
  let productos: any[] = [];

  try {
    productos = (await consultarProductos()) ?? [];
  } catch {
    productos = [];
  }

  const q = params.q?.toLowerCase() ?? "";
  const cat = params.categoria ?? "";
  const pagina = Number(params.pagina ?? 1);
  const porPagina = 12;

  const filtrados = productos.filter((producto: any) => {
    const nombre = producto.nombre?.toLowerCase() ?? "";
    const descripcion = producto.descripcion?.toLowerCase() ?? "";
    const matchBusqueda = q ? nombre.includes(q) || descripcion.includes(q) : true;
    const matchCategoria = cat ? String(producto.id_categoria) === cat : true;
    return matchBusqueda && matchCategoria && producto.estado !== false;
  });

  const totalPaginas = Math.ceil(filtrados.length / porPagina);
  const paginados = filtrados.slice((pagina - 1) * porPagina, pagina * porPagina);

  const categorias = [
    ...new Map(
      productos
        .filter((producto: any) => producto.id_categoria != null)
        .map((producto: any) => [
          producto.id_categoria,
          {
            id: producto.id_categoria,
            nombre: producto.categorias?.nombre ?? `Cat. ${producto.id_categoria}`,
          },
        ])
    ).values(),
  ];

  return (
    <div className="max-w-7xl mx-auto px-6 py-10">
      <nav className="text-xs text-[#A08070] mb-8 flex gap-2">
        <Link href="/client" className="hover:text-[#6B3A2A]">
          Inicio
        </Link>
        <span>/</span>
        <span className="text-[#2C1810]">Catalogo</span>
      </nav>

      <div className="flex gap-10">
        <aside className="hidden md:block w-56 shrink-0">
          <div className="sticky top-24">
            <h3 className="text-xs tracking-widest uppercase text-[#A08070] mb-4">Filtrar por</h3>

            <form className="mb-6">
              <input
                name="q"
                defaultValue={q}
                placeholder="Buscar..."
                className="w-full border border-[#D4C4B0] rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:border-[#6B3A2A] text-[#2C1810] placeholder:text-[#A08070]"
              />
              {cat && <input type="hidden" name="categoria" value={cat} />}
              <button
                type="submit"
                className="mt-2 w-full bg-[#2C1810] text-white text-xs py-2 rounded-lg hover:bg-[#6B3A2A] transition-colors"
              >
                Buscar
              </button>
            </form>

            <div>
              <p className="text-xs font-semibold text-[#5C4A3A] mb-3">Categorias</p>
              <div className="flex flex-col gap-1">
                <Link
                  href="/client/catalogo"
                  className={`text-sm py-1.5 px-3 rounded-lg transition-colors ${
                    !cat ? "bg-[#2C1810] text-white" : "text-[#5C4A3A] hover:bg-[#F0E8DC]"
                  }`}
                >
                  Todos
                </Link>
                {categorias.map((categoria: any, index: number) => (
                  <Link
                    key={`${categoria.id}-${index}`}
                    href={`/client/catalogo?categoria=${categoria.id}`}
                    className={`text-sm py-1.5 px-3 rounded-lg transition-colors ${
                      cat === String(categoria.id)
                        ? "bg-[#2C1810] text-white"
                        : "text-[#5C4A3A] hover:bg-[#F0E8DC]"
                    }`}
                  >
                    {categoria.nombre}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </aside>

        <div className="flex-1">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold text-[#2C1810]">
              {cat ? "Coleccion filtrada" : "Toda la coleccion"}
            </h1>
            <p className="text-sm text-[#A08070]">{filtrados.length} piezas</p>
          </div>

          {paginados.length === 0 ? (
            <div className="text-center py-24">
              <p className="text-5xl mb-4">Pieza</p>
              <p className="text-[#A08070]">No se encontraron piezas con esos criterios.</p>
              <Link
                href="/client/catalogo"
                className="mt-4 inline-block text-sm text-[#6B3A2A] hover:underline"
              >
                Ver todo el catalogo
              </Link>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-5">
                {paginados.map((producto: any, index: number) => (
                  <Link
                    key={`${producto.id_producto ?? "producto"}-${index}`}
                    href={`/client/producto/${producto.id_producto}`}
                    className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-shadow"
                  >
                    <div className="aspect-square overflow-hidden relative">
                      {producto.imagen ? (
                        <img
                          src={producto.imagen}
                          alt={producto.nombre}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-[#C4A882] to-[#8B5E3C] flex items-center justify-center">
                          <span className="text-white/60 text-sm">Sin imagen</span>
                        </div>
                      )}
                      {producto.es_unico && (
                        <span className="absolute top-3 left-3 bg-[#6B3A2A] text-white text-[10px] px-2 py-0.5 rounded-full uppercase tracking-wide">
                          Unico
                        </span>
                      )}
                      {producto.descuento_pct > 0 && (
                        <span className="absolute top-3 right-3 bg-[#C0392B] text-white text-[10px] px-2 py-0.5 rounded-full">
                          -{producto.descuento_pct}%
                        </span>
                      )}
                    </div>

                    <div className="p-4">
                      <p className="text-xs text-[#A08070] mb-1">
                        {producto.tecnica || producto.materiales || "Artesania"}
                      </p>
                      <p className="font-medium text-[#2C1810] text-sm line-clamp-2">{producto.nombre}</p>
                      <div className="mt-2 flex items-center gap-2">
                        {producto.descuento_pct > 0 ? (
                          <>
                            <span className="font-bold text-[#6B3A2A]">
                              $
                              {(
                                Number(producto.precio) *
                                (1 - Number(producto.descuento_pct) / 100)
                              ).toLocaleString("es-MX")}{" "}
                              MXN
                            </span>
                            <span className="text-xs text-[#A08070] line-through">
                              ${Number(producto.precio).toLocaleString("es-MX")}
                            </span>
                          </>
                        ) : (
                          <span className="font-bold text-[#6B3A2A]">
                            ${Number(producto.precio).toLocaleString("es-MX")} MXN
                          </span>
                        )}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>

              {totalPaginas > 1 && (
                <div className="mt-10 flex justify-center gap-2">
                  {Array.from({ length: totalPaginas }, (_, index) => index + 1).map((numero) => (
                    <Link
                      key={numero}
                      href={`/client/catalogo?pagina=${numero}${cat ? `&categoria=${cat}` : ""}${
                        q ? `&q=${q}` : ""
                      }`}
                      className={`w-9 h-9 rounded-full flex items-center justify-center text-sm transition-colors ${
                        numero === pagina
                          ? "bg-[#2C1810] text-white"
                          : "border border-[#D4C4B0] text-[#5C4A3A] hover:border-[#6B3A2A]"
                      }`}
                    >
                      {numero}
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
