import { supabase } from "../supabaseClient";

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
