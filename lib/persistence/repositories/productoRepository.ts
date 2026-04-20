import { supabase } from "../../supabaseClient";

export type ConsultarCatalogoProductosDbParams = {
  busqueda?: string;
};

/* ===============================
   ADM07 - Control de stock (persistencia)
   =============================== */
export async function consultarStockDb(id_producto: number) {
  const { data, error } = await supabase
    .from("productos")
    .select("stock")
    .eq("id_producto", id_producto)
    .single();

  if (error) throw error;
  return data;
}

/* ===============================
   ADM02 - Dar de alta producto (persistencia)
   =============================== */
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

/* ===============================
   ADM04 - Actualizar producto (persistencia)
   =============================== */
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

/* ===============================
   ADM05 - Eliminar producto (lógico) (persistencia)
   =============================== */
export async function eliminarProductoDb(idProducto: number) {
  const { error } = await supabase
    .from("productos")
    .update({ estado: false })
    .eq("id_producto", idProducto);

  if (error) throw error;
  return true;
}

/* ===============================
   USD06 - Listar productos (persistencia)
   =============================== */
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

/* ===============================
   ADM03 - Consultar productos (persistencia)
   =============================== */
export async function consultarProductosDb() {
  const { data, error } = await supabase
    .from("productos")
    .select(
      `
      *,
      categorias(nombre),
      artesanos(id_artesano, nombre, apellido, tipo, comunidad)
    `
    )
    .order("id_producto", { ascending: true });

  if (error) throw error;
  return data;
}

/* ===============================
   USD20 - Catálogo filtrable (persistencia)
   =============================== */
export async function consultarCatalogoProductosDb(
  params: ConsultarCatalogoProductosDbParams = {}
) {
  const busqueda = params.busqueda?.trim();
  let query = supabase
    .from("productos")
    .select(
      `
      id_producto, nombre, descripcion, precio, imagen, stock, es_unico, es_destacado,
      fragilidad, descuento_pct, id_categoria, materiales, tecnica,
      categorias(nombre),
      artesanos(id_artesano, nombre, apellido, tipo, comunidad)
    `
    )
    .eq("estado", true)
    .gt("stock", 0)
    .order("nombre", { ascending: true });

  if (busqueda) {
    const termino = busqueda.toLocaleUpperCase();
    query = query.or(
      [
        `nombre.ilike.%${termino}%`,
        `descripcion.ilike.%${termino}%`,
        `tecnica.ilike.%${termino}%`,
        `materiales.ilike.%${termino}%`,
      ].join(",")
    );
  }

  const { data, error } = await query;

  if (error) throw error;
  return data;
}

/* ===============================
   Soporte - Categorías activas para catálogo
   =============================== */
export async function listarCategoriasActivasDb() {
  const { data, error } = await supabase
    .from("categorias")
    .select("id_categoria, nombre, descripcion, estado")
    .eq("estado", true)
    .order("nombre", { ascending: true });

  if (error) throw error;
  return data;
}

/* ===============================
   USD07 - Mostrar precio e imagen
   USD09 - Mostrar descripción, material y técnica
   USD21 - Información del artesano (en detalle)
   USD22 - Indicador de fragilidad
   USD25 - Etiqueta producto único
   =============================== */
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

/* ===============================
   USD08 - Galería de imágenes (persistencia)
   =============================== */
export async function obtenerImagenesProductoDb(idProducto: number) {
  const { data, error } = await supabase
    .from("imagenes_producto")
    .select("id_imagen, url, descripcion, orden")
    .eq("id_producto", idProducto)
    .order("orden", { ascending: true });

  if (error) throw error;
  return data;
}

/* ===============================
   USD20 - Filtro por tipo de artesanía (persistencia)
   =============================== */
export async function listarProductosPorTipoArtesanoDb(tipo: string) {
  const { data, error } = await supabase
    .from("productos")
    .select(
      `
      id_producto, nombre, descripcion, precio, imagen, es_unico, fragilidad, descuento_pct,
      artesanos!inner(id_artesano, nombre, apellido, tipo, comunidad)
    `
    )
    .eq("estado", true)
    .eq("artesanos.tipo", tipo);

  if (error) throw error;
  return data;
}

/* ===============================
   USD24 - Listar productos del artesano (persistencia)
   =============================== */
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

/* ===============================
   USD26 - Implementar productos destacados (persistencia)
   =============================== */
export async function listarProductosDestacadosDb() {
  const { data, error } = await supabase
    .from("productos")
    .select(
      `
      id_producto, nombre, descripcion, precio, imagen, es_unico, fragilidad, descuento_pct,
      artesanos(nombre, apellido, comunidad)
    `
    )
    .eq("estado", true)
    .eq("es_destacado", true)
    .gt("stock", 0);

  if (error) throw error;
  return data;
}

/* ===============================
   Compatibilidad - Consultar productos plano
   =============================== */
export const getAllProducts = async () => {
  const { data, error } = await supabase
    .from("productos")
    .select("*");

  if (error) throw error;

  return data;
};

/* ===============================
   ADM19 - Clasificar productos (persistencia)
   =============================== */
export const actualizarCategoria = async (
  id: string | number,
  categoria: string
) => {
  const idProducto = typeof id === "string" ? Number(id) : id;
  if (!Number.isFinite(idProducto) || idProducto <= 0) {
    throw new Error("ID de producto requerido");
  }

  const { data, error } = await supabase
    .from("productos")
    .update({ categoria })
    .eq("id_producto", idProducto);

  if (error) throw error;

  return data;
};

//CONTROL DE STOCK
export const getStockByProductId = async (id_producto: string) => {
  const { data, error } = await supabase
    .from("productos")
    .select("stock")
    .eq("id_producto", id_producto)
    .single();

  if (error) throw error;

  return data;
};
