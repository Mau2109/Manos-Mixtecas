import {
  agregarProductoCarritoDb,
  actualizarCantidadProductoCarritoDb,
  eliminarProductoCarritoDb,
  listarMetodosPagoDb,
  obtenerDetalleCarritoPorProductoDb,
  obtenerOCrearCarritoActivoDb,
  obtenerCarritoDb,
  vaciarCarritoDb,
} from "../persistence/repositories/carritoRepository";
import { consultarStockDb } from "../persistence/repositories/productoRepository";

function mapearItemsCarrito(items: any[] | null | undefined) {
  return (items ?? []).map((item: any) => ({
    id_detalle: item.id_detalle,
    id_producto: item.productos?.id_producto ?? item.id_producto,
    nombre: item.productos?.nombre ?? "Producto",
    precio_unitario: Number(item.precio_unitario),
    cantidad: Number(item.cantidad),
    imagen: item.productos?.imagen ?? undefined,
    stock: Number(item.productos?.stock ?? 0),
    fragilidad: item.productos?.fragilidad ?? undefined,
    es_unico: Boolean(item.productos?.es_unico),
  }));
}

async function validarStockDisponible(idProducto: number, cantidadSolicitada: number) {
  const producto = await consultarStockDb(idProducto);
  const stockDisponible = Number(producto?.stock ?? 0);

  if (cantidadSolicitada > stockDisponible) {
    throw new Error("Stock insuficiente");
  }

  return stockDisponible;
}

export async function obtenerOCrearCarritoActivo(idCliente: number) {
  if (!idCliente) throw new Error("ID de cliente requerido");
  return obtenerOCrearCarritoActivoDb(idCliente);
}

/* ===============================
   USD04 - Visualizar producto del carrito
   =============================== */
export async function obtenerCarrito(idCarrito: number) {
  if (!idCarrito) throw new Error("ID de carrito requerido");
  const items = await obtenerCarritoDb(idCarrito);
  return mapearItemsCarrito(items);
}

/* ===============================
   USD05 - Cálculo total de compras
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
   USD02 - Agregar producto al carrito
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

  const detalleExistente = await obtenerDetalleCarritoPorProductoDb(
    id_carrito,
    id_producto
  );
  const nuevaCantidad = Number(detalleExistente?.cantidad ?? 0) + cantidad;

  await validarStockDisponible(id_producto, nuevaCantidad);

  if (detalleExistente?.id_detalle) {
    await actualizarCantidadProductoCarritoDb(detalleExistente.id_detalle, nuevaCantidad);
    return true;
  }

  return agregarProductoCarritoDb(id_carrito, id_producto, cantidad, precio);
}

export async function actualizarCantidadProductoCarrito(
  idCarrito: number,
  idProducto: number,
  cantidad: number
) {
  if (!idCarrito) throw new Error("ID de carrito requerido");
  if (!idProducto) throw new Error("ID de producto requerido");

  const detalle = await obtenerDetalleCarritoPorProductoDb(idCarrito, idProducto);
  if (!detalle?.id_detalle) {
    throw new Error("Producto no encontrado en el carrito");
  }

  if (cantidad <= 0) {
    await eliminarProductoCarritoDb(detalle.id_detalle);
    return true;
  }

  await validarStockDisponible(idProducto, cantidad);
  await actualizarCantidadProductoCarritoDb(detalle.id_detalle, cantidad);
  return true;
}

/* ===============================
   USD03 - Eliminar producto del carrito
   =============================== */
export async function eliminarProductoCarrito(idDetalle: number) {
  if (!idDetalle) throw new Error("ID de detalle requerido");
  return eliminarProductoCarritoDb(idDetalle);
}

export async function eliminarProductoCarritoPorProducto(
  idCarrito: number,
  idProducto: number
) {
  if (!idCarrito) throw new Error("ID de carrito requerido");
  if (!idProducto) throw new Error("ID de producto requerido");

  const detalle = await obtenerDetalleCarritoPorProductoDb(idCarrito, idProducto);
  if (!detalle?.id_detalle) {
    throw new Error("Producto no encontrado en el carrito");
  }

  return eliminarProductoCarritoDb(detalle.id_detalle);
}

export async function vaciarCarrito(idCarrito: number) {
  if (!idCarrito) throw new Error("ID de carrito requerido");
  return vaciarCarritoDb(idCarrito);
}

/* ===============================
   USD12 - Selección de método de pago
   =============================== */
export async function listarMetodosPago() {
  return listarMetodosPagoDb();
}
