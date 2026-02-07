import { supabase } from "../supabaseClient";

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

  const { error } = await supabase.from("detalle_carrito").insert({
    id_carrito,
    id_producto,
    cantidad,
    precio_unitario: precio,
  });

  if (error) throw error;
  return true;
}

/* ===============================
   USD03 - Eliminar producto del carrito
   =============================== */
export async function eliminarProductoCarrito(idCarrito: number, idProducto: number) {
  const { error } = await supabase
    .from("carrito")
    .delete()
    .eq("id_carrito", idCarrito)
    .eq("id_producto", idProducto);

  if (error) throw new Error(error.message);
  return true;
}