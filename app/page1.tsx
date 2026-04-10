import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-900">
      <main className="mx-auto flex w-full max-w-4xl flex-col gap-10 px-6 py-16">
        <header className="flex flex-col gap-3">
          <p className="text-sm font-medium uppercase tracking-widest text-zinc-500">
            Manos Mixtecas
          </p>
          <h1 className="text-3xl font-semibold leading-tight">
            Bienvenido al portal
          </h1>
          <p className="max-w-2xl text-base text-zinc-600">
            Explora el catálogo de productos artesanales y comunícate con
            nosotros si necesitas ayuda.
          </p>
        </header>

        <section className="grid gap-6 md:grid-cols-2">
          <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold">Catálogo</h2>
            <p className="mt-2 text-sm text-zinc-600">
              Accede a los productos disponibles, destacados y filtrados por
              tipo de artesano.
            </p>
            <Link
              href="/catalogo"
              className="mt-4 inline-flex items-center justify-center rounded-full bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800"
            >
              Ver catálogo
            </Link>
          </div>
          <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold">Contacto</h2>
            <p className="mt-2 text-sm text-zinc-600">
              Envíanos tu mensaje o tus dudas sobre productos y envíos.
            </p>
            <Link
              href="/contacto"
              className="mt-4 inline-flex items-center justify-center rounded-full border border-zinc-900 px-4 py-2 text-sm font-medium text-zinc-900 hover:bg-zinc-100"
            >
              Ir a contacto
            </Link>
          </div>
        </section>
      </main>
    </div>
  );
}
