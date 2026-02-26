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
