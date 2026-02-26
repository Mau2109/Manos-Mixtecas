import { supabase } from "../../supabaseClient";

export async function obtenerPerfilArtesanoDb(idArtesano: number) {
  const { data, error } = await supabase
    .from("artesanos")
    .select(
      `
      id_artesano, nombre, apellido, biografia, tipo, comunidad,
      historia, ubicacion, foto_perfil, telefono, email,
      categorias(nombre)
    `
    )
    .eq("id_artesano", idArtesano)
    .eq("estado", true)
    .single();

  if (error) throw error;
  return data;
}

export async function obtenerGaleriaArtesanoDb(idArtesano: number) {
  const { data, error } = await supabase
    .from("imagenes_producto")
    .select(
      `
        id_imagen, url, descripcion, orden,
        productos!inner(id_producto, nombre, id_artesano)
      `
    )
    .eq("productos.id_artesano", idArtesano)
    .order("orden", { ascending: true });

  if (error) throw error;
  return data;
}

export async function listarTiposArtesanoDb() {
  const { data, error } = await supabase
    .from("artesanos")
    .select("tipo")
    .eq("estado", true)
    .not("tipo", "is", null);

  if (error) throw error;
  return data;
}

export async function listarArtesanosDb() {
  const { data, error } = await supabase
    .from("artesanos")
    .select(
      "id_artesano, nombre, apellido, tipo, comunidad, ubicacion, foto_perfil"
    )
    .eq("estado", true);

  if (error) throw error;
  return data;
}

export async function crearArtesanoDb(artesano: {
  nombre: string;
  apellido?: string;
  biografia?: string;
  tipo?: string;
  comunidad?: string;
  historia?: string;
  ubicacion?: string;
  foto_perfil?: string;
  telefono?: string;
  email?: string;
  id_categoria?: number;
  estado?: boolean;
}) {
  const { data, error } = await supabase
    .from("artesanos")
    .insert(artesano)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function actualizarArtesanoDb(
  idArtesano: number,
  artesano: {
    nombre?: string;
    apellido?: string;
    biografia?: string;
    tipo?: string;
    comunidad?: string;
    historia?: string;
    ubicacion?: string;
    foto_perfil?: string;
    telefono?: string;
    email?: string;
    id_categoria?: number;
    estado?: boolean;
  }
) {
  const { data, error } = await supabase
    .from("artesanos")
    .update(artesano)
    .eq("id_artesano", idArtesano)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function eliminarArtesanoDb(idArtesano: number) {
  const { error } = await supabase
    .from("artesanos")
    .update({ estado: false })
    .eq("id_artesano", idArtesano);

  if (error) throw error;
  return true;
}
