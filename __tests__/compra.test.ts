jest.mock("../lib/persistence/repositories/compraRepository", () => ({
  crearCompraDb: jest.fn(),
  crearDetalleCompraDb: jest.fn(),
  obtenerCompraDb: jest.fn(),
  listarComprasDb: jest.fn(),
}));

jest.mock("../lib/persistence/repositories/ventaRepository", () => ({
  restaurarStockProductoDb: jest.fn(),
}));

import {
  registrarCompra,
  obtenerCompra,
  listarCompras,
} from "../lib/services/compraService";
import {
  crearCompraDb,
  crearDetalleCompraDb,
  obtenerCompraDb,
  listarComprasDb,
} from "../lib/persistence/repositories/compraRepository";
import { restaurarStockProductoDb } from "../lib/persistence/repositories/ventaRepository";

beforeEach(() => {
  jest.clearAllMocks();
});

/* ===============================
   Registrar compra
   =============================== */
describe("Registrar compra", () => {
  const detalles = [
    { id_producto: 1, cantidad: 2, costo_unitario: 100 },
    { id_producto: 2, cantidad: 1, costo_unitario: 200 },
  ];

  test("Registra compra correctamente y actualiza stock", async () => {
    const cabeceraMock = { id_compra: 1, id_artesano: 5, total: 400 };
    (crearCompraDb as jest.Mock).mockResolvedValue(cabeceraMock);
    (crearDetalleCompraDb as jest.Mock).mockResolvedValue({});
    (restaurarStockProductoDb as jest.Mock).mockResolvedValue({});

    const resultado = await registrarCompra({
      id_artesano: 5,
      detalles,
      notas: "Primera adquisición",
    });

    expect(resultado.id_compra).toBe(1);
    expect(crearCompraDb).toHaveBeenCalledWith({
      id_artesano: 5,
      total: 400,
      id_metodo_pago: undefined,
      notas: "Primera adquisición",
    });
    expect(crearDetalleCompraDb).toHaveBeenCalledTimes(2);
    expect(restaurarStockProductoDb).toHaveBeenCalledWith(1, 2);
    expect(restaurarStockProductoDb).toHaveBeenCalledWith(2, 1);
  });

  test("Error si falta artesano", async () => {
    await expect(
      registrarCompra({ id_artesano: 0, detalles })
    ).rejects.toThrow("ID de artesano requerido");
  });

  test("Error si no hay detalles", async () => {
    await expect(registrarCompra({ id_artesano: 1, detalles: [] })).rejects.toThrow(
      "Debe haber al menos un artículo en la compra"
    );
  });

  test("Error si algún detalle es inválido", async () => {
    const malos = [{ id_producto: 0, cantidad: 1, costo_unitario: 10 }];
    await expect(
      registrarCompra({ id_artesano: 1, detalles: malos })
    ).rejects.toThrow("ID de producto requerido en detalle");
  });
});

/* ===============================
   Obtener compra
   =============================== */
describe("Obtener compra", () => {
  test("Obtiene compra correctamente", async () => {
    const mockCompra = { id_compra: 1, total: 400 };
    (obtenerCompraDb as jest.Mock).mockResolvedValue(mockCompra);

    const compra = await obtenerCompra(1);
    expect(compra.id_compra).toBe(1);
  });

  test("Error si falta ID", async () => {
    await expect(obtenerCompra(0)).rejects.toThrow("ID de compra requerido");
  });
});

/* ===============================
   Listar compras
   =============================== */
describe("Listar compras", () => {
  test("Lista todas las compras", async () => {
    const mockList = [{ id_compra: 1 }, { id_compra: 2 }];
    (listarComprasDb as jest.Mock).mockResolvedValue(mockList);

    const list = await listarCompras();
    expect(Array.isArray(list)).toBe(true);
    expect(list.length).toBe(2);
  });

  test("Lista por artesano", async () => {
    const mockList = [{ id_compra: 1 }];
    (listarComprasDb as jest.Mock).mockResolvedValue(mockList);

    const list = await listarCompras({ id_artesano: 5 });
    expect(Array.isArray(list)).toBe(true);
  });
});
