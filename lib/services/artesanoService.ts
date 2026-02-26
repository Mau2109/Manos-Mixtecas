import {
  listarArtesanosDb,
  listarTiposArtesanoDb,
  obtenerGaleriaArtesanoDb,
  obtenerPerfilArtesanoDb,
} from "../persistence/repositories/artesanoRepository";

/* ===============================
   USD16 - Visualizar perfil del artesano
   USD22 - Información del artesano
   USD24 - Historia y comunidad del artesano
   USD29 - Mostrar ubicación del artesano
   =============================== */
export async function obtenerPerfilArtesano(idArtesano: number) {
  if (!idArtesano) throw new Error("ID de artesano requerido");
  return obtenerPerfilArtesanoDb(idArtesano);
}
/* ===============================
   USD28 - Galería de imágenes del artesano
   (imágenes de sus productos como portafolio visual)
   =============================== */
export async function obtenerGaleriaArtesano(idArtesano: number) {
  if (!idArtesano) throw new Error("ID de artesano requerido");
  return obtenerGaleriaArtesanoDb(idArtesano);
}
/* ===============================
   USD21 - Listar tipos de artesano para filtros
   =============================== */
export async function listarTiposArtesano(): Promise<string[]> {
  const data = await listarTiposArtesanoDb();
  const tipos = [...new Set((data ?? []).map((a) => a.tipo as string))];
  return tipos;
}

/* ===============================
   USD21 / USD25 - Listar todos los artesanos activos
   =============================== */
export async function listarArtesanos() {
  return listarArtesanosDb();
}
