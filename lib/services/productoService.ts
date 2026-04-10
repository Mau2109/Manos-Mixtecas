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
import { supabase } from "@/lib/supabaseClient";

// import PDFDocument from "pdfkit";

/* ==========================================
   VALIDACIONES DE PRODUCTO (REGLAS NEGOCIO)
   ========================================== */
function validarProducto(producto: any) {

  if (!producto.nombre || producto.nombre.trim() === "") {
    throw new Error("El nombre del producto es obligatorio");
  }

  if (producto.precio == null || producto.precio < 0) {
    throw new Error("El precio del producto es inválido");
  }

  if (producto.stock == null || producto.stock < 0) {
    throw new Error("El stock del producto es inválido");
  }

  if (!producto.id_categoria) {
    throw new Error("La categoría es obligatoria");
  }

}

function validarActualizacionProducto(producto: any) {

  if ("nombre" in producto && producto.nombre.trim() === "") {
    throw new Error("El nombre del producto no puede quedar vacío");
  }

  if ("precio" in producto && producto.precio < 0) {
    throw new Error("El precio no puede ser negativo");
  }

  if ("stock" in producto && producto.stock < 0) {
    throw new Error("El stock no puede ser negativo");
  }

  if ("id_categoria" in producto && !producto.id_categoria) {
    throw new Error("La categoría es obligatoria");
  }

}

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
   ADM02 - Dar de alta producto
   =============================== */
export async function crearProducto(producto: any) {

  validarProducto(producto);

  return await crearProductoDb(producto);
}

/* ==========================================
  ADM03 - Consultar productos
  ========================================== */
export async function consultarProductos() {

  const productos = await listarProductosDb();

  return productos;
}

/* ===============================
   ADM03 - Consultar productos
   =============================== */
// export const consultarProductos = async () => {
//   const productos = await getAllProducts();

//   if (!productos || productos.length === 0) {
//     return { mensaje: "No hay productos disponibles", data: [] };
//   }

//   return { data: productos };
// };


/* ==========================================
  ADM04 - Actualizar producto
  ========================================== */
export async function actualizarProducto(idProducto: number, datos: any) {

  if (!idProducto) {
    throw new Error("El id del producto es obligatorio");
  }

  validarActualizacionProducto(datos);

  return await actualizarProductoDb(idProducto, datos);
}

/* ==========================================
  ADM05 - Eliminar producto
  ========================================== */
export async function eliminarProducto(id: number) {

  if (!id) {
    throw new Error("El id del producto es obligatorio");
  }

  return await eliminarProductoDb(id);
}

/* ==========================================
  ADM06 - Imprimir listado productos
  ========================================== */
export async function imprimirListadoProductos() {

  const productos = await listarProductosDb();

  if (!productos || productos.length === 0) {
    throw new Error("No hay productos registrados");
  }

  return productos;
}

/* ===============================
   ADM06 - Imprimir listado productos
   =============================== */
export const generarListadoProductosPDF = async (productos: any[]) => {
  const lines = productos.map(
    (producto) =>
      `${producto.codigo} - ${producto.nombre} - ${producto.categoria} - $${producto.precio}`
  );

  // Devuelve un Buffer simple para evitar dependencia de pdfkit en servicios compartidos.
  return Buffer.from(lines.join("\n"), "utf-8");
};

/* ==========================================
   ADM07 - Control de stock
   ========================================== */
export async function controlarStock(idProducto: number, cantidad: number) {

  if (cantidad <= 0) {
    throw new Error("La cantidad debe ser mayor que cero");
  }

  const producto = await consultarStockDb(idProducto);

  if (!producto) {
    throw new Error("Producto no encontrado");
  }

  if (producto.stock < cantidad) {
    throw new Error("Stock insuficiente");
  }

  return producto.stock - cantidad;
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
   USD1 - Imprimir listado de productos
   =============================== */

// export const generarListadoProductosPDF = async (productos: any[]) => {
//   const doc = new PDFDocument();

//   productos.forEach((producto) => {
//     doc.text(
//       `${producto.codigo} - ${producto.nombre} - ${producto.categoria} - $${producto.precio}`
//     );
//   });

//   doc.end();
//   return doc;
// };

export async function obtenerCategorias() {
  const { data, error } = await supabase
      .from("categorias")
      .select("*")
      .eq("estado", true);

    if (error) throw error;

    return data;
  }


/* ===============================
   ADM07 - Control de stock (semáforo)
   =============================== */
// export const evaluarStock = (stock: number) => {
//   if (stock <= 0) return "rojo";
//   if (stock <= 5) return "amarillo";
//   return "verde";
// };

/* ===============================
   USD1 - CONTROL DE STOCK
   =============================== */
export const evaluarStock = (stock: number) => {
  if (stock <= 0) return "rojo";
  if (stock <= 5) return "amarillo";
  return "verde";
};

/* ===============================
   ADM19 - Clasificar productos
   =============================== */
// export const clasificarProducto = async (id: string, categoria: string) => {
//   if (!categoria) {
//     throw new Error("Debe seleccionar una categoría");
//   }

//   return await actualizarCategoria(id, categoria);
// };

/* ===============================
   USD1 - CLASIFICAR PRODUCTOS
   =============================== */
export const clasificarProducto = async (id: string, categoria: string) => {
  if (!categoria) {
    throw new Error("Debe seleccionar una categoría");
  }

  return await actualizarCategoria(id, categoria);
};

