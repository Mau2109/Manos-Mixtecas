jest.mock("../lib/persistence/repositories/carritoRepository", () => ({
  agregarProductoCarritoDb: jest.fn(),
  eliminarProductoCarritoDb: jest.fn(),
  listarMetodosPagoDb: jest.fn(),
  obtenerCarritoDb: jest.fn(),
}));

import {
  agregarProductoCarrito,
  eliminarProductoCarrito,
  obtenerCarrito,
  calcularTotalCarrito,
  listarMetodosPago,
} from "../lib/services/carritoService";
import {
  agregarProductoCarritoDb,
  eliminarProductoCarritoDb,
  listarMetodosPagoDb,
  obtenerCarritoDb,
} from "../lib/persistence/repositories/carritoRepository";

beforeEach(() => {
  jest.clearAllMocks();
});

// ─── USD04 - Visualizar producto del carrito ──────────────────────────────
describe("USD04 - Visualizar producto del carrito", () => {
  test("Retorna los items del carrito con datos del producto", async () => {
    const mockItems = [
      {
        id_detalle: 1, cantidad: 2, precio_unitario: 150,
        productos: { id_producto: 1, nombre: "Tapete", imagen: null, fragilidad: "alta" },
      },
    ];
    (obtenerCarritoDb as jest.Mock).mockResolvedValue(mockItems);
    const items = await obtenerCarrito(1);
    expect(items).toHaveLength(1);
    expect(items[0].cantidad).toBe(2);
  });

  test("Error si no se envía ID de carrito", async () => {
    await expect(obtenerCarrito(0)).rejects.toThrow("ID de carrito requerido");
  });
});

// ─── USD05 - Cálculo total de compras ─────────────────────────────────────
describe("USD05 - Cálculo total de compras", () => {
  test("Calcula correctamente el total sumando cantidad × precio_unitario", async () => {
    const mockItems = [
      { id_detalle: 1, cantidad: 2, precio_unitario: 150 },
      { id_detalle: 2, cantidad: 1, precio_unitario: 300 },
    ];
    (obtenerCarritoDb as jest.Mock).mockResolvedValue(mockItems);
    const total = await calcularTotalCarrito(1);
    expect(total).toBe(600); // (2*150) + (1*300)
  });

  test("Retorna 0 si el carrito está vacío", async () => {
    (obtenerCarritoDb as jest.Mock).mockResolvedValue([]);
    const total = await calcularTotalCarrito(1);
    expect(total).toBe(0);
  });
});

// ─── USD02 - Agregar producto al carrito ──────────────────────────────────
describe("USD02 - Agregar producto al carrito", () => {
  test("Agrega producto correctamente", async () => {
    (agregarProductoCarritoDb as jest.Mock).mockResolvedValue(true);
    const resultado = await agregarProductoCarrito(1, 1, 2, 100);
    expect(resultado).toBe(true);
  });

  test("Error si cantidad es 0 o negativa", async () => {
    await expect(agregarProductoCarrito(1, 1, 0, 100)).rejects.toThrow("Cantidad inválida");
    await expect(agregarProductoCarrito(1, 1, -1, 100)).rejects.toThrow("Cantidad inválida");
  });
});

// ─── USD03 - Eliminar producto del carrito ────────────────────────────────
describe("USD03 - Eliminar producto del carrito", () => {
  test("Elimina un detalle del carrito por ID", async () => {
    (eliminarProductoCarritoDb as jest.Mock).mockResolvedValue(true);
    const resultado = await eliminarProductoCarrito(1);
    expect(resultado).toBe(true);
  });

  test("Error si no se envía ID de detalle", async () => {
    await expect(eliminarProductoCarrito(0)).rejects.toThrow("ID de detalle requerido");
  });
});

// ─── USD12 - Listar métodos de pago ───────────────────────────────────────
describe("USD12 - Selección método de pago", () => {
  test("Retorna lista de métodos de pago activos", async () => {
    const mockMetodos = [
      { id_metodo_pago: 1, nombre: "Transferencia bancaria", descripcion: null },
      { id_metodo_pago: 2, nombre: "Efectivo en entrega", descripcion: null },
    ];
    (listarMetodosPagoDb as jest.Mock).mockResolvedValue(mockMetodos);
    const metodos = await listarMetodosPago();
    expect(metodos).toHaveLength(2);
    expect(metodos[0].nombre).toBe("Transferencia bancaria");
  });
});
