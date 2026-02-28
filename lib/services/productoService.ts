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
  getAllProducts, 
  actualizarCategoria,
} from "../persistence/repositories/productoRepository";
export const runtime = "nodejs";

import PDFDocument from "pdfkit";

/* ===============================
   EXTRA01 - Consultar stock
   =============================== */
export async function consultarStock(idProducto: number) {
  if (!idProducto) {
    throw new Error("ID de producto requerido");
  }
  const data = await consultarStockDb(idProducto);
  return data?.stock ?? 0;
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
   ADM04 - Actualizar producto
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
   ADM05 - Eliminar producto 
   =============================== */
export async function eliminarProducto(idProducto: number) {
  if (!idProducto) {
    throw new Error("ID de producto requerido");
  }
  return eliminarProductoDb(idProducto);
}

/* ===============================
   USD06 - Listar productos
   =============================== */
export async function listarProductos() {
  return listarProductosDb();
}

/* ===============================
   USD07 - Mostrar precio e imagen del producto
   USD09 - Mostrar descripción, materiales y técnica
   USD22 - Indicador de fragilidad
   USD25 - Etiqueta producto único
   =============================== */
export async function obtenerProductoDetalle(idProducto: number) {
  if (!idProducto) throw new Error("ID de producto requerido");
  return obtenerProductoDetalleDb(idProducto);
}

/* ===============================
   USD08 - Galería de imágenes
   =============================== */
export async function obtenerImagenesProducto(idProducto: number) {
  if (!idProducto) throw new Error("ID de producto requerido");
  return obtenerImagenesProductoDb(idProducto);
}

/* ===============================
   USD20 - Filtro por tipo de artesano
   =============================== */
export async function listarProductosPorTipoArtesano(tipo: string) {
  if (!tipo) throw new Error("Tipo de artesano requerido");
  return listarProductosPorTipoArtesanoDb(tipo);
}

/* ===============================
   USD24 - Listar productos del artesano
   =============================== */
export async function listarProductosPorArtesano(idArtesano: number) {
  if (!idArtesano) throw new Error("ID de artesano requerido");
  return listarProductosPorArtesanoDb(idArtesano);
}

/* ===============================
   USD26 - Implementar productos destacados
   =============================== */
export async function listarProductosDestacados() {
  return listarProductosDestacadosDb();
}


/* ===============================
   USD1 - Consultar productos
   =============================== */
export const consultarProductos = async () => {
  const productos = await getAllProducts();

  if (!productos || productos.length === 0) {
    return { mensaje: "No hay productos disponibles", data: [] };
  }

  return { data: productos };
};

/* ===============================
   USD1 - Imprimir listado de productos
   =============================== */

export const generarListadoProductosPDF = async (productos: any[]) => {
  const doc = new PDFDocument();

  productos.forEach((producto) => {
    doc.text(
      `${producto.codigo} - ${producto.nombre} - ${producto.categoria} - $${producto.precio}`
    );
  });

  doc.end();
  return doc;
};

/* ===============================
   USD1 - CONTROL DE STOCK
   =============================== */


export const evaluarStock = (stock: number) => {
  if (stock <= 0) return "rojo";
  if (stock <= 5) return "amarillo";
  return "verde";
};

/* ===============================
   USD1 - CLASIFICAR PRODUCTOS
   =============================== */


export const clasificarProducto = async (id: string, categoria: string) => {
  if (!categoria) {
    throw new Error("Debe seleccionar una categoría");
  }

  return await actualizarCategoria(id, categoria);
};