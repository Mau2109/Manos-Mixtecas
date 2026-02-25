import { supabase } from "../supabaseClient";

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

  const { data, error } = await supabase
    .from("ventas")
    .insert({
      id_cliente: venta.id_cliente,
      total: venta.total,
      subtotal: venta.subtotal ?? venta.total,
      id_metodo_pago: venta.id_metodo_pago,
      descuento_pct: venta.descuento_pct ?? 0,
      datos_envio: venta.datos_envio,
      estado: "Pendiente",
      confirmacion_pedido: false,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

/* ===============================
   USD13 - Confirmar pedido
   =============================== */
export async function confirmarPedido(idVenta: number) {
  if (!idVenta) throw new Error("ID de venta requerido");

  const { data, error } = await supabase
    .from("ventas")
    .update({ confirmacion_pedido: true, estado: "Confirmado" })
    .eq("id_venta", idVenta)
    .select()
    .single();

  if (error) throw error;
  return data;
}

/* ===============================
   USD15 - Resumen de compra (obtener venta con detalles)
   =============================== */
export async function obtenerResumenVenta(idVenta: number) {
  if (!idVenta) throw new Error("ID de venta requerido");

  const { data, error } = await supabase
    .from("ventas")
    .select(`
      id_venta, total, subtotal, descuento_pct, estado,
      confirmacion_pedido, datos_envio, fecha_venta,
      metodos_pago(nombre),
      clientes(nombre, apellido, email),
      detalle_venta(
        id_detalle, cantidad, precio_unitario,
        productos(id_producto, nombre, imagen)
      )
    `)
    .eq("id_venta", idVenta)
    .single();

  if (error) throw error;
  return data;
}

/* ===============================
   USD18 - Confirmación de envío
   =============================== */
export async function obtenerEstadoEnvio(idVenta: number) {
  if (!idVenta) throw new Error("ID de venta requerido");

  const { data, error } = await supabase
    .from("ventas")
    .select("id_venta, estado, confirmacion_envio, fecha_envio, datos_envio")
    .eq("id_venta", idVenta)
    .single();

  if (error) throw error;
  return data;
}