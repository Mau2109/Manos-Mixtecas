import { supabase } from "../../supabaseClient";

/* ===============================
   ADM16 - Agregar perfil empresa (persistencia)
   =============================== */
export async function crearEmpresaDb(empresa: {
  nombre: string;
  direccion?: string;
  telefono?: string;
  email?: string;
  descripcion?: string;
  mision?: string;
  valores?: string;
  redes_sociales?: Record<string, string>;
  formulario_contacto_email?: string;
}) {
  const { data, error } = await supabase
    .from("empresa")
    .insert(empresa)
    .select()
    .single();

  if (error) throw error;
  return data;
}

/* ===============================
   ADM17 - Editar perfil empresa (persistencia)
   =============================== */
export async function actualizarEmpresaDb(
  idEmpresa: number,
  empresa: {
    nombre?: string;
    direccion?: string;
    telefono?: string;
    email?: string;
    descripcion?: string;
    mision?: string;
    valores?: string;
    redes_sociales?: Record<string, string>;
    formulario_contacto_email?: string;
  }
) {
  const { data, error } = await supabase
    .from("empresa")
    .update(empresa)
    .eq("id_empresa", idEmpresa)
    .select()
    .single();

  if (error) throw error;
  return data;
}

/* ===============================
   ADM18 - Visualizar perfil empresa (persistencia)
   =============================== */
export async function obtenerEmpresaDb() {
  const { data, error } = await supabase.from("empresa").select("*").limit(1).single();

  if (error) throw error;
  return data;
}

/* ===============================
   USD11 - Mostrar misión y valores (persistencia)
   =============================== */
export async function obtenerMisionYValoresDb() {
  const { data, error } = await supabase
    .from("empresa")
    .select("mision, valores")
    .limit(1)
    .single();

  if (error) throw error;
  return data;
}

/* ===============================
   USD19 - Mostrar redes y contacto (persistencia)
   =============================== */
export async function obtenerContactoYRedesDb() {
  const { data, error } = await supabase
    .from("empresa")
    .select("telefono, email, redes_sociales, formulario_contacto_email")
    .limit(1)
    .single();

  if (error) throw error;
  return data;
}

/* ===============================
   USD28 - Mostrar ubicación (persistencia)
   =============================== */
export async function obtenerUbicacionEmpresaDb() {
  const { data, error } = await supabase
    .from("empresa")
    .select("direccion")
    .limit(1)
    .single();

  if (error) throw error;
  return data;
}
