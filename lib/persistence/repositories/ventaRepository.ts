import { supabase } from "../../supabaseClient";

export async function crearVentaDb(venta: {
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

export async function confirmarPedidoDb(idVenta: number) {
  const { data, error } = await supabase
    .from("ventas")
    .update({ confirmacion_pedido: true, estado: "Confirmado" })
    .eq("id_venta", idVenta)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function obtenerResumenVentaDb(idVenta: number) {
  const { data, error } = await supabase
    .from("ventas")
    .select(
      `
      id_venta, total, subtotal, descuento_pct, estado,
      confirmacion_pedido, datos_envio, fecha_venta,
      metodos_pago(nombre),
      clientes(nombre, apellido, email),
      detalle_venta(
        id_detalle, cantidad, precio_unitario,
        productos(id_producto, nombre, imagen)
      )
    `
    )
    .eq("id_venta", idVenta)
    .single();

  if (error) throw error;
  return data;
}

export async function obtenerEstadoEnvioDb(idVenta: number) {
  const { data, error } = await supabase
    .from("ventas")
    .select("id_venta, estado, confirmacion_envio, fecha_envio, datos_envio")
    .eq("id_venta", idVenta)
    .single();

  if (error) throw error;
  return data;
}
