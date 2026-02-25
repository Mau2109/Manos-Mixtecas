import { supabase } from "../supabaseClient";

/* ===============================
   EXTRA01 - Consultar stock de un producto
   =============================== */
export async function consultarStock(id_producto: number) {
  const { data, error } = await supabase
    .from("productos")
    .select("stock")
    .eq("id_producto", id_producto)
    .single();

  if (error) throw error;
  return data.stock;
}

/* ===============================
   ADM02 - Registrar producto
   =============================== */
export async function crearProducto(producto: {
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
  if (!producto.nombre || producto.precio == null || producto.stock == null) {
    throw new Error("Datos obligatorios del producto");
  }

  const { data, error } = await supabase
    .from("productos")
    .insert(producto)
    .select()
    .single();

  if (error) throw error;
  return data;
}

/* ===============================
   ADM03 - Actualizar producto
   =============================== */
export async function actualizarProducto(
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
  if (!idProducto) {
    throw new Error("ID de producto requerido");
  }

  const { data, error } = await supabase
    .from("productos")
    .update(producto)
    .eq("id_producto", idProducto)
    .select()
    .single();

  if (error) throw error;
  return data;
}

/* ===============================
   ADM04 - Eliminar producto (lógico)
   =============================== */
export async function eliminarProducto(idProducto: number) {
  if (!idProducto) {
    throw new Error("ID de producto requerido");
  }

  const { error } = await supabase
    .from("productos")
    .update({ estado: false })
    .eq("id_producto", idProducto);

  if (error) throw error;
  return true;
}

/* ===============================
   USD03 - Listar productos disponibles
   =============================== */
export async function listarProductos() {
  const { data, error } = await supabase
    .from("productos")
    .select(`
      id_producto, nombre, precio, imagen, stock, es_unico, es_destacado, fragilidad, descuento_pct,
      categorias(nombre),
      artesanos(id_artesano, nombre, apellido, tipo, comunidad)
    `)
    .eq("estado", true)
    .gt("stock", 0);

  if (error) throw error;
  return data;
}

/* ===============================
   USD04 - Mostrar precio e imagen del producto
   USD06 - Mostrar descripción, materiales y técnica
   USD23 - Indicador de fragilidad
   USD26 - Etiqueta producto único
   =============================== */
export async function obtenerProductoDetalle(idProducto: number) {
  if (!idProducto) throw new Error("ID de producto requerido");

  const { data, error } = await supabase
    .from("productos")
    .select(`
      *,
      categorias(nombre),
      artesanos(id_artesano, nombre, apellido, tipo, comunidad, historia, ubicacion, foto_perfil)
    `)
    .eq("id_producto", idProducto)
    .eq("estado", true)
    .single();

  if (error) throw error;
  return data;
}

/* ===============================
   USD05 - Galería de imágenes del producto
   =============================== */
export async function obtenerImagenesProducto(idProducto: number) {
  if (!idProducto) throw new Error("ID de producto requerido");

  const { data, error } = await supabase
    .from("imagenes_producto")
    .select("id_imagen, url, descripcion, orden")
    .eq("id_producto", idProducto)
    .order("orden", { ascending: true });

  if (error) throw error;
  return data;
}

/* ===============================
   USD21 - Filtro por tipo de artesano
   =============================== */
export async function listarProductosPorTipoArtesano(tipo: string) {
  if (!tipo) throw new Error("Tipo de artesano requerido");

  const { data, error } = await supabase
    .from("productos")
    .select(`
      id_producto, nombre, precio, imagen, es_unico, fragilidad, descuento_pct,
      artesanos!inner(id_artesano, nombre, apellido, tipo, comunidad)
    `)
    .eq("estado", true)
    .eq("artesanos.tipo", tipo);

  if (error) throw error;
  return data;
}

/* ===============================
   USD25 - Listar productos de un artesano específico
   =============================== */
export async function listarProductosPorArtesano(idArtesano: number) {
  if (!idArtesano) throw new Error("ID de artesano requerido");

  const { data, error } = await supabase
    .from("productos")
    .select("id_producto, nombre, precio, imagen, stock, es_unico, fragilidad, descuento_pct")
    .eq("id_artesano", idArtesano)
    .eq("estado", true);

  if (error) throw error;
  return data;
}

/* ===============================
   USD27 - Productos destacados para página principal
   =============================== */
export async function listarProductosDestacados() {
  const { data, error } = await supabase
    .from("productos")
    .select(`
      id_producto, nombre, precio, imagen, es_unico, fragilidad, descuento_pct,
      artesanos(nombre, apellido, comunidad)
    `)
    .eq("estado", true)
    .eq("es_destacado", true)
    .gt("stock", 0);

  if (error) throw error;
  return data;
}