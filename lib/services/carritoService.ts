import { supabase } from "../supabaseClient";

/* ===============================
   USD01 - Visualizar productos del carrito
   =============================== */
export async function obtenerCarrito(idCarrito: number) {
  if (!idCarrito) throw new Error("ID de carrito requerido");

  const { data, error } = await supabase
    .from("detalle_carrito")
    .select(`
      id_detalle, cantidad, precio_unitario,
      productos(id_producto, nombre, imagen, stock, fragilidad, es_unico)
    `)
    .eq("id_carrito", idCarrito);

  if (error) throw error;
  return data;
}

/* ===============================
   USD02 - Cálculo total del carrito
   =============================== */
export async function calcularTotalCarrito(idCarrito: number): Promise<number> {
  const items = await obtenerCarrito(idCarrito);
  if (!items || items.length === 0) return 0;

  const total = items.reduce((sum, item) => {
    return sum + item.cantidad * Number(item.precio_unitario);
  }, 0);

  return Math.round(total * 100) / 100;
}

/* ===============================
   USD02 (original) - Agregar producto al carrito
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
   USD01 - Eliminar producto del carrito
   =============================== */
export async function eliminarProductoCarrito(idDetalle: number) {
  if (!idDetalle) throw new Error("ID de detalle requerido");

  const { error } = await supabase
    .from("detalle_carrito")
    .delete()
    .eq("id_detalle", idDetalle);

  if (error) throw new Error(error.message);
  return true;
}

/* ===============================
   USD12 - Selección de método de pago
   =============================== */
export async function listarMetodosPago() {
  const { data, error } = await supabase
    .from("metodos_pago")
    .select("id_metodo_pago, nombre, descripcion")
    .eq("estado", true);

  if (error) throw error;
  return data;
}