import {
  crearComprobanteDb,
  obtenerComprobantesDb,
  obtenerComprobanteDb,
  eliminarComprobanteDb,
  actualizarComprobanteDb,
} from "../persistence/repositories/comprobanteRepository";

/* ===============================
   ADM14 - Adjuntar comprobante a compra
   =============================== */
export async function adjuntarComprobante(comprobante: {
  id_compra: number;
  url_archivo: string;
  tipo?: string;
  descripcion?: string;
}) {
  if (!comprobante.id_compra) {
    throw new Error("ID de compra requerido");
  }
  if (!comprobante.url_archivo || comprobante.url_archivo.trim() === "") {
    throw new Error("URL del archivo es obligatoria");
  }

  return await crearComprobanteDb({
    id_compra: comprobante.id_compra,
    url_archivo: comprobante.url_archivo.trim(),
    tipo: comprobante.tipo,
    descripcion: comprobante.descripcion,
  });
}

/* ===============================
   Obtener comprobantes de una compra
   =============================== */
export async function obtenerComprobantes(idCompra: number) {
  if (!idCompra) {
    throw new Error("ID de compra requerido");
  }
  return await obtenerComprobantesDb(idCompra);
}

/* ===============================
   Obtener comprobante por ID
   =============================== */
export async function obtenerComprobante(idComprobante: number) {
  if (!idComprobante) {
    throw new Error("ID de comprobante requerido");
  }
  return await obtenerComprobanteDb(idComprobante);
}

/* ===============================
   Actualizar datos del comprobante
   =============================== */
export async function actualizarComprobante(
  idComprobante: number,
  comprobante: {
    tipo?: string;
    descripcion?: string;
  }
) {
  if (!idComprobante) {
    throw new Error("ID de comprobante requerido");
  }
  return await actualizarComprobanteDb(idComprobante, comprobante);
}

/* ===============================
   Eliminar comprobante
   =============================== */
export async function eliminarComprobante(idComprobante: number) {
  if (!idComprobante) {
    throw new Error("ID de comprobante requerido");
  }
  return await eliminarComprobanteDb(idComprobante);
}
