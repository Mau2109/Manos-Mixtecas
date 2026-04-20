import Link from "next/link";
import { obtenerCatalogoProductos } from "@/lib/services/productoService";

export const dynamic = "force-dynamic";

type CatalogoSearchParams = {
  categoria?: string;
  q?: string;
  pagina?: string;
};

interface CategoriaCatalogo {
  id: number;
  nombre: string;
  descripcion: string | null;
  cantidad: number;
}

interface ProductoCatalogo {
  id_producto: number;
  nombre: string;
  descripcion: string | null;
  precio: number;
  imagen: string | null;
  stock: number;
  es_unico: boolean;
  es_destacado: boolean;
  descuento_pct?: number;
  tipoArtesania: string;
  artesanoNombre: string;
}

interface CatalogoData {
  productos: ProductoCatalogo[];
  categorias: CategoriaCatalogo[];
  totalResultados: number;
  totalPaginas: number;
  paginaActual: number;
  porPagina: number;
  terminoBusqueda: string;
  categoriaSeleccionada: CategoriaCatalogo | null;
  categoriaSeleccionadaId: string;
  hayFiltrosActivos: boolean;
}

function construirCatalogoHref(params: CatalogoSearchParams = {}) {
  const query = new URLSearchParams();

  if (params.q?.trim()) {
    query.set("q", params.q.trim());
  }

  if (params.categoria?.trim()) {
    query.set("categoria", params.categoria.trim());
  }

  if (params.pagina && params.pagina !== "1") {
    query.set("pagina", params.pagina);
  }

  const queryString = query.toString();
  return queryString ? `/client/catalogo?${queryString}` : "/client/catalogo";
}

function calcularPrecioFinal(precio: number, descuentoPct: number) {
  return precio * (1 - descuentoPct / 100);
}

export default async function CatalogoPage({
  searchParams,
}: {
  searchParams: Promise<CatalogoSearchParams>;
}) {
  const params = await searchParams;
  let catalogo: CatalogoData = {
    productos: [],
    categorias: [],
    totalResultados: 0,
    totalPaginas: 1,
    paginaActual: 1,
    porPagina: 12,
    terminoBusqueda: params.q?.trim() ?? "",
    categoriaSeleccionada: null,
    categoriaSeleccionadaId: "",
    hayFiltrosActivos: Boolean(params.q?.trim() || params.categoria?.trim()),
  };

  try {
    const data = await obtenerCatalogoProductos({
      categoria: params.categoria,
      q: params.q,
      pagina: params.pagina,
      porPagina: 12,
    });
    // Forzamos el cast si estamos seguros de que la estructura coincide o adaptamos.
    catalogo = data as unknown as CatalogoData;
  } catch (error) {
    console.error("No se pudo cargar el catálogo", error);
  }

  const totalDisponibles = catalogo.categorias.reduce(
    (acumulado, categoria) => acumulado + categoria.cantidad,
    0
  );

  const etiquetaActual = catalogo.categoriaSeleccionada
    ? catalogo.categoriaSeleccionada.nombre
    : "Toda la colección";

  return (
    <div className="bg-[linear-gradient(180deg,#faf7f2_0%,#f7f0e6_32%,#fffdf9_100%)]">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
        <nav className="flex flex-wrap items-center gap-2 text-xs text-[#A08070]">
          <Link href="/client" className="transition-colors hover:text-[#6B3A2A]">
            Inicio
          </Link>
          <span>/</span>
          <span className="text-[#2C1810]">Catálogo</span>
        </nav>

        <div className="grid gap-8 lg:grid-cols-[280px_minmax(0,1fr)] xl:grid-cols-[320px_minmax(0,1fr)]">
          <aside className="lg:sticky lg:top-24 lg:self-start">
            <div className="rounded-[1.75rem] border border-[#E6D8C7] bg-white p-5 shadow-[0_12px_30px_rgba(86,55,32,0.08)] sm:p-6">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#8B6A55]">
                    Filtros
                  </p>
                  <h2 className="mt-2 text-xl font-semibold text-[#2C1810]">
                    Explora por artesanía
                  </h2>
                </div>
                {catalogo.hayFiltrosActivos && (
                  <Link
                    href="/client/catalogo"
                    className="rounded-full border border-[#D8C1AA] px-3 py-1 text-xs font-medium text-[#6B3A2A] transition-colors hover:bg-[#F6EBDD]"
                  >
                    Limpiar
                  </Link>
                )}
              </div>

              <form method="get" className="mt-6 space-y-3">
                {catalogo.categoriaSeleccionadaId && (
                  <input
                    type="hidden"
                    name="categoria"
                    value={catalogo.categoriaSeleccionadaId}
                  />
                )}
                <label className="block">
                  <span className="mb-2 block text-sm font-medium text-[#5D4839]">
                    Buscar producto
                  </span>
                  <input
                    name="q"
                    defaultValue={catalogo.terminoBusqueda}
                    placeholder="Barro, Cerámica, Madera"
                    className="w-full rounded-2xl border border-[#D9C6B3] bg-[#FFFCF8] px-4 py-3 text-sm text-[#2C1810] outline-none transition-colors placeholder:text-[#A08070] focus:border-[#6B3A2A]"
                  />
                </label>
                <button
                  type="submit"
                  className="w-full rounded-2xl bg-[#2C1810] px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#6B3A2A]"
                >
                  Aplicar búsqueda
                </button>
              </form>

              <div className="mt-6">
                <div className="mb-3 flex items-center justify-between">
                  <p className="text-sm font-semibold text-[#5D4839]">Tipos de artesanía</p>
                  <span className="text-xs text-[#9B7D66]">{catalogo.categorias.length} tipos</span>
                </div>

                <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-1">
                  <Link
                    href={construirCatalogoHref({ q: catalogo.terminoBusqueda })}
                    className={`flex items-center justify-between rounded-2xl px-4 py-3 text-sm transition-all ${!catalogo.categoriaSeleccionadaId
                      ? "bg-[#2C1810] text-white shadow-[0_10px_24px_rgba(44,24,16,0.22)]"
                      : "border border-[#E6D8C7] bg-[#FFFCF8] text-[#5D4839] hover:border-[#CFAF92] hover:bg-[#F9F1E6]"
                      }`}
                  >
                    <span>Todas las artesanías</span>
                    <span
                      className={`rounded-full px-2.5 py-1 text-xs ${!catalogo.categoriaSeleccionadaId
                        ? "bg-white/15 text-white"
                        : "bg-[#F2E5D5] text-[#7C624F]"
                        }`}
                    >
                      {totalDisponibles}
                    </span>
                  </Link>

                  {catalogo.categorias.map((categoria) => {
                    const activa =
                      catalogo.categoriaSeleccionadaId === String(categoria.id);

                    return (
                      <Link
                        key={categoria.id}
                        href={construirCatalogoHref({
                          categoria: String(categoria.id),
                          q: catalogo.terminoBusqueda,
                        })}
                        className={`flex items-center justify-between rounded-2xl px-4 py-3 text-sm transition-all ${activa
                          ? "bg-[#2C1810] text-white shadow-[0_10px_24px_rgba(44,24,16,0.22)]"
                          : "border border-[#E6D8C7] bg-[#FFFCF8] text-[#5D4839] hover:border-[#CFAF92] hover:bg-[#F9F1E6]"
                          } ${categoria.cantidad === 0 ? "opacity-70" : ""}`}
                      >
                        <span className="pr-3">{categoria.nombre}</span>
                        <span
                          className={`rounded-full px-2.5 py-1 text-xs ${activa
                            ? "bg-white/15 text-white"
                            : "bg-[#F2E5D5] text-[#7C624F]"
                            }`}
                        >
                          {categoria.cantidad}
                        </span>
                      </Link>
                    );
                  })}
                </div>
              </div>
            </div>
          </aside>

          <section className="min-w-0">
            <div className="mb-5 flex flex-col gap-3 rounded-[1.75rem] border border-[#E6D8C7] bg-white p-5 shadow-[0_12px_30px_rgba(86,55,32,0.08)] sm:flex-row sm:items-center sm:justify-between sm:p-6">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#8B6A55]">
                  Vista del catálogo
                </p>
                <h2 className="mt-2 text-2xl font-bold text-[#2C1810]">{etiquetaActual}</h2>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-full bg-[#F3E7D8] px-3 py-1 text-sm font-medium text-[#6B3A2A]">
                  {catalogo.totalResultados} resultados
                </span>
                {catalogo.terminoBusqueda && (
                  <span className="rounded-full border border-[#D8C1AA] px-3 py-1 text-sm text-[#5D4839]">
                    Búsqueda: {catalogo.terminoBusqueda}
                  </span>
                )}
                {catalogo.hayFiltrosActivos && (
                  <Link
                    href="/client/catalogo"
                    className="rounded-full border border-[#D8C1AA] px-3 py-1 text-sm text-[#6B3A2A] transition-colors hover:bg-[#F6EBDD]"
                  >
                    Quitar filtros
                  </Link>
                )}
              </div>
            </div>

            {catalogo.productos.length === 0 ? (
              <div className="rounded-[1.75rem] border border-dashed border-[#D8C1AA] bg-white px-6 py-16 text-center shadow-[0_12px_30px_rgba(86,55,32,0.06)]">
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#A08070]">
                  Sin coincidencias
                </p>
                <h3 className="mt-3 text-2xl font-bold text-[#2C1810]">
                  No encontramos piezas con esos criterios.
                </h3>
                <p className="mx-auto mt-4 max-w-xl text-sm leading-7 text-[#6A5647]">
                  Prueba otra búsqueda o limpia el filtro para volver a ver todas las
                  artesanías disponibles.
                </p>
                <Link
                  href="/client/catalogo"
                  className="mt-6 inline-flex rounded-full bg-[#2C1810] px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#6B3A2A]"
                >
                  Ver todo el catálogo
                </Link>
              </div>
            ) : (
              <>
                <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
                  {catalogo.productos.map((producto) => {
                    const descuento = Number(producto.descuento_pct ?? 0);
                    const precio = Number(producto.precio ?? 0);
                    const precioFinal =
                      descuento > 0 ? calcularPrecioFinal(precio, descuento) : precio;

                    return (
                      <Link
                        key={producto.id_producto}
                        href={`/client/producto/${producto.id_producto}`}
                        className="group overflow-hidden rounded-[1.75rem] border border-[#E6D8C7] bg-white shadow-[0_12px_28px_rgba(86,55,32,0.08)] transition-all hover:-translate-y-1 hover:shadow-[0_18px_38px_rgba(86,55,32,0.14)]"
                      >
                        <div className="relative aspect-[4/4.3] overflow-hidden bg-[linear-gradient(135deg,#d7bb98_0%,#8f6344_100%)]">
                          {producto.imagen ? (
                            <img
                              src={producto.imagen}
                              alt={producto.nombre}
                              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                            />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center text-sm font-medium text-white/80">
                              Sin imagen disponible
                            </div>
                          )}

                          <div className="absolute left-4 top-4 flex flex-wrap gap-2">
                            {producto.es_unico && (
                              <span className="rounded-full bg-[#6B3A2A] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-white">
                                Pieza única
                              </span>
                            )}
                            {descuento > 0 && (
                              <span className="rounded-full bg-[#B64031] px-3 py-1 text-[11px] font-semibold text-white">
                                -{descuento}%
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="space-y-4 p-5">
                          <div className="flex items-start justify-between gap-4">
                            <div>
                              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#A08070]">
                                {producto.tipoArtesania}
                              </p>
                              <h3 className="mt-2 line-clamp-2 text-lg font-semibold text-[#2C1810]">
                                {producto.nombre}
                              </h3>
                            </div>
                            <span className="rounded-full bg-[#F7EFE5] px-3 py-1 text-xs text-[#6B3A2A]">
                              Stock {producto.stock}
                            </span>
                          </div>

                          <p className="line-clamp-2 text-sm leading-6 text-[#6A5647]">
                            {producto.descripcion || "Pieza artesanal elaborada con dedicación y tradición."}
                          </p>

                          <div className="rounded-2xl bg-[#F8F1E8] p-4">
                            <div className="flex flex-wrap items-end justify-between gap-3">
                              <div>
                                <p className="text-xs uppercase tracking-[0.18em] text-[#A08070]">
                                  Precio
                                </p>
                                <div className="mt-2 flex flex-wrap items-center gap-2">
                                  <span className="text-xl font-bold text-[#6B3A2A]">
                                    ${precioFinal.toLocaleString("es-MX")} MXN
                                  </span>
                                  {descuento > 0 && (
                                    <span className="text-sm text-[#A08070] line-through">
                                      ${precio.toLocaleString("es-MX")}
                                    </span>
                                  )}
                                </div>
                              </div>
                              <div className="text-right">
                                <p className="text-xs uppercase tracking-[0.18em] text-[#A08070]">
                                  Artesano
                                </p>
                                <p className="mt-2 text-sm font-medium text-[#2C1810]">
                                  {producto.artesanoNombre || "Manos Mixtecas"}
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </Link>
                    );
                  })}
                </div>

                {catalogo.totalPaginas > 1 && (
                  <div className="mt-8 flex flex-wrap items-center justify-center gap-2">
                    {Array.from({ length: catalogo.totalPaginas }, (_, index) => index + 1).map(
                      (numeroPagina) => {
                        const paginaActiva = numeroPagina === catalogo.paginaActual;

                        return (
                          <Link
                            key={numeroPagina}
                            href={construirCatalogoHref({
                              categoria: catalogo.categoriaSeleccionadaId || undefined,
                              q: catalogo.terminoBusqueda || undefined,
                              pagina: String(numeroPagina),
                            })}
                            className={`flex h-11 min-w-11 items-center justify-center rounded-full px-4 text-sm font-medium transition-colors ${paginaActiva
                              ? "bg-[#2C1810] text-white"
                              : "border border-[#D8C1AA] bg-white text-[#5D4839] hover:border-[#6B3A2A] hover:text-[#2C1810]"
                              }`}
                          >
                            {numeroPagina}
                          </Link>
                        );
                      }
                    )}
                  </div>
                )}
              </>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
