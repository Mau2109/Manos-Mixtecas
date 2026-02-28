
import { supabase } from "../../supabaseClient";

/* ===============================
   Repository - Crear comprobante de compra
   =============================== */
export async function crearComprobanteDb(comprobante: {
  id_compra: number;
  url_archivo: string;
  tipo?: string;
  descripcion?: string; 
}) {
  const { data, error } = await supabase
    .from("comprobantes_compra")
    .insert({
      id_compra: comprobante.id_compra,
      url_archivo: comprobante.url_archivo,
      tipo: comprobante.tipo ?? null,
      descripcion: comprobante.descripcion ?? null,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

/* ===============================
   Repository - Obtener comprobantes de una compra
   =============================== */
export async function obtenerComprobantesDb(idCompra: number) {
  const { data, error } = await supabase
    .from("comprobantes_compra")
    .select("id_comprobante, url_archivo, tipo, descripcion, fecha_subida")
    .eq("id_compra", idCompra)
    .order("fecha_subida", { ascending: false });

  if (error) throw error;
  return data;
}

/* ===============================
   Repository - Obtener comprobante por ID
   =============================== */
export async function obtenerComprobanteDb(idComprobante: number) {
  const { data, error } = await supabase
    .from("comprobantes_compra")
    .select("id_comprobante, id_compra, url_archivo, tipo, descripcion, fecha_subida")
    .eq("id_comprobante", idComprobante)
    .single();

  if (error) throw error;
  return data;
}

/* ===============================
   Repository - Eliminar comprobante
   =============================== */
export async function eliminarComprobanteDb(idComprobante: number) {
  const { error } = await supabase
    .from("comprobantes_compra")
    .delete()
    .eq("id_comprobante", idComprobante);

  if (error) throw error;
  return true;
}

/* ===============================
   Repository - Actualizar comprobante
   =============================== */
export async function actualizarComprobanteDb(
  idComprobante: number,
  comprobante: {
    tipo?: string;
    descripcion?: string;
  }
) {
  const { data, error } = await supabase
    .from("comprobantes_compra")
    .update({
      tipo: comprobante.tipo ?? undefined,
      descripcion: comprobante.descripcion ?? undefined,
    })
    .eq("id_comprobante", idComprobante)
    .select()
    .single();

  if (error) throw error;
  return data;
}
