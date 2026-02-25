jest.mock("../lib/supabaseClient", () => ({
  supabase: {
    from: jest.fn(),
  },
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
import { supabase } from "../lib/supabaseClient";

// Helper para construir el mock de query chain de supabase
function mockChain(resolvedValue: { data: unknown; error: unknown }) {
  const chain: Record<string, jest.Mock> = {};
  const methods = ["select", "eq", "gt", "single", "update", "insert", "order"];
  methods.forEach((m) => {
    chain[m] = jest.fn().mockReturnValue(chain);
  });
  // La última llamada en el chain resuelve
  chain["single"] = jest.fn().mockResolvedValue(resolvedValue);
  // Para métodos que terminan sin .single()
  Object.assign(chain, {
    select: jest.fn().mockReturnValue({ ...chain, then: undefined }),
    eq: jest.fn().mockReturnValue(chain),
    gt: jest.fn().mockReturnValue(chain),
    order: jest.fn().mockResolvedValue(resolvedValue),
  });
  return chain;
}

beforeEach(() => {
  jest.clearAllMocks();
});

// ─── EXTRA01 ───────────────────────────────────────────────────────────────
describe("EXTRA01 - Consultar stock", () => {
  test("Retorna el stock de un producto", async () => {
    (supabase.from as jest.Mock).mockReturnValue({
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn().mockResolvedValue({ data: { stock: 10 }, error: null }),
    });
    const stock = await consultarStock(1);
    expect(stock).toBe(10);
  });
});

// ─── ADM02 ─────────────────────────────────────────────────────────────────
describe("ADM02 - Crear producto", () => {
  test("Crea producto correctamente", async () => {
    (supabase.from as jest.Mock).mockReturnValue({
      insert: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      single: jest.fn().mockResolvedValue({ data: { id_producto: 1 }, error: null }),
    });
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
    (supabase.from as jest.Mock).mockReturnValue({
      update: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      single: jest.fn().mockResolvedValue({ data: { id_producto: 1, precio: 250 }, error: null }),
    });
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
    (supabase.from as jest.Mock).mockReturnValue({
      update: jest.fn().mockReturnThis(),
      eq: jest.fn().mockResolvedValue({ error: null }),
    });
    const resultado = await eliminarProducto(1);
    expect(resultado).toBe(true);
  });

  test("Error si no se envía ID", async () => {
    await expect(eliminarProducto(0)).rejects.toThrow("ID de producto requerido");
  });
});

// ─── USD03 ─────────────────────────────────────────────────────────────────
describe("USD03 - Listar productos disponibles", () => {
  test("Retorna lista de productos con estado true y stock > 0", async () => {
    const mockProductos = [
      { id_producto: 1, nombre: "Tapete", precio: 300, imagen: null, stock: 5 },
      { id_producto: 2, nombre: "Barro negro", precio: 500, imagen: null, stock: 2 },
    ];
    (supabase.from as jest.Mock).mockReturnValue({
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      gt: jest.fn().mockResolvedValue({ data: mockProductos, error: null }),
    });
    const productos = await listarProductos();
    expect(productos).toHaveLength(2);
  });
});

// ─── USD04 / USD06 / USD23 / USD26 ─────────────────────────────────────────
describe("USD04/06/23/26 - Detalle completo de producto", () => {
  test("Retorna producto con descripción, materiales, técnica y fragilidad", async () => {
    const mockProducto = {
      id_producto: 1, nombre: "Tapete", precio: 300,
      descripcion: "Tejido a mano", materiales: "Lana", tecnica: "Telar",
      fragilidad: "alta", es_unico: true, descuento_pct: 0,
      artesanos: { nombre: "María", apellido: "López", comunidad: "Teotitlán" },
    };
    (supabase.from as jest.Mock).mockReturnValue({
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn().mockResolvedValue({ data: mockProducto, error: null }),
    });
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

// ─── USD05 ─────────────────────────────────────────────────────────────────
describe("USD05 - Galería de imágenes del producto", () => {
  test("Retorna imágenes ordenadas por campo 'orden'", async () => {
    const mockImagenes = [
      { id_imagen: 1, url: "img1.jpg", descripcion: "Vista frontal", orden: 0 },
      { id_imagen: 2, url: "img2.jpg", descripcion: "Vista lateral", orden: 1 },
    ];
    (supabase.from as jest.Mock).mockReturnValue({
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      order: jest.fn().mockResolvedValue({ data: mockImagenes, error: null }),
    });
    const imagenes = await obtenerImagenesProducto(1);
    expect(imagenes).toHaveLength(2);
    expect(imagenes[0].orden).toBe(0);
  });

  test("Error si no se proporciona ID de producto", async () => {
    await expect(obtenerImagenesProducto(0)).rejects.toThrow("ID de producto requerido");
  });
});

// ─── USD21 ─────────────────────────────────────────────────────────────────
describe("USD21 - Filtro por tipo de artesano", () => {
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

    (supabase.from as jest.Mock).mockReturnValue(chain);

    const productos = await listarProductosPorTipoArtesano("Tejedor");
    expect(productos).toBeDefined();
  });

  test("Error si no se envía tipo", async () => {
    await expect(listarProductosPorTipoArtesano("")).rejects.toThrow("Tipo de artesano requerido");
  });
});

// ─── USD25 ─────────────────────────────────────────────────────────────────
describe("USD25 - Listar productos de un artesano", () => {
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

    (supabase.from as jest.Mock).mockReturnValue(chain);

    const productos = await listarProductosPorArtesano(1);
    expect(productos).toHaveLength(1);
  });

  test("Error si no se envía ID de artesano", async () => {
    await expect(listarProductosPorArtesano(0)).rejects.toThrow("ID de artesano requerido");
  });
});

// ─── USD27 ─────────────────────────────────────────────────────────────────
describe("USD27 - Productos destacados", () => {
  test("Retorna solo productos con es_destacado = true", async () => {
    const mockDestacados = [{ id_producto: 1, nombre: "Tapete destacado", es_destacado: true }];
    (supabase.from as jest.Mock).mockReturnValue({
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      gt: jest.fn().mockResolvedValue({ data: mockDestacados, error: null }),
    });
    
    const destacados = await listarProductosDestacados() as any[];
    expect(destacados).toHaveLength(1);
    expect(destacados[0].es_destacado).toBe(true);
  });
});