import { supabase } from "../../supabaseClient";

export async function obtenerCarritoDb(idCarrito: number) {
  const { data, error } = await supabase
    .from("detalle_carrito")
    .select(
      `
      id_detalle, cantidad, precio_unitario,
      productos(id_producto, nombre, imagen, stock, fragilidad, es_unico)
    `
    )
    .eq("id_carrito", idCarrito);

  if (error) throw error;
  return data;
}

export async function agregarProductoCarritoDb(
  id_carrito: number,
  id_producto: number,
  cantidad: number,
  precio: number
) {
  const { error } = await supabase.from("detalle_carrito").insert({
    id_carrito,
    id_producto,
    cantidad,
    precio_unitario: precio,
  });

  if (error) throw error;
  return true;
}

export async function eliminarProductoCarritoDb(idDetalle: number) {
  const { error } = await supabase
    .from("detalle_carrito")
    .delete()
    .eq("id_detalle", idDetalle);

  if (error) throw new Error(error.message);
  return true;
}

export async function listarMetodosPagoDb() {
  const { data, error } = await supabase
    .from("metodos_pago")
    .select("id_metodo_pago, nombre, descripcion")
    .eq("estado", true);

  if (error) throw error;
  return data;
}
