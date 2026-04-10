import { supabase } from "../../supabaseClient";

/* ===============================
   ADM13 - Registrar método de pago (persistencia)
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
   USD12 - Selección método de pago (listar activos - persistencia)
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
   ADM13 - Consultar métodos de pago (incluye inactivos - persistencia)
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
   ADM13 - Consultar método de pago por ID (persistencia)
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
   ADM13 - Actualizar método de pago (persistencia)
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
   ADM13 - Desactivar método de pago (persistencia)
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
   ADM13 - Reactivar método de pago (persistencia)
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
