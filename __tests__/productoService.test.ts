import * as productoService from "../lib/services/productoService";
import * as productoRepository from "../lib/persistence/repositories/productoRepository";

jest.mock("../lib/persistence/repositories/productoRepository");

afterEach(() => {
  jest.clearAllMocks();
});


/* ==================================================
   ADM02 - Dar de alta producto
   ================================================== */
describe("ADM02 - Dar de alta producto", () => {

  const productoMock = {
    nombre: "Vasija artesanal",
    descripcion: "Hecha a mano",
    precio: 150,
    stock: 10,
    id_categoria: 1
  };

  it("debe crear un producto correctamente", async () => {

    (productoRepository.crearProductoDb as jest.Mock).mockResolvedValue({
      id_producto: 1,
      ...productoMock
    });

    const resultado = await productoService.crearProducto(productoMock);

    expect(productoRepository.crearProductoDb).toHaveBeenCalledWith(productoMock);
    expect(resultado.nombre).toBe("Vasija artesanal");

  });

});


/* ==================================================
   ADM03 - Consultar productos
   ================================================== */
describe("ADM03 - Consultar productos", () => {

  it("debe devolver la lista de productos", async () => {

    const productosMock = [
      { id_producto: 1, nombre: "Vasija", precio: 100 }
    ];

    (productoRepository.listarProductosDb as jest.Mock).mockResolvedValue(productosMock);

    const resultado = await productoService.consultarProductos();

    expect(productoRepository.listarProductosDb).toHaveBeenCalled();
    expect(resultado.length).toBe(1);

  });

});


/* ==================================================
   ADM04 - Actualizar producto
   ================================================== */
  describe("ADM04 - Actualizar producto", () => {

    it("debe actualizar solo el precio", async () => {

      const datos = { precio: 200 };

      (productoRepository.actualizarProductoDb as jest.Mock).mockResolvedValue({
        id_producto: 1,
        precio: 200
      });

      const resultado = await productoService.actualizarProducto(1, datos);

      expect(resultado.precio).toBe(200);

    });

  });


/* ==================================================
   ADM05 - Eliminar producto
   ================================================== */
describe("ADM05 - Eliminar producto", () => {

  it("debe eliminar un producto", async () => {

    (productoRepository.eliminarProductoDb as jest.Mock).mockResolvedValue(true);

    const resultado = await productoService.eliminarProducto(1);

    expect(productoRepository.eliminarProductoDb).toHaveBeenCalledWith(1);
    expect(resultado).toBe(true);

  });

});


/* ==================================================
   ADM06 - Imprimir listado de productos
   ================================================== */
describe("ADM06 - Imprimir listado de productos", () => {

  it("debe devolver productos para imprimir", async () => {

    const productosMock = [
      { id_producto: 1, nombre: "Sombrero", precio: 200 }
    ];

    (productoRepository.listarProductosDb as jest.Mock).mockResolvedValue(productosMock);

    const resultado = await productoService.imprimirListadoProductos();

    expect(productoRepository.listarProductosDb).toHaveBeenCalled();
    expect(resultado.length).toBe(1);

  });

});


/* ==================================================
   ADM07 - Control de stock
   ================================================== */
describe("ADM07 - Control de stock", () => {

  it("debe validar stock correctamente", async () => {

    (productoRepository.consultarStockDb as jest.Mock).mockResolvedValue({
      stock: 10
    });

    const resultado = await productoService.controlarStock(1, 2);

    expect(productoRepository.consultarStockDb).toHaveBeenCalledWith(1);
    expect(resultado).toBe(8);

  });

});