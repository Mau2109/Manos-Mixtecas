import { supabase } from "../supabaseClient";

/* ===============================
   ADM09 - Agregar información de la empresa
   =============================== */
export async function crearEmpresa(empresa: {
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
  if (!empresa.nombre) {
    throw new Error("El nombre de la empresa es obligatorio");
  }

  const { data, error } = await supabase
    .from("empresa")
    .insert(empresa)
    .select()
    .single();

  if (error) throw error;
  return data;
}

/* ===============================
   ADM10 - Editar información de la empresa
   =============================== */
export async function actualizarEmpresa(
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
  if (!idEmpresa) {
    throw new Error("ID de empresa requerido");
  }

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
   ADM11 / USD11 - Visualizar información de la empresa
   Incluye: misión, valores, redes sociales y contacto (USD11, USD19, USD20)
   =============================== */
export async function obtenerEmpresa() {
  const { data, error } = await supabase
    .from("empresa")
    .select("*")
    .limit(1)
    .single();

  if (error) throw error;
  return data;
}

/* ===============================
   USD11 - Obtener misión y valores
   =============================== */
export async function obtenerMisionYValores() {
  const { data, error } = await supabase
    .from("empresa")
    .select("mision, valores")
    .limit(1)
    .single();

  if (error) throw error;
  return data;
}

/* ===============================
   USD19 / USD20 - Obtener datos de contacto y redes sociales
   =============================== */
export async function obtenerContactoYRedes() {
  const { data, error } = await supabase
    .from("empresa")
    .select("telefono, email, redes_sociales, formulario_contacto_email")
    .limit(1)
    .single();

  if (error) throw error;
  return data;
}