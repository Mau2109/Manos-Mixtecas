import { supabase } from "../supabaseClient";

/* ===============================
   USD16 - Visualizar perfil del artesano
   USD22 - Información del artesano
   USD24 - Historia y comunidad del artesano
   USD29 - Mostrar ubicación del artesano
   =============================== */
export async function obtenerPerfilArtesano(idArtesano: number) {
  if (!idArtesano) throw new Error("ID de artesano requerido");

  const { data, error } = await supabase
    .from("artesanos")
    .select(`
      id_artesano, nombre, apellido, biografia, tipo, comunidad,
      historia, ubicacion, foto_perfil, telefono, email,
      categorias(nombre)
    `)
    .eq("id_artesano", idArtesano)
    .eq("estado", true)
    .single();

  if (error) throw error;
  return data;
}
/* ===============================
   USD28 - Galería de imágenes del artesano
   (imágenes de sus productos como portafolio visual)
   =============================== */
   export async function obtenerGaleriaArtesano(idArtesano: number) {
    if (!idArtesano) throw new Error("ID de artesano requerido");
  
    const { data, error } = await supabase
      .from("imagenes_producto")
      .select(`
        id_imagen, url, descripcion, orden,
        productos!inner(id_producto, nombre, id_artesano)
      `)
      .eq("productos.id_artesano", idArtesano)
      .order("orden", { ascending: true });
  
    if (error) throw error;
    return data;
  }
/* ===============================
   USD21 - Listar tipos de artesano para filtros
   =============================== */
export async function listarTiposArtesano(): Promise<string[]> {
  const { data, error } = await supabase
    .from("artesanos")
    .select("tipo")
    .eq("estado", true)
    .not("tipo", "is", null);

  if (error) throw error;

  const tipos = [...new Set((data ?? []).map((a) => a.tipo as string))];
  return tipos;
}

/* ===============================
   USD21 / USD25 - Listar todos los artesanos activos
   =============================== */
export async function listarArtesanos() {
  const { data, error } = await supabase
    .from("artesanos")
    .select("id_artesano, nombre, apellido, tipo, comunidad, ubicacion, foto_perfil")
    .eq("estado", true);

  if (error) throw error;
  return data;
}