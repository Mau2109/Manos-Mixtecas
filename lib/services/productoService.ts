import {
  actualizarProductoDb,
  consultarStockDb,
  crearProductoDb,
  eliminarProductoDb,
  listarProductosDb,
  listarProductosDestacadosDb,
  listarProductosPorArtesanoDb,
  listarProductosPorTipoArtesanoDb,
  obtenerImagenesProductoDb,
  obtenerProductoDetalleDb,
} from "../persistence/repositories/productoRepository";

/* ===============================
   EXTRA01 - Consultar stock de un producto
   =============================== */
export async function consultarStock(id_producto: number) {
  const data = await consultarStockDb(id_producto);
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
  return crearProductoDb(producto);
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
  return actualizarProductoDb(idProducto, producto);
}

/* ===============================
   ADM04 - Eliminar producto (lógico)
   =============================== */
export async function eliminarProducto(idProducto: number) {
  if (!idProducto) {
    throw new Error("ID de producto requerido");
  }
  return eliminarProductoDb(idProducto);
}

/* ===============================
   USD03 - Listar productos disponibles
   =============================== */
export async function listarProductos() {
  return listarProductosDb();
}

/* ===============================
   USD04 - Mostrar precio e imagen del producto
   USD06 - Mostrar descripción, materiales y técnica
   USD23 - Indicador de fragilidad
   USD26 - Etiqueta producto único
   =============================== */
export async function obtenerProductoDetalle(idProducto: number) {
  if (!idProducto) throw new Error("ID de producto requerido");
  return obtenerProductoDetalleDb(idProducto);
}

/* ===============================
   USD05 - Galería de imágenes del producto
   =============================== */
export async function obtenerImagenesProducto(idProducto: number) {
  if (!idProducto) throw new Error("ID de producto requerido");
  return obtenerImagenesProductoDb(idProducto);
}

/* ===============================
   USD21 - Filtro por tipo de artesano
   =============================== */
export async function listarProductosPorTipoArtesano(tipo: string) {
  if (!tipo) throw new Error("Tipo de artesano requerido");
  return listarProductosPorTipoArtesanoDb(tipo);
}

/* ===============================
   USD25 - Listar productos de un artesano específico
   =============================== */
export async function listarProductosPorArtesano(idArtesano: number) {
  if (!idArtesano) throw new Error("ID de artesano requerido");
  return listarProductosPorArtesanoDb(idArtesano);
}

/* ===============================
   USD27 - Productos destacados para página principal
   =============================== */
export async function listarProductosDestacados() {
  return listarProductosDestacadosDb();
}
