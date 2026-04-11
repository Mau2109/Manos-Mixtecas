import {
  crearMetodoPagoDb,
  listarMetodosPagoDb,
  listarTodosMetodosPagoDb,
  obtenerMetodoPagoDb,
  actualizarMetodoPagoDb,
  desactivarMetodoPagoDb,
  reactivarMetodoPagoDb,
} from "../persistence/repositories/metodoPagoRepository";

/* ===============================
   ADM06 - Registrar método de pago
   =============================== */
export async function crearMetodoPago(metodoPago: {
  nombre: string;
  descripcion?: string;
}) {
  if (!metodoPago.nombre || metodoPago.nombre.trim() === "") {
    throw new Error("El nombre del método de pago es obligatorio");
  }

  return await crearMetodoPagoDb({
    nombre: metodoPago.nombre.trim(),
    descripcion: metodoPago.descripcion,
  });
}

/* ===============================
   USD12 - Selección método de pago (listar activos)
   =============================== */
export async function listarMetodosPago() {
  return await listarMetodosPagoDb();
}

/* ===============================
   ADM13 - Consultar métodos de pago (incluye inactivos)
   =============================== */
export async function listarTodosMetodosPago() {
  return await listarTodosMetodosPagoDb();
}

/* ===============================
   ADM13 - Consultar método de pago por ID
   =============================== */
export async function obtenerMetodoPago(idMetodoPago: number) {
  if (!idMetodoPago) {
    throw new Error("ID de método de pago requerido");
  }

  return await obtenerMetodoPagoDb(idMetodoPago);
}

/* ===============================
   ADM13 - Actualizar método de pago
   =============================== */
export async function actualizarMetodoPago(
  idMetodoPago: number,
  metodoPago: {
    nombre?: string;
    descripcion?: string;
  }
) {
  if (!idMetodoPago) {
    throw new Error("ID de método de pago requerido");
  }

  if (metodoPago.nombre !== undefined && metodoPago.nombre.trim() === "") {
    throw new Error("El nombre del método de pago no puede estar vacío");
  }

  return await actualizarMetodoPagoDb(idMetodoPago, {
    nombre: metodoPago.nombre ? metodoPago.nombre.trim() : undefined,
    descripcion: metodoPago.descripcion,
  });
}

/* ===============================
   ADM13 - Desactivar método de pago
   =============================== */
export async function desactivarMetodoPago(idMetodoPago: number) {
  if (!idMetodoPago) {
    throw new Error("ID de método de pago requerido");
  }

  return await desactivarMetodoPagoDb(idMetodoPago);
}

/* ===============================
   ADM13 - Reactivar método de pago
   =============================== */
export async function reactivarMetodoPago(idMetodoPago: number) {
  if (!idMetodoPago) {
    throw new Error("ID de método de pago requerido");
  }

  return await reactivarMetodoPagoDb(idMetodoPago);
}
