jest.mock("../lib/persistence/repositories/productoRepository", () => ({
  actualizarProductoDb: jest.fn(),
  consultarStockDb: jest.fn(),
  crearProductoDb: jest.fn(),
  eliminarProductoDb: jest.fn(),
  listarProductosDb: jest.fn(),
  listarProductosDestacadosDb: jest.fn(),
  listarProductosPorArtesanoDb: jest.fn(),
  listarProductosPorTipoArtesanoDb: jest.fn(),
  obtenerImagenesProductoDb: jest.fn(),
  obtenerProductoDetalleDb: jest.fn(),
}));

import {
  consultarStock,
  crearProducto,
  actualizarProducto,
  eliminarProducto,
  listarProductos,
  obtenerProductoDetalle,
  obtenerImagenesProducto,
  listarProductosPorTipoArtesano,
  listarProductosPorArtesano,
  listarProductosDestacados,
} from "../lib/services/productoService";
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
} from "../lib/persistence/repositories/productoRepository";


beforeEach(() => {
  jest.clearAllMocks();
});

// ─── EXTRA01 ───────────────────────────────────────────────────────────────
describe("EXTRA01 - Consultar stock", () => {
  test("Retorna el stock de un producto", async () => {
    (consultarStockDb as jest.Mock).mockResolvedValue({ stock: 10 });
    const stock = await consultarStock(1);
    expect(stock).toBe(10);
  });
});

// ─── ADM02 ─────────────────────────────────────────────────────────────────
describe("ADM02 - Crear producto", () => {
  test("Crea producto correctamente", async () => {
    (crearProductoDb as jest.Mock).mockResolvedValue({ id_producto: 1 });
    const producto = await crearProducto({ nombre: "Artesanía", precio: 200, stock: 5, id_categoria: 1 });
    expect(producto).toBeDefined();
  });

  test("Error si faltan datos obligatorios", async () => {
    await expect(crearProducto({ nombre: "", precio: 0, stock: 0, id_categoria: 1 }))
      .rejects.toThrow("Datos obligatorios del producto");
  });
});

// ─── ADM03 ─────────────────────────────────────────────────────────────────
describe("ADM03 - Actualizar producto", () => {
  test("Actualiza producto correctamente", async () => {
    (actualizarProductoDb as jest.Mock).mockResolvedValue({ id_producto: 1, precio: 250 });
    const producto = await actualizarProducto(1, { precio: 250 });
    expect(producto).toBeDefined();
  });

  test("Error si no se envía ID", async () => {
    await expect(actualizarProducto(0, { precio: 250 })).rejects.toThrow("ID de producto requerido");
  });
});

// ─── ADM04 ─────────────────────────────────────────────────────────────────
describe("ADM04 - Eliminar producto (lógico)", () => {
  test("Elimina producto correctamente", async () => {
    (eliminarProductoDb as jest.Mock).mockResolvedValue(true);
    const resultado = await eliminarProducto(1);
    expect(resultado).toBe(true);
  });

  test("Error si no se envía ID", async () => {
    await expect(eliminarProducto(0)).rejects.toThrow("ID de producto requerido");
  });
});

// ─── USD06 ─────────────────────────────────────────────────────────────────
describe("USD06 - Listar productos", () => {
  test("Retorna lista de productos con estado true y stock > 0", async () => {
    const mockProductos = [
      { id_producto: 1, nombre: "Tapete", precio: 300, imagen: null, stock: 5 },
      { id_producto: 2, nombre: "Barro negro", precio: 500, imagen: null, stock: 2 },
    ];
    (listarProductosDb as jest.Mock).mockResolvedValue(mockProductos);
    const productos = await listarProductos();
    expect(productos).toHaveLength(2);
  });
});

// ─── USD07 / USD09 / USD22 / USD25 ─────────────────────────────────────────
describe("USD07/09/22/25 - Detalle completo de producto", () => {
  test("Retorna producto con descripción, materiales, técnica y fragilidad", async () => {
    const mockProducto = {
      id_producto: 1, nombre: "Tapete", precio: 300,
      descripcion: "Tejido a mano", materiales: "Lana", tecnica: "Telar",
      fragilidad: "alta", es_unico: true, descuento_pct: 0,
      artesanos: { nombre: "María", apellido: "López", comunidad: "Teotitlán" },
    };
    (obtenerProductoDetalleDb as jest.Mock).mockResolvedValue(mockProducto);
    const producto = await obtenerProductoDetalle(1);
    expect(producto.materiales).toBe("Lana");
    expect(producto.tecnica).toBe("Telar");
    expect(producto.fragilidad).toBe("alta");
    expect(producto.es_unico).toBe(true);
  });

  test("Error si no se proporciona ID", async () => {
    await expect(obtenerProductoDetalle(0)).rejects.toThrow("ID de producto requerido");
  });
});

// ─── USD08 ─────────────────────────────────────────────────────────────────
describe("USD08 - Galería de imágenes", () => {
  test("Retorna imágenes ordenadas por campo 'orden'", async () => {
    const mockImagenes = [
      { id_imagen: 1, url: "img1.jpg", descripcion: "Vista frontal", orden: 0 },
      { id_imagen: 2, url: "img2.jpg", descripcion: "Vista lateral", orden: 1 },
    ];
    (obtenerImagenesProductoDb as jest.Mock).mockResolvedValue(mockImagenes);
    const imagenes = await obtenerImagenesProducto(1);
    expect(imagenes).toHaveLength(2);
    expect(imagenes[0].orden).toBe(0);
  });

  test("Error si no se proporciona ID de producto", async () => {
    await expect(obtenerImagenesProducto(0)).rejects.toThrow("ID de producto requerido");
  });
});

// ─── USD20 ─────────────────────────────────────────────────────────────────
describe("USD20 - Filtro por tipo de artesano", () => {
  test("Lista productos filtrados por tipo de artesano", async () => {
    const mockProductos = [{ id_producto: 1, nombre: "Tapete" }];

    // Necesitamos un chain donde .eq() siempre devuelve el mismo objeto
    // y el último .eq() resuelve la promesa al ser awaited
    const chain: Record<string, jest.Mock> = {
      select: jest.fn(),
      eq: jest.fn(),
    };
    chain.select.mockReturnValue(chain);
    chain.eq.mockReturnValue(chain);
    // El chain es thenable: cuando se hace await devuelve el resultado
    (chain as any).then = (resolve: Function) =>
      resolve({ data: mockProductos, error: null });

    (listarProductosPorTipoArtesanoDb as jest.Mock).mockResolvedValue(mockProductos);

    const productos = await listarProductosPorTipoArtesano("Tejedor");
    expect(productos).toBeDefined();
  });

  test("Error si no se envía tipo", async () => {
    await expect(listarProductosPorTipoArtesano("")).rejects.toThrow("Tipo de artesano requerido");
  });
});

// ─── USD24 ─────────────────────────────────────────────────────────────────
describe("USD24 - Listar productos del artesano", () => {
  test("Retorna productos del artesano especificado", async () => {
    const mockProductos = [{ id_producto: 3, nombre: "Barro negro" }];

    const chain: Record<string, jest.Mock> = {
      select: jest.fn(),
      eq: jest.fn(),
    };
    chain.select.mockReturnValue(chain);
    chain.eq.mockReturnValue(chain);
    (chain as any).then = (resolve: Function) =>
      resolve({ data: mockProductos, error: null });

    (listarProductosPorArtesanoDb as jest.Mock).mockResolvedValue(mockProductos);

    const productos = await listarProductosPorArtesano(1);
    expect(productos).toHaveLength(1);
  });

  test("Error si no se envía ID de artesano", async () => {
    await expect(listarProductosPorArtesano(0)).rejects.toThrow("ID de artesano requerido");
  });
});

// ─── USD26 ─────────────────────────────────────────────────────────────────
describe("USD26 - Implementar productos destacados", () => {
  test("Retorna solo productos con es_destacado = true", async () => {
    const mockDestacados = [{ id_producto: 1, nombre: "Tapete destacado", es_destacado: true }];
    (listarProductosDestacadosDb as jest.Mock).mockResolvedValue(mockDestacados);
    
    const destacados = await listarProductosDestacados() as any[];
    expect(destacados).toHaveLength(1);
    expect(destacados[0].es_destacado).toBe(true);
  });
});


