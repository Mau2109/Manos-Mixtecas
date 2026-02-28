import {
  crearCompraDb,
  crearDetalleCompraDb,
  obtenerCompraDb,
  listarComprasDb,
} from "../persistence/repositories/compraRepository";
import { restaurarStockProductoDb } from "../persistence/repositories/ventaRepository";

/* ===============================
   Registrar compra
   =============================== */
export async function registrarCompra(compra: {
  id_artesano: number;
  detalles: Array<{
    id_producto: number;
    cantidad: number;
    costo_unitario: number;
  }>;
  id_metodo_pago?: number;
  notas?: string;
}) {
  if (!compra.id_artesano) {
    throw new Error("ID de artesano requerido");
  }
  if (!compra.detalles || compra.detalles.length === 0) {
    throw new Error("Debe haber al menos un artículo en la compra");
  }

  // validar cada línea
  for (const det of compra.detalles) {
    if (!det.id_producto) {
      throw new Error("ID de producto requerido en detalle");
    }
    if (det.cantidad <= 0) {
      throw new Error("Cantidad inválida en detalle");
    }
    if (det.costo_unitario <= 0) {
      throw new Error("Costo unitario inválido en detalle");
    }
  }

  // calcular total
  const total = compra.detalles.reduce(
    (sum, d) => sum + d.cantidad * d.costo_unitario,
    0
  );

  // crear cabecera
  const cabecera = await crearCompraDb({
    id_artesano: compra.id_artesano,
    total,
    id_metodo_pago: compra.id_metodo_pago,
    notas: compra.notas,
  });

  // agregar detalles y actualizar stock
  const detallesInsertados: any[] = [];
  for (const det of compra.detalles) {
    const linea = await crearDetalleCompraDb({
      id_compra: cabecera.id_compra,
      id_producto: det.id_producto,
      cantidad: det.cantidad,
      costo_unitario: det.costo_unitario,
    });
    detallesInsertados.push(linea);

    // incrementar stock
    await restaurarStockProductoDb(det.id_producto, det.cantidad);
  }

  return { ...cabecera, detalles: detallesInsertados };
}

/* ===============================
   Obtener compra con detalles
   =============================== */
export async function obtenerCompra(idCompra: number) {
  if (!idCompra) {
    throw new Error("ID de compra requerido");
  }
  return await obtenerCompraDb(idCompra);
}

/* ===============================
   Listar compras (opcional filtro por artesano)
   =============================== */
export async function listarCompras(filtros?: { id_artesano?: number }) {
  return await listarComprasDb(filtros);
}
