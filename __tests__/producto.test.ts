jest.mock("../lib/persistence/repositories/productoRepository", () => ({
  actualizarCategoria: jest.fn(),
  actualizarProductoDb: jest.fn(),
  consultarCatalogoProductosDb: jest.fn(),
  consultarProductosDb: jest.fn(),
  consultarStockDb: jest.fn(),
  crearProductoDb: jest.fn(),
  eliminarProductoDb: jest.fn(),
  listarCategoriasActivasDb: jest.fn(),
  listarProductosDb: jest.fn(),
  listarProductosDestacadosDb: jest.fn(),
  listarProductosPorArtesanoDb: jest.fn(),
  listarProductosPorTipoArtesanoDb: jest.fn(),
  obtenerImagenesProductoDb: jest.fn(),
  obtenerProductoDetalleDb: jest.fn(),
}));

import {
  actualizarProducto,
  consultarStock,
  eliminarProducto,
  imprimirListadoProductos,
  listarProductosDestacados,
  listarProductosPorArtesano,
  listarProductosPorTipoArtesano,
  obtenerImagenesProducto,
  obtenerProductoDetalle,
} from "../lib/services/productoService";
import {
  actualizarProductoDb,
  consultarStockDb,
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

describe("ADM07 - Control de stock", () => {
  test("retorna el stock de un producto", async () => {
    (consultarStockDb as jest.Mock).mockResolvedValue({ stock: 10 });

    const stock = await consultarStock(1);

    expect(consultarStockDb).toHaveBeenCalledWith(1);
    expect(stock).toBe(10);
  });
});

describe("ADM04 - Actualizar producto", () => {
  test("actualiza producto correctamente", async () => {
    (actualizarProductoDb as jest.Mock).mockResolvedValue({
      id_producto: 1,
      precio: 250,
    });

    const producto = await actualizarProducto(1, { precio: 250 });

    expect(actualizarProductoDb).toHaveBeenCalledWith(1, { precio: 250 });
    expect(producto.precio).toBe(250);
  });

  test("lanza error si no se envía ID", async () => {
    await expect(actualizarProducto(0, { precio: 250 })).rejects.toThrow(
      "El id del producto es obligatorio"
    );
  });
});

describe("ADM05 - Eliminar producto", () => {
  test("elimina producto correctamente", async () => {
    (eliminarProductoDb as jest.Mock).mockResolvedValue(true);

    const resultado = await eliminarProducto(1);

    expect(eliminarProductoDb).toHaveBeenCalledWith(1);
    expect(resultado).toBe(true);
  });

  test("lanza error si no se envía ID", async () => {
    await expect(eliminarProducto(0)).rejects.toThrow("El id del producto es obligatorio");
  });
});

describe("ADM06 - Imprimir listado de productos", () => {
  test("devuelve productos para imprimir", async () => {
    const productosMock = [
      { id_producto: 1, nombre: "Sombrero", precio: 200 },
      { id_producto: 2, nombre: "Tapete", precio: 350 },
    ];

    (listarProductosDb as jest.Mock).mockResolvedValue(productosMock);

    const resultado = await imprimirListadoProductos();

    expect(listarProductosDb).toHaveBeenCalledTimes(1);
    expect(resultado).toHaveLength(2);
  });
});

describe("USD07/USD09/USD21/USD22/USD25 - Detalle completo de producto", () => {
  test("retorna producto con descripción, técnica, fragilidad y artesano", async () => {
    const mockProducto = {
      id_producto: 1,
      nombre: "Tapete",
      precio: 300,
      descripcion: "Tejido a mano",
      materiales: "Lana",
      tecnica: "Telar",
      fragilidad: "alta",
      es_unico: true,
      descuento_pct: 0,
      artesanos: { nombre: "María", apellido: "López", comunidad: "Teotitlán" },
    };

    (obtenerProductoDetalleDb as jest.Mock).mockResolvedValue(mockProducto);

    const producto = await obtenerProductoDetalle(1);

    expect(obtenerProductoDetalleDb).toHaveBeenCalledWith(1);
    expect(producto.materiales).toBe("Lana");
    expect(producto.tecnica).toBe("Telar");
    expect(producto.fragilidad).toBe("alta");
    expect(producto.artesanos).toBeDefined();
  });

  test("lanza error si no se proporciona ID", async () => {
    await expect(obtenerProductoDetalle(0)).rejects.toThrow("ID de producto requerido");
  });
});

describe("USD08 - Galería de imágenes", () => {
  test("retorna imágenes ordenadas", async () => {
    const mockImagenes = [
      { id_imagen: 1, url: "img1.jpg", descripcion: "Vista frontal", orden: 0 },
      { id_imagen: 2, url: "img2.jpg", descripcion: "Vista lateral", orden: 1 },
    ];

    (obtenerImagenesProductoDb as jest.Mock).mockResolvedValue(mockImagenes);

    const imagenes = await obtenerImagenesProducto(1);

    expect(obtenerImagenesProductoDb).toHaveBeenCalledWith(1);
    expect(imagenes).toHaveLength(2);
    expect(imagenes[0].orden).toBe(0);
  });

  test("lanza error si no se proporciona ID de producto", async () => {
    await expect(obtenerImagenesProducto(0)).rejects.toThrow("ID de producto requerido");
  });
});

describe("USD20 - Filtro por tipo de artesano", () => {
  test("lista productos filtrados por tipo de artesano", async () => {
    const mockProductos = [{ id_producto: 1, nombre: "Tapete" }];
    (listarProductosPorTipoArtesanoDb as jest.Mock).mockResolvedValue(mockProductos);

    const productos = await listarProductosPorTipoArtesano("Tejedor");

    expect(listarProductosPorTipoArtesanoDb).toHaveBeenCalledWith("Tejedor");
    expect(productos).toEqual(mockProductos);
  });

  test("lanza error si no se envía tipo", async () => {
    await expect(listarProductosPorTipoArtesano("")).rejects.toThrow(
      "Tipo de artesano requerido"
    );
  });
});

describe("USD24 - Listar productos del artesano", () => {
  test("retorna productos del artesano especificado", async () => {
    const mockProductos = [{ id_producto: 3, nombre: "Barro negro" }];
    (listarProductosPorArtesanoDb as jest.Mock).mockResolvedValue(mockProductos);

    const productos = await listarProductosPorArtesano(1);

    expect(listarProductosPorArtesanoDb).toHaveBeenCalledWith(1);
    expect(productos).toHaveLength(1);
  });

  test("lanza error si no se envía ID de artesano", async () => {
    await expect(listarProductosPorArtesano(0)).rejects.toThrow("ID de artesano requerido");
  });
});

describe("USD26 - Productos destacados", () => {
  test("retorna solo productos destacados", async () => {
    const mockDestacados = [
      { id_producto: 1, nombre: "Tapete destacado", es_destacado: true },
    ];
    (listarProductosDestacadosDb as jest.Mock).mockResolvedValue(mockDestacados);

    const destacados = (await listarProductosDestacados()) as any[];

    expect(listarProductosDestacadosDb).toHaveBeenCalledTimes(1);
    expect(destacados).toHaveLength(1);
    expect(destacados[0].es_destacado).toBe(true);
  });
});
