import { supabase } from "../../supabaseClient";

/* ===============================
   ADM12 - Registrar compra (cabecera) (persistencia)
   ADM13 - Registrar método de pago en compra (id_metodo_pago)
   =============================== */
export async function crearCompraDb(compra: {
  id_artesano: number;
  total: number;
  id_metodo_pago?: number;
  notas?: string;
}) {
  const { data, error } = await supabase
    .from("compras")
    .insert({
      id_artesano: compra.id_artesano,
      total: compra.total,
      id_metodo_pago: compra.id_metodo_pago ?? null,
      notas: compra.notas ?? null,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

/* ===============================
   ADM12 - Registrar compra (detalle) (persistencia)
   =============================== */
export async function crearDetalleCompraDb(detalle: {
  id_compra: number;
  id_producto: number;
  cantidad: number;
  costo_unitario: number;
}) {
  const { data, error } = await supabase
    .from("detalle_compra")
    .insert({
      id_compra: detalle.id_compra,
      id_producto: detalle.id_producto,
      cantidad: detalle.cantidad,
      costo_unitario: detalle.costo_unitario,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

/* ===============================
   ADM12 - Consultar compra con detalles (persistencia)
   =============================== */
export async function obtenerCompraDb(idCompra: number) {
  const { data, error } = await supabase
    .from("compras")
    .select(
      `
      id_compra, id_artesano, total, fecha_compra, notas,
      detalle_compra(
        id_detalle, id_producto, cantidad, costo_unitario
      )
    `
    )
    .eq("id_compra", idCompra)
    .single();

  if (error) throw error;
  return data;
}

/* ===============================
   ADM12 - Consultar historial de compras (persistencia)
   =============================== */
export async function listarComprasDb(filtros?: { id_artesano?: number }) {
  let query = supabase
    .from("compras")
    .select("id_compra, id_artesano, total, fecha_compra, notas")
    .order("fecha_compra", { ascending: false });

  if (filtros?.id_artesano) {
    query = query.eq("id_artesano", filtros.id_artesano);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data;
}
