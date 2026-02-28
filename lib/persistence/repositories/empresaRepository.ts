import { supabase } from "../../supabaseClient";

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

export async function obtenerEmpresaDb() {
  const { data, error } = await supabase.from("empresa").select("*").limit(1).single();

  if (error) throw error;
  return data;
}

export async function obtenerMisionYValoresDb() {
  const { data, error } = await supabase
    .from("empresa")
    .select("mision, valores")
    .limit(1)
    .single();

  if (error) throw error;
  return data;
}

export async function obtenerContactoYRedesDb() {
  const { data, error } = await supabase
    .from("empresa")
    .select("telefono, email, redes_sociales, formulario_contacto_email")
    .limit(1)
    .single();

  if (error) throw error;
  return data;
}

export async function obtenerUbicacionEmpresaDb() {
  const { data, error } = await supabase
    .from("empresa")
    .select("direccion")
    .limit(1)
    .single();

  if (error) throw error;
  return data;
}
