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

  const data = await enviarMensajeContactoDb(contacto);
  return {
    confirmacion: true,
    id_mensaje: (data as any)?.id_mensaje,
  };
}

