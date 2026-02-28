import {
  actualizarArtesanoDb,
  crearArtesanoDb,
  eliminarArtesanoDb,
  listarArtesanosDb,
  listarTiposArtesanoDb,
  obtenerGaleriaArtesanoDb,
  obtenerPerfilArtesanoDb,
} from "../persistence/repositories/artesanoRepository";

/* ===============================
   USD16 - Visualizar perfil del artesano
   USD21 - Información del artesano
   USD23 - Selección historia y comunidad
   USD28 - Mostrar ubicación
   =============================== */
export async function obtenerPerfilArtesano(idArtesano: number) {
  if (!idArtesano) throw new Error("ID de artesano requerido");
  return obtenerPerfilArtesanoDb(idArtesano);
}
/* ===============================
   USD27 - Galería imágenes del artesano
   (imágenes de sus productos como portafolio visual)
   =============================== */
export async function obtenerGaleriaArtesano(idArtesano: number) {
  if (!idArtesano) throw new Error("ID de artesano requerido");
  return obtenerGaleriaArtesanoDb(idArtesano);
}
/* ===============================
   USD20 - Filtro por tipo de artesano
   =============================== */
export async function listarTiposArtesano(): Promise<string[]> {
  const data = await listarTiposArtesanoDb();
  const tipos = [...new Set((data ?? []).map((a) => a.tipo as string))];
  return tipos;
}

/* ===============================
   Sin HU en hoja Usuario - Listar todos los artesanos activos
   =============================== */
export async function listarArtesanos() {
  return listarArtesanosDb();
}

/* ===============================
   ADM08 - Registrar artesano
   =============================== */
export async function crearArtesano(artesano: {
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
  if (!artesano.nombre) {
    throw new Error("El nombre del artesano es obligatorio");
  }

  return crearArtesanoDb(artesano);
}

/* ===============================
   ADM10 - Actualizar artesano
   =============================== */
export async function actualizarArtesano(
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
  if (!idArtesano) {
    throw new Error("ID de artesano requerido");
  }

  return actualizarArtesanoDb(idArtesano, artesano);
}

/* ===============================
   ADM11 - Eliminar artesano
   =============================== */
export async function eliminarArtesano(idArtesano: number) {
  if (!idArtesano) {
    throw new Error("ID de artesano requerido");
  }

  return eliminarArtesanoDb(idArtesano);
}
