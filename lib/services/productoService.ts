import {
  actualizarProductoDb,
  consultarCatalogoProductosDb,
  consultarProductosDb,
  consultarStockDb,
  crearProductoDb,
  eliminarProductoDb,
  listarProductosDb,
  listarCategoriasActivasDb,
  listarProductosDestacadosDb,
  listarProductosPorArtesanoDb,
  listarProductosPorTipoArtesanoDb,
  obtenerImagenesProductoDb,
  obtenerProductoDetalleDb,
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

type ObtenerCatalogoProductosParams = {
  categoria?: string;
  q?: string;
  pagina?: string;
  porPagina?: number;
};

function normalizarTextoFiltro(texto?: string) {
  return texto?.trim().toLowerCase() ?? "";
}

function normalizarCategoriaId(categoria?: string) {
  const categoriaId = Number(categoria);
  return Number.isInteger(categoriaId) && categoriaId > 0 ? categoriaId : null;
}

function normalizarPagina(pagina?: string) {
  const paginaActual = Number(pagina);
  return Number.isInteger(paginaActual) && paginaActual > 0 ? paginaActual : 1;
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
  return consultarProductosDb();
}


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
   USD20 - Catálogo con filtro por tipo de artesanía
   =============================== */
export async function obtenerCatalogoProductos(
  params: ObtenerCatalogoProductosParams = {}
) {
  const terminoBusqueda = normalizarTextoFiltro(params.q);
  const categoriaSeleccionadaId = normalizarCategoriaId(params.categoria);
  const porPagina = params.porPagina && Number(params.porPagina) > 0 ? Number(params.porPagina) : 12;

  const [productosBase, categoriasActivas] = await Promise.all([
    consultarCatalogoProductosDb({ busqueda: terminoBusqueda }),
    listarCategoriasActivasDb(),
  ]);

  const conteoPorCategoria = new Map<number, number>();
  for (const producto of productosBase ?? []) {
    const categoriaId = Number(producto.id_categoria);
    if (!Number.isInteger(categoriaId) || categoriaId <= 0) continue;
    conteoPorCategoria.set(categoriaId, (conteoPorCategoria.get(categoriaId) ?? 0) + 1);
  }

  const categorias = (categoriasActivas ?? []).map((categoria) => ({
    id: categoria.id_categoria,
    nombre: categoria.nombre,
    descripcion: categoria.descripcion ?? null,
    cantidad: conteoPorCategoria.get(categoria.id_categoria) ?? 0,
  }));

  const productosFiltrados = (productosBase ?? []).filter((producto) => {
    if (!categoriaSeleccionadaId) return true;
    return Number(producto.id_categoria) === categoriaSeleccionadaId;
  });

  const productosNormalizados = productosFiltrados.map((producto) => {
    const artesanoRelacion = Array.isArray(producto.artesanos)
      ? producto.artesanos[0]
      : producto.artesanos;
    const categoriaRelacion = Array.isArray(producto.categorias)
      ? producto.categorias[0]
      : producto.categorias;
    const artesanoNombre = artesanoRelacion
      ? [artesanoRelacion.nombre, artesanoRelacion.apellido].filter(Boolean).join(" ")
      : "";

    return {
      ...producto,
      categoriaNombre: categoriaRelacion?.nombre ?? "Sin categoría",
      artesanoNombre,
      tipoArtesania:
        categoriaRelacion?.nombre ?? producto.tecnica ?? producto.materiales ?? "Artesanía",
    };
  });

  const totalResultados = productosNormalizados.length;
  const totalPaginas = Math.max(1, Math.ceil(totalResultados / porPagina));
  const paginaActual = Math.min(normalizarPagina(params.pagina), totalPaginas);
  const inicio = (paginaActual - 1) * porPagina;
  const productos = productosNormalizados.slice(inicio, inicio + porPagina);
  const categoriaSeleccionada =
    categorias.find((categoria) => categoria.id === categoriaSeleccionadaId) ?? null;

  return {
    productos,
    categorias,
    totalResultados,
    totalPaginas,
    paginaActual,
    porPagina,
    terminoBusqueda,
    categoriaSeleccionada,
    categoriaSeleccionadaId: categoriaSeleccionadaId ? String(categoriaSeleccionadaId) : "",
    hayFiltrosActivos: Boolean(terminoBusqueda || categoriaSeleccionadaId),
  };
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
  return listarCategoriasActivasDb();
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

export async function crearCategoria(data: {
  nombre: string;
  descripcion?: string;
}) {

  if (!data.nombre || data.nombre.trim() === "") {
    throw new Error("El nombre de la categoría es obligatorio");
  }

  const { data: nuevaCategoria, error } = await supabase
    .from("categorias")
    .insert({
      nombre: data.nombre,
      descripcion: data.descripcion || null,
      estado: true
    })
    .select()
    .single();

  if (error) throw error;

  return nuevaCategoria;
}
