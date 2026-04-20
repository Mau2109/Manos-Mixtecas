import { supabase } from "../../supabaseClient";

/* ===============================
   USD17 - Mensaje de confirmación (contacto - persistencia)
   =============================== */
export async function enviarMensajeContactoDb(mensaje: {
  nombre: string;
  email: string;
  mensaje: string;
}) {
  const { error } = await supabase
    .from("mensajes_contacto")
    .insert({
      nombre: mensaje.nombre,
      email: mensaje.email,
      mensaje: mensaje.mensaje,
    });

  if (error) throw error;
  return true;
}