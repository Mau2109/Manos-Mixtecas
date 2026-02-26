import {
  agregarProductoCarritoDb,
  eliminarProductoCarritoDb,
  listarMetodosPagoDb,
  obtenerCarritoDb,
} from "../persistence/repositories/carritoRepository";

/* ===============================
   USD01 - Visualizar productos del carrito
   =============================== */
export async function obtenerCarrito(idCarrito: number) {
  if (!idCarrito) throw new Error("ID de carrito requerido");
  return obtenerCarritoDb(idCarrito);
}

/* ===============================
   USD02 - Cálculo total del carrito
   =============================== */
export async function calcularTotalCarrito(idCarrito: number): Promise<number> {
  const items = await obtenerCarrito(idCarrito);
  if (!items || items.length === 0) return 0;

  const total = items.reduce((sum, item) => {
    return sum + item.cantidad * Number(item.precio_unitario);
  }, 0);

  return Math.round(total * 100) / 100;
}

/* ===============================
   USD02 (original) - Agregar producto al carrito
   =============================== */
export async function agregarProductoCarrito(
  id_carrito: number,
  id_producto: number,
  cantidad: number,
  precio: number
) {
  if (cantidad <= 0) {
    throw new Error("Cantidad inválida");
  }
  return agregarProductoCarritoDb(id_carrito, id_producto, cantidad, precio);
}

/* ===============================
   USD01 - Eliminar producto del carrito
   =============================== */
export async function eliminarProductoCarrito(idDetalle: number) {
  if (!idDetalle) throw new Error("ID de detalle requerido");
  return eliminarProductoCarritoDb(idDetalle);
}

/* ===============================
   USD12 - Selección de método de pago
   =============================== */
export async function listarMetodosPago() {
  return listarMetodosPagoDb();
}
