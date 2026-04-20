import * as productoService from "../lib/services/productoService";
import * as productoRepository from "../lib/persistence/repositories/productoRepository";

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

afterEach(() => {
  jest.clearAllMocks();
});

describe("ADM02 - Dar de alta producto", () => {
  const productoMock = {
    nombre: "Vasija artesanal",
    descripcion: "Hecha a mano",
    precio: 150,
    stock: 10,
    id_categoria: 1,
  };

  it("debe crear un producto correctamente", async () => {
    (productoRepository.crearProductoDb as jest.Mock).mockResolvedValue({
      id_producto: 1,
      ...productoMock,
    });

    const resultado = await productoService.crearProducto(productoMock);

    expect(productoRepository.crearProductoDb).toHaveBeenCalledWith(productoMock);
    expect(resultado.nombre).toBe("Vasija artesanal");
  });

  it("debe validar datos obligatorios", async () => {
    await expect(
      productoService.crearProducto({
        nombre: "",
        precio: 150,
        stock: 10,
        id_categoria: 1,
      })
    ).rejects.toThrow("El nombre del producto es obligatorio");
  });
});

describe("ADM03 - Consultar productos", () => {
  it("debe devolver la lista desde persistencia", async () => {
    const productosMock = [{ id_producto: 1, nombre: "Vasija", precio: 100 }];

    (productoRepository.consultarProductosDb as jest.Mock).mockResolvedValue(productosMock);

    const resultado = await productoService.consultarProductos();

    expect(productoRepository.consultarProductosDb).toHaveBeenCalledTimes(1);
    expect(resultado).toEqual(productosMock);
  });
});

describe("USD20 - Catálogo filtrable por tipo de artesanía", () => {
  it("debe construir categorías con conteo, aplicar filtro y paginar", async () => {
    (productoRepository.consultarCatalogoProductosDb as jest.Mock).mockResolvedValue([
      {
        id_producto: 1,
        id_categoria: 1,
        nombre: "Tapete rojo",
        descripcion: "Telar tradicional",
        precio: 1200,
        stock: 3,
        descuento_pct: 10,
        categorias: { nombre: "Textiles" },
        artesanos: { nombre: "María", apellido: "López" },
      },
      {
        id_producto: 2,
        id_categoria: 1,
        nombre: "Tapete azul",
        descripcion: "Lana teñida",
        precio: 980,
        stock: 5,
        descuento_pct: 0,
        categorias: { nombre: "Textiles" },
        artesanos: { nombre: "María", apellido: "López" },
      },
      {
        id_producto: 3,
        id_categoria: 2,
        nombre: "Jarrón barro negro",
        descripcion: "Cerámica bruñida",
        precio: 750,
        stock: 4,
        descuento_pct: 0,
        categorias: { nombre: "Cerámica" },
        artesanos: { nombre: "Juan", apellido: "Pérez" },
      },
    ]);

    (productoRepository.listarCategoriasActivasDb as jest.Mock).mockResolvedValue([
      { id_categoria: 1, nombre: "Textiles" },
      { id_categoria: 2, nombre: "Cerámica" },
      { id_categoria: 3, nombre: "Madera" },
    ]);

    const resultado = await productoService.obtenerCatalogoProductos({
      categoria: "1",
      q: "tapete",
      pagina: "1",
      porPagina: 1,
    });

    expect(productoRepository.consultarCatalogoProductosDb).toHaveBeenCalledWith({
      busqueda: "tapete",
    });
    expect(productoRepository.listarCategoriasActivasDb).toHaveBeenCalledTimes(1);
    expect(resultado.totalResultados).toBe(2);
    expect(resultado.totalPaginas).toBe(2);
    expect(resultado.paginaActual).toBe(1);
    expect(resultado.categoriaSeleccionada?.nombre).toBe("Textiles");
    expect(resultado.categorias).toEqual([
      { id: 1, nombre: "Textiles", descripcion: null, cantidad: 2 },
      { id: 2, nombre: "Cerámica", descripcion: null, cantidad: 1 },
      { id: 3, nombre: "Madera", descripcion: null, cantidad: 0 },
    ]);
    expect(resultado.productos).toHaveLength(1);
    expect(resultado.productos[0]).toMatchObject({
      nombre: "Tapete rojo",
      categoriaNombre: "Textiles",
      artesanoNombre: "María López",
      tipoArtesania: "Textiles",
    });
  });

  it("debe limpiar filtros inválidos y devolver la primera página", async () => {
    (productoRepository.consultarCatalogoProductosDb as jest.Mock).mockResolvedValue([]);
    (productoRepository.listarCategoriasActivasDb as jest.Mock).mockResolvedValue([]);

    const resultado = await productoService.obtenerCatalogoProductos({
      categoria: "no-valida",
      q: "   ",
      pagina: "0",
    });

    expect(productoRepository.consultarCatalogoProductosDb).toHaveBeenCalledWith({
      busqueda: "",
    });
    expect(resultado.categoriaSeleccionada).toBeNull();
    expect(resultado.categoriaSeleccionadaId).toBe("");
    expect(resultado.terminoBusqueda).toBe("");
    expect(resultado.paginaActual).toBe(1);
    expect(resultado.totalPaginas).toBe(1);
    expect(resultado.hayFiltrosActivos).toBe(false);
  });
});
