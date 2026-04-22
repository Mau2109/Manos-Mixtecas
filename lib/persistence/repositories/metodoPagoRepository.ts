import { supabase } from "../../supabaseClient";

/* ===============================
   Repository - Crear método de pago
   =============================== */
export async function crearMetodoPagoDb(metodoPago: {
  nombre: string;
  descripcion?: string;
}) {
  const { data, error } = await supabase
    .from("metodos_pago")
    .insert({
      nombre: metodoPago.nombre,
      descripcion: metodoPago.descripcion ?? null,
      estado: true,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

/* ===============================
   Repository - Listar métodos activos
   =============================== */
export async function listarMetodosPagoDb() {
  const { data, error } = await supabase
    .from("metodos_pago")
    .select("id_metodo_pago, nombre, descripcion, estado")
    .eq("estado", true)
    .order("nombre", { ascending: true });

  if (error) throw error;
  return data;
}

/* ===============================
   Repository - Listar todos los métodos (admin)
   =============================== */
export async function listarTodosMetodosPagoDb() {
  const { data, error } = await supabase
    .from("metodos_pago")
    .select("id_metodo_pago, nombre, descripcion, estado")
    .order("nombre", { ascending: true });

  if (error) throw error;
  return data;
}

/* ===============================
   Repository - Obtener método por ID
   =============================== */
export async function obtenerMetodoPagoDb(idMetodoPago: number) {
  const { data, error } = await supabase
    .from("metodos_pago")
    .select("id_metodo_pago, nombre, descripcion, estado")
    .eq("id_metodo_pago", idMetodoPago)
    .single();

  if (error) throw error;
  return data;
}

/* ===============================
   Repository - Actualizar método de pago
   =============================== */
export async function actualizarMetodoPagoDb(
  idMetodoPago: number,
  metodoPago: {
    nombre?: string;
    descripcion?: string;
  }
) {
  const { data, error } = await supabase
    .from("metodos_pago")
    .update({
      nombre: metodoPago.nombre ? metodoPago.nombre : undefined,
      descripcion: metodoPago.descripcion ?? undefined,
    })
    .eq("id_metodo_pago", idMetodoPago)
    .select()
    .single();

  if (error) throw error;
  return data;
}

/* ===============================
   Repository - Desactivar método de pago
   =============================== */
export async function desactivarMetodoPagoDb(idMetodoPago: number) {
  const { data, error } = await supabase
    .from("metodos_pago")
    .update({ estado: false })
    .eq("id_metodo_pago", idMetodoPago)
    .select()
    .single();

  if (error) throw error;
  return data;
}

/* ===============================
   Repository - Reactivar método de pago
   =============================== */
export async function reactivarMetodoPagoDb(idMetodoPago: number) {
  const { data, error } = await supabase
    .from("metodos_pago")
    .update({ estado: true })
    .eq("id_metodo_pago", idMetodoPago)
    .select()
    .single();

  if (error) throw error;
  return data;
}
