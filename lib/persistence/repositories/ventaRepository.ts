import { supabase } from "../../supabaseClient";

/* ===============================
   USD14 - Formulario de datos de envío (persistencia: datos_envio)
   USD13 - Confirmación de pedido (persistencia: venta)
   ADM14 - Registrar venta (persistencia)
   =============================== */
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


/* ===============================
   ADM29 - Generar reporte de ventas (persistencia)
   =============================== */
   /* ===============================
   Repository - Generar reporte de ventas
   ADM29
   =============================== */
  export async function generarReporteVentasDb(filtros?: {
    fechaInicio?: string;
    fechaFin?: string;
  }) {

    let query = supabase
      .from("ventas")
      .select(`
        id_venta,
        fecha_venta,
        total,
        detalle_venta(
          cantidad,
          precio_unitario,
          productos(nombre)
        )
      `)
      .order("fecha_venta", { ascending: false });

    if (filtros?.fechaInicio) {
      query = query.gte("fecha_venta", filtros.fechaInicio);
    }

    if (filtros?.fechaFin) {
      query = query.lte("fecha_venta", filtros.fechaFin);
    }

    const { data, error } = await query;

    if (error) throw error;

    const ventas = data ?? [];

    const totalIngresos = ventas.reduce(
      (acc, v) => acc + Number(v.total),
      0
    );

    return {
      ventas,
      resumen: {
        totalIngresos,
        cantidad: ventas.length
      }
    };
  }


// export async function generarReporteVentasDb(filtros?: {
//   fechaInicio?: string;
//   fechaFin?: string;
// }) {
//   let query = supabase
//     .from("ventas")
//     .select("id_venta, total, fecha_venta")
//     .order("fecha_venta", { ascending: false });

//   if (filtros?.fechaInicio) {
//     query = query.gte("fecha_venta", filtros.fechaInicio);
//   }
//   if (filtros?.fechaFin) {
//     query = query.lte("fecha_venta", filtros.fechaFin);
//   }

//   const { data, error } = await query;
//   if (error) throw error;

//   const ventas = data ?? [];
//   const totalIngresos = ventas.reduce((acc, v) => acc + Number(v.total), 0);
//   return {
//     ventas,
//     resumen: {
//       totalIngresos,
//       cantidad: ventas.length,
//     },
//   };
// }

/* ===============================
   ADM30 - Reporte de productos "Top Sellers" (persistencia)
   =============================== */
export async function obtenerTopProductosDb() {
  // sumar cantidades por producto y ordenar descendente
  // the Postgrest types don't currently expose `group`, so cast the query
  // builder to `any` before invoking it. this suppresses the TS error while
  // still allowing the method to run at runtime.
  const query: any = supabase.from("detalle_venta");
  const { data, error } = await query
    .select(`id_producto, sum(cantidad) as total_vendido, productos(nombre)`) // select aggregate
    .group("id_producto, productos(nombre)")
    .order("total_vendido", { ascending: false })
    .limit(5);

  if (error) throw error;
  // data may be an array of records with number strings; convert
  return (data || []).map((r: any) => ({
    id_producto: r.id_producto,
    nombre: r.productos?.nombre,
    total_vendido: Number(r.total_vendido),
  }));
}

/* ===============================
   USD13 - Confirmar pedido (persistencia)
   =============================== */
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

/* ===============================
   UCD15 - Resumen de compra (persistencia)
   =============================== */
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

/* ===============================
   ADM25 - Estado/confirmación de envío (persistencia)
   =============================== */
export async function obtenerEstadoEnvioDb(idVenta: number) {
  const { data, error } = await supabase
    .from("ventas")
    .select("id_venta, estado, confirmacion_envio, fecha_envio, datos_envio")
    .eq("id_venta", idVenta)
    .single();

  if (error) throw error;
  return data;
}

/* ===============================
   ADM14 - Registrar venta (detalle_venta) (persistencia)
   =============================== */
export async function agregarProductoVentaDb(detalleVenta: {
  id_venta: number;
  id_producto: number;
  cantidad: number;
  precio_unitario: number;
}) {
  const { data, error } = await supabase
    .from("detalle_venta")
    .insert({
      id_venta: detalleVenta.id_venta,
      id_producto: detalleVenta.id_producto,
      cantidad: detalleVenta.cantidad,
      precio_unitario: detalleVenta.precio_unitario,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

/* ===============================
   ADM15 - Consultar ventas (dashboard) (persistencia)
   ADM25 - Filtrar ventas (persistencia)
   =============================== */
export async function listarVentasDb(filtros?: {
  estado?: string;
  fechaInicio?: string;
  fechaFin?: string;
}) {
  let query = supabase
    .from("ventas")
    .select(
      `
      id_venta, total, estado, fecha_venta,
      clientes(nombre, apellido, email)
    `
    )
    .order("fecha_venta", { ascending: false });

  if (filtros?.estado) {
    query = query.eq("estado", filtros.estado);
  }

  if (filtros?.fechaInicio) {
    query = query.gte("fecha_venta", filtros.fechaInicio);
  }

  if (filtros?.fechaFin) {
    query = query.lte("fecha_venta", filtros.fechaFin);
  }

  const { data, error } = await query;

  if (error) throw error;
  return data;
}

export async function listarVentasClienteDb(idCliente: number) {
  const { data, error } = await supabase
    .from("ventas")
    .select(
      `
      id_venta, total, subtotal, estado, fecha_venta, confirmacion_pedido,
      id_metodo_pago, datos_envio,
      metodos_pago(nombre),
      detalle_venta(
        id_detalle, cantidad, precio_unitario,
        productos(id_producto, nombre, imagen)
      )
    `
    )
    .eq("id_cliente", idCliente)
    .order("fecha_venta", { ascending: false });

  if (error) throw error;
  return data;
}

/* ===============================
   USD13 - Confirmar pedido (alias) (persistencia)
   =============================== */
export async function confirmarVentaDb(idVenta: number) {
  return confirmarPedidoDb(idVenta);
}

/* ===============================
   ADM25 - Filtrar/gestionar logística (cancelación) (persistencia)
   =============================== */
export async function cancelarVentaDb(idVenta: number) {
  const { data, error } = await supabase
    .from("ventas")
    .update({ estado: "Cancelado" })
    .eq("id_venta", idVenta)
    .select()
    .single();

  if (error) throw error;
  return data;
}

/* ===============================
   ADM14 - Registrar venta (consulta detalle) (persistencia)
   =============================== */
export async function obtenerProductosVentaDb(idVenta: number) {
  const { data, error } = await supabase
    .from("detalle_venta")
    .select("id_detalle, id_producto, cantidad, precio_unitario")
    .eq("id_venta", idVenta);

  if (error) throw error;
  return data;
}

/* ===============================
   ADM07 - Control de stock (decrementar) (persistencia)
   =============================== */
export async function actualizarStockProductoDb(
  idProducto: number,
  cantidad: number
) {
  const { data: productoActual } = await supabase
    .from("productos")
    .select("stock")
    .eq("id_producto", idProducto)
    .single();

  if (!productoActual) throw new Error("Producto no encontrado");

  const nuevoStock = Math.max(0, (productoActual.stock || 0) - cantidad);

  const { data, error } = await supabase
    .from("productos")
    .update({ stock: nuevoStock })
    .eq("id_producto", idProducto)
    .select()
    .single();

  if (error) throw error;
  return data;
}

/* ===============================
   ADM07 - Control de stock (restaurar/incrementar) (persistencia)
   =============================== */
export async function restaurarStockProductoDb(
  idProducto: number,
  cantidad: number
) {
  const { data: productoActual } = await supabase
    .from("productos")
    .select("stock")
    .eq("id_producto", idProducto)
    .single();

  if (!productoActual) throw new Error("Producto no encontrado");

  const nuevoStock = (productoActual.stock || 0) + cantidad;

  const { data, error } = await supabase
    .from("productos")
    .update({ stock: nuevoStock })
    .eq("id_producto", idProducto)
    .select()
    .single();

  if (error) throw error;
  return data;
}
