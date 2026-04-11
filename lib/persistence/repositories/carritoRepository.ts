import { supabase } from "../../supabaseClient";
import { listarMetodosPagoDb as listarMetodosPagoDbBase } from "./metodoPagoRepository";

export async function obtenerOCrearCarritoActivoDb(idCliente: number) {
  const { data: carritoExistente, error: searchError } = await supabase
    .from("carritos")
    .select("id_carrito, id_cliente, estado, fecha_creacion")
    .eq("id_cliente", idCliente)
    .eq("estado", "activo")
    .order("fecha_creacion", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (searchError) throw searchError;
  if (carritoExistente) return carritoExistente;

  const { data, error } = await supabase
    .from("carritos")
    .insert({
      id_cliente: idCliente,
      estado: "activo",
    })
    .select("id_carrito, id_cliente, estado, fecha_creacion")
    .single();

  if (error) throw error;
  return data;
}

export async function obtenerDetalleCarritoPorProductoDb(
  idCarrito: number,
  idProducto: number
) {
  const { data, error } = await supabase
    .from("detalle_carrito")
    .select("id_detalle, id_carrito, id_producto, cantidad, precio_unitario")
    .eq("id_carrito", idCarrito)
    .eq("id_producto", idProducto)
    .limit(1)
    .maybeSingle();

  if (error) throw error;
  return data;
}

/* ===============================
   USD04 - Visualizar producto del carrito (persistencia)
   USD05 - Cálculo total de compras (datos base)
   =============================== */
export async function obtenerCarritoDb(idCarrito: number) {
  const { data, error } = await supabase
    .from("detalle_carrito")
    .select(
      `
      id_detalle, cantidad, precio_unitario,
      productos(id_producto, nombre, imagen, stock, fragilidad, es_unico)
    `
    )
    .eq("id_carrito", idCarrito)
    .order("id_detalle", { ascending: true });

  if (error) throw error;
  return data;
}

/* ===============================
   USD02 - Agregar producto al carrito (persistencia)
   =============================== */
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

export async function actualizarCantidadProductoCarritoDb(
  idDetalle: number,
  cantidad: number
) {
  const { data, error } = await supabase
    .from("detalle_carrito")
    .update({ cantidad })
    .eq("id_detalle", idDetalle)
    .select("id_detalle, id_carrito, id_producto, cantidad, precio_unitario")
    .single();

  if (error) throw error;
  return data;
}

/* ===============================
   USD03 - Eliminar producto del carrito (persistencia)
   =============================== */
export async function eliminarProductoCarritoDb(idDetalle: number) {
  const { error } = await supabase
    .from("detalle_carrito")
    .delete()
    .eq("id_detalle", idDetalle);

  if (error) throw new Error(error.message);
  return true;
}

export async function vaciarCarritoDb(idCarrito: number) {
  const { error } = await supabase
    .from("detalle_carrito")
    .delete()
    .eq("id_carrito", idCarrito);

  if (error) throw new Error(error.message);
  return true;
}

/* ===============================
   USD12 - Selección método de pago (listar activos - persistencia)
   =============================== */
export async function listarMetodosPagoDb() {
  const data = await listarMetodosPagoDbBase();
  return (data ?? []).map((m: any) => ({
    id_metodo_pago: m.id_metodo_pago,
    nombre: m.nombre,
    descripcion: m.descripcion ?? null,
  }));
}
