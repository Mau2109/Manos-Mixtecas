import { enviarMensajeContactoDb } from "../persistence/repositories/contactoRepository";

/* ===============================
   USD17 - Mensaje de confirmación (contacto)
   =============================== */
export async function enviarMensajeContacto(contacto: {
  nombre: string;
  email: string;
  mensaje: string;
}) {
  if (!contacto.nombre || !contacto.email || !contacto.mensaje) {
    throw new Error("Datos de contacto obligatorios");
  }

  let data;
  try {
    data = await enviarMensajeContactoDb({
      nombre: contacto.nombre.trim(),
      email: contacto.email.trim(),
      mensaje: contacto.mensaje.trim(),
    });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : error && typeof error === "object" && "message" in error
          ? String(error.message)
          : "No se pudo enviar el mensaje de contacto";

    if (message.includes("mensajes_contacto") || message.includes("schema cache")) {
      throw new Error(
        "No existe la tabla mensajes_contacto en Supabase. Ejecuta el script docs/supabase-mensajes-contacto.sql."
      );
    }

    throw error;
  }

  return {
    confirmacion: true,
    id_mensaje: (data as any)?.id_mensaje,
  };
}

