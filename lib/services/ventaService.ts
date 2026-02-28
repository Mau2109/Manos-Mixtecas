import {
  confirmarPedidoDb,
  crearVentaDb,
  obtenerEstadoEnvioDb,
  obtenerResumenVentaDb,
  agregarProductoVentaDb,
  listarVentasDb,
  cancelarVentaDb,
  obtenerProductosVentaDb,
  actualizarStockProductoDb,
  restaurarStockProductoDb,
  generarReporteVentasDb,
  obtenerTopProductosDb,
} from "../persistence/repositories/ventaRepository";

/* ===============================
   USD14 - Formulario de datos de envio
   USD13 - Crear venta (confirmar pedido)
   =============================== */
export async function crearVenta(venta: {
  id_cliente: number;
  total: number;
  subtotal?: number;
  id_metodo_pago: number;
  descuento_pct?: number;
  datos_envio: {
    nombre: string;
    apellido: string;
    direccion: string;
    ciudad: string;
    estado?: string;
    codigo_postal?: string;
    telefono: string;
  };
}) {
  if (!venta.id_cliente) throw new Error("ID de cliente requerido");
  if (!venta.total || venta.total <= 0) throw new Error("Total invalido");
  if (!venta.id_metodo_pago) throw new Error("Metodo de pago requerido");
  if (
    !venta.datos_envio?.nombre ||
    !venta.datos_envio?.direccion ||
    !venta.datos_envio?.telefono
  ) {
    throw new Error("Datos de envio incompletos");
  }
  return crearVentaDb(venta);
}

/* ===============================
   USD13 - Confirmar pedido
   =============================== */
export async function confirmarPedido(idVenta: number) {
  if (!idVenta) throw new Error("ID de venta requerido");
  return confirmarPedidoDb(idVenta);
}

/* ===============================
   Agregar producto a venta
   =============================== */
export async function agregarProductoVenta(detalleVenta: {
  id_venta: number;
  id_producto: number;
  cantidad: number;
  precio_unitario: number;
}) {
  if (!detalleVenta.id_venta) throw new Error("ID de venta requerido");
  if (!detalleVenta.id_producto) throw new Error("ID de producto requerido");
  if (detalleVenta.cantidad <= 0) throw new Error("Cantidad debe ser mayor a 0");
  if (detalleVenta.precio_unitario <= 0)
    throw new Error("Precio unitario debe ser mayor a 0");

  return await agregarProductoVentaDb(detalleVenta);
}

/* ===============================
   ADM08 - ADM13 - Listar ventas con filtros (estado, fecha)
   =============================== */
export async function listarVentas(filtros?: {
  estado?: string;
  fechaInicio?: string;
  fechaFin?: string;
}) {
  return await listarVentasDb(filtros);
}

/* ===============================
   ADM17 - Generar reporte de ventas
   =============================== */
export async function generarReporteVentas(filtros?: {
  fechaInicio?: string;
  fechaFin?: string;
}) {
  return await generarReporteVentasDb(filtros);
}

/* ===============================
   ADM18 - Generar top productos vendidos
   =============================== */
export async function obtenerTopProductos() {
  return await obtenerTopProductosDb();
}

/* ===============================
   ADM20 - Generar ticket de venta en PDF
   Retorna un Buffer con el contenido del PDF (empleado por el admin).
   Actualmente el PDF es un texto simple que incluye algunos datos de la
   venta; en un entorno real se podria usar pdfkit/u otro generador.
   =============================== */
export async function generarTicketVenta(idVenta: number) {
  if (!idVenta) throw new Error("ID de venta requerido");

  // Obtener informacion de la venta.
  const resumen = await obtenerResumenVentaDb(idVenta);

  // Construir contenido PDF basico.
  const lines = [];
  lines.push("%PDF-1.4");
  lines.push(`Venta #${idVenta}`);
  if (resumen) {
    if (resumen.total != null) {
      lines.push(`Total: ${resumen.total}`);
    }
    if (resumen.clientes) {
      // Supabase can return related rows as array or object.
      const cliente = Array.isArray(resumen.clientes)
        ? resumen.clientes[0]
        : resumen.clientes;
      if (cliente) {
        lines.push(`Cliente: ${cliente.nombre || ""} ${cliente.apellido || ""}`);
      }
    }
  }
  const content = lines.join("\n");
  return Buffer.from(content, "utf-8");
}

/* ===============================
   ADM07 - Confirmar pedido y actualizar stock
   =============================== */
export async function confirmarYActualizarStock(idVenta: number) {
  if (!idVenta) throw new Error("ID de venta requerido");

  // Obtener productos de la venta.
  const productos = await obtenerProductosVentaDb(idVenta);

  if (!productos || productos.length === 0) {
    throw new Error("La venta no tiene productos para confirmar");
  }

  // Actualizar stock para cada producto.
  for (const producto of productos) {
    await actualizarStockProductoDb(producto.id_producto, producto.cantidad);
  }

  // Confirmar la venta.
  return await confirmarPedidoDb(idVenta);
}

/* ===============================
   USD15 (UCD15) - Resumen de compra
   =============================== */
export async function obtenerResumenCompra(idVenta: number) {
  if (!idVenta) throw new Error("ID de venta requerido");
  return obtenerResumenVentaDb(idVenta);
}

// Alias para mantener compatibilidad con codigo existente.
export async function obtenerResumenVenta(idVenta: number) {
  return obtenerResumenCompra(idVenta);
}

/* ===============================
   USD17 - Mensaje de confirmacion de envio
   =============================== */
export async function obtenerEstadoEnvio(idVenta: number) {
  if (!idVenta) throw new Error("ID de venta requerido");
  return obtenerEstadoEnvioDb(idVenta);
}



/* ===============================
   USD18 - Aplicar descuetos
   =============================== */

export const aplicarDescuento = (
  total: number,
  porcentaje: number
) => {
  if (porcentaje <= 0) {
    throw new Error("El descuento debe ser un valor positivo");
  }

  const descuento = total * (porcentaje / 100);
  const totalFinal = total - descuento;

  return totalFinal;
};
