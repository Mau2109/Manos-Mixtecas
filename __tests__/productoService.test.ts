import {
  consultarProductos,
  evaluarStock,
  clasificarProducto
} from "@/lib/services/productoService";

import * as repo from "@/lib/persistence/repositories/productoRepository";

jest.mock("@/lib/persistence/repositories/productoRepository");

describe("Consultar Productos", () => {

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("debe retornar productos cuando existen", async () => {
    (repo.getAllProducts as jest.Mock).mockResolvedValue([
      { id: 1, nombre: "Producto 1" }
    ]);

    const resultado = await consultarProductos();

    expect(resultado.data).toHaveLength(1);
    expect(resultado.data[0].nombre).toBe("Producto 1");
    expect(repo.getAllProducts).toHaveBeenCalledTimes(1);
  });

  it("debe retornar mensaje cuando no hay productos", async () => {
    (repo.getAllProducts as jest.Mock).mockResolvedValue([]);

    const resultado = await consultarProductos();

    expect(resultado.mensaje).toBe("No hay productos disponibles");
    expect(resultado.data).toEqual([]);
  });

  it("debe lanzar error si el repository falla", async () => {
    (repo.getAllProducts as jest.Mock).mockRejectedValue(
      new Error("Error BD")
    );

    await expect(consultarProductos()).rejects.toThrow("Error BD");
  });

});



describe("Evaluar Stock", () => {

  it("debe retornar rojo cuando stock es 0", () => {
    expect(evaluarStock(0)).toBe("rojo");
  });

  it("debe retornar amarillo cuando stock es menor o igual a 5", () => {
    expect(evaluarStock(3)).toBe("amarillo");
  });

  it("debe retornar verde cuando stock es mayor a 5", () => {
    expect(evaluarStock(10)).toBe("verde");
  });

});



describe("Clasificar Producto", () => {

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("debe lanzar error si no se proporciona categoría", async () => {
    await expect(
      clasificarProducto("1", "")
    ).rejects.toThrow("Debe seleccionar una categoría");
  });

  it("debe clasificar producto correctamente", async () => {
    (repo.actualizarCategoria as jest.Mock).mockResolvedValue({});

    await clasificarProducto("1", "textil");

    expect(repo.actualizarCategoria).toHaveBeenCalledWith("1", "textil");
  });

});