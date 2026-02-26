import { supabase } from "../../supabaseClient";

export async function consultarStockDb(id_producto: number) {
  const { data, error } = await supabase
    .from("productos")
    .select("stock")
    .eq("id_producto", id_producto)
    .single();

  if (error) throw error;
  return data;
}

export async function crearProductoDb(producto: {
  nombre: string;
  descripcion?: string;
  precio: number;
  stock: number;
  imagen?: string;
  id_categoria: number;
  materiales?: string;
  tecnica?: string;
  es_unico?: boolean;
  es_destacado?: boolean;
  fragilidad?: string;
  id_artesano?: number;
  descuento_pct?: number;
}) {
  const { data, error } = await supabase
    .from("productos")
    .insert(producto)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function actualizarProductoDb(
  idProducto: number,
  producto: {
    nombre?: string;
    descripcion?: string;
    precio?: number;
    stock?: number;
    imagen?: string;
    id_categoria?: number;
    estado?: boolean;
    materiales?: string;
    tecnica?: string;
    es_unico?: boolean;
    es_destacado?: boolean;
    fragilidad?: string;
    descuento_pct?: number;
  }
) {
  const { data, error } = await supabase
    .from("productos")
    .update(producto)
    .eq("id_producto", idProducto)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function eliminarProductoDb(idProducto: number) {
  const { error } = await supabase
    .from("productos")
    .update({ estado: false })
    .eq("id_producto", idProducto);

  if (error) throw error;
  return true;
}

export async function listarProductosDb() {
  const { data, error } = await supabase
    .from("productos")
    .select(
      `
      id_producto, nombre, precio, imagen, stock, es_unico, es_destacado, fragilidad, descuento_pct,
      categorias(nombre),
      artesanos(id_artesano, nombre, apellido, tipo, comunidad)
    `
    )
    .eq("estado", true)
    .gt("stock", 0);

  if (error) throw error;
  return data;
}

export async function obtenerProductoDetalleDb(idProducto: number) {
  const { data, error } = await supabase
    .from("productos")
    .select(
      `
      *,
      categorias(nombre),
      artesanos(id_artesano, nombre, apellido, tipo, comunidad, historia, ubicacion, foto_perfil)
    `
    )
    .eq("id_producto", idProducto)
    .eq("estado", true)
    .single();

  if (error) throw error;
  return data;
}

export async function obtenerImagenesProductoDb(idProducto: number) {
  const { data, error } = await supabase
    .from("imagenes_producto")
    .select("id_imagen, url, descripcion, orden")
    .eq("id_producto", idProducto)
    .order("orden", { ascending: true });

  if (error) throw error;
  return data;
}

export async function listarProductosPorTipoArtesanoDb(tipo: string) {
  const { data, error } = await supabase
    .from("productos")
    .select(
      `
      id_producto, nombre, precio, imagen, es_unico, fragilidad, descuento_pct,
      artesanos!inner(id_artesano, nombre, apellido, tipo, comunidad)
    `
    )
    .eq("estado", true)
    .eq("artesanos.tipo", tipo);

  if (error) throw error;
  return data;
}

export async function listarProductosPorArtesanoDb(idArtesano: number) {
  const { data, error } = await supabase
    .from("productos")
    .select(
      "id_producto, nombre, precio, imagen, stock, es_unico, fragilidad, descuento_pct"
    )
    .eq("id_artesano", idArtesano)
    .eq("estado", true);

  if (error) throw error;
  return data;
}

export async function listarProductosDestacadosDb() {
  const { data, error } = await supabase
    .from("productos")
    .select(
      `
      id_producto, nombre, precio, imagen, es_unico, fragilidad, descuento_pct,
      artesanos(nombre, apellido, comunidad)
    `
    )
    .eq("estado", true)
    .eq("es_destacado", true)
    .gt("stock", 0);

  if (error) throw error;
  return data;
}
