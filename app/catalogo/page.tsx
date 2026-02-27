import Link from "next/link";

// USD10 - Diseño acceso a catalogo
export default function CatalogoPage() {
  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-900">
      <main className="mx-auto flex w-full max-w-5xl flex-col gap-8 px-6 py-16">
        <header className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-semibold">Catálogo</h1>
            <p className="mt-2 text-sm text-zinc-600">
              Acceso rápido al catálogo de productos artesanales.
            </p>
          </div>
          <Link
            href="/"
            className="rounded-full border border-zinc-900 px-4 py-2 text-sm font-medium text-zinc-900 hover:bg-zinc-100"
          >
            Volver
          </Link>
        </header>

        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm">
            <h2 className="text-base font-semibold">Productos destacados</h2>
            <p className="mt-2 text-sm text-zinc-600">
              Revisa los productos con etiqueta destacado.
            </p>
          </div>
          <div className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm">
            <h2 className="text-base font-semibold">Filtro por artesano</h2>
            <p className="mt-2 text-sm text-zinc-600">
              Explora por tipo o comunidad del artesano.
            </p>
          </div>
          <div className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm">
            <h2 className="text-base font-semibold">Galería</h2>
            <p className="mt-2 text-sm text-zinc-600">
              Consulta imágenes y detalles de productos.
            </p>
          </div>
        </section>
      </main>
    </div>
  );
}
