import Link from "next/link";

// USD18 - Formulario de contacto
export default function ContactoPage() {
  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-900">
      <main className="mx-auto flex w-full max-w-3xl flex-col gap-8 px-6 py-16">
        <header className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-semibold">Contacto</h1>
            <p className="mt-2 text-sm text-zinc-600">
              Escríbenos si tienes dudas sobre productos o envíos.
            </p>
          </div>
          <Link
            href="/"
            className="rounded-full border border-zinc-900 px-4 py-2 text-sm font-medium text-zinc-900 hover:bg-zinc-100"
          >
            Volver
          </Link>
        </header>

        <form className="grid gap-4 rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
          <div className="grid gap-2">
            <label className="text-sm font-medium" htmlFor="nombre">
              Nombre
            </label>
            <input
              id="nombre"
              name="nombre"
              type="text"
              className="rounded-lg border border-zinc-300 px-3 py-2 text-sm"
              placeholder="Tu nombre"
            />
          </div>
          <div className="grid gap-2">
            <label className="text-sm font-medium" htmlFor="email">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              className="rounded-lg border border-zinc-300 px-3 py-2 text-sm"
              placeholder="tu@email.com"
            />
          </div>
          <div className="grid gap-2">
            <label className="text-sm font-medium" htmlFor="mensaje">
              Mensaje
            </label>
            <textarea
              id="mensaje"
              name="mensaje"
              rows={4}
              className="rounded-lg border border-zinc-300 px-3 py-2 text-sm"
              placeholder="Cuéntanos tu necesidad"
            />
          </div>
          <button
            type="button"
            className="mt-2 rounded-full bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800"
          >
            Enviar
          </button>
          <p className="text-xs text-zinc-500">
            Este formulario es de presentación. El envío real puede integrarse con un
            backend o servicio de correo.
          </p>
        </form>
      </main>
    </div>
  );
}
