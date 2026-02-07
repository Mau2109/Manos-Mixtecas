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
   ADM11 - Visualizar información de la empresa
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
  