import {
  confirmarPedidoDb,
  crearVentaDb,
  obtenerEstadoEnvioDb,
  obtenerResumenVentaDb,
} from "../persistence/repositories/ventaRepository";

/* ===============================
   USD14 - Formulario de datos de envío
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
  if (!venta.total || venta.total <= 0) throw new Error("Total inválido");
  if (!venta.id_metodo_pago) throw new Error("Método de pago requerido");
  if (
    !venta.datos_envio?.nombre ||
    !venta.datos_envio?.direccion ||
    !venta.datos_envio?.telefono
  ) {
    throw new Error("Datos de envío incompletos");
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
   USD15 - Resumen de compra (obtener venta con detalles)
   =============================== */
export async function obtenerResumenVenta(idVenta: number) {
  if (!idVenta) throw new Error("ID de venta requerido");
  return obtenerResumenVentaDb(idVenta);
}

/* ===============================
   USD18 - Confirmación de envío
   =============================== */
export async function obtenerEstadoEnvio(idVenta: number) {
  if (!idVenta) throw new Error("ID de venta requerido");
  return obtenerEstadoEnvioDb(idVenta);
}
