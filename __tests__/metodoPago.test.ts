jest.mock("../lib/persistence/repositories/metodoPagoRepository", () => ({
  crearMetodoPagoDb: jest.fn().mockResolvedValue({
    id_metodo_pago: 1,
    nombre: "Tarjeta de Crédito",
    descripcion: "Pago con tarjeta de crédito",
    estado: true,
  }),
  listarMetodosPagoDb: jest.fn().mockResolvedValue([
    {
      id_metodo_pago: 1,
      nombre: "Tarjeta de Crédito",
      descripcion: "Pago con tarjeta de crédito",
      estado: true,
    },
    {
      id_metodo_pago: 2,
      nombre: "Transferencia Bancaria",
      descripcion: "Pago por transferencia",
      estado: true,
    },
  ]),
  listarTodosMetodosPagoDb: jest.fn().mockResolvedValue([
    {
      id_metodo_pago: 1,
      nombre: "Tarjeta de Crédito",
      descripcion: "Pago con tarjeta de crédito",
      estado: true,
    },
    {
      id_metodo_pago: 2,
      nombre: "Transferencia Bancaria",
      descripcion: "Pago por transferencia",
      estado: true,
    },
  ]),
  obtenerMetodoPagoDb: jest.fn().mockResolvedValue({
    id_metodo_pago: 1,
    nombre: "Tarjeta de Crédito",
    descripcion: "Pago con tarjeta de crédito",
    estado: true,
  }),
  actualizarMetodoPagoDb: jest.fn().mockResolvedValue({
    id_metodo_pago: 1,
    nombre: "Tarjeta de Débito",
    descripcion: "Pago con tarjeta de débito",
    estado: true,
  }),
  desactivarMetodoPagoDb: jest.fn().mockResolvedValue({
    id_metodo_pago: 1,
    nombre: "Tarjeta de Crédito",
    estado: false,
  }),
  reactivarMetodoPagoDb: jest.fn().mockResolvedValue({
    id_metodo_pago: 1,
    nombre: "Tarjeta de Crédito",
    estado: true,
  }),
}));

import {
  crearMetodoPago,
  listarMetodosPago,
  listarTodosMetodosPago,
  obtenerMetodoPago,
  actualizarMetodoPago,
  desactivarMetodoPago,
  reactivarMetodoPago,
} from "../lib/services/metodoPagoService";

/* ===============================
   Crear método de pago
   =============================== */
describe("Crear método de pago", () => {
  test("Crear método de pago correctamente", async () => {
    const metodo = await crearMetodoPago({
      nombre: "Tarjeta de Crédito",
      descripcion: "Pago con tarjeta de crédito",
    });

    expect(metodo).toBeDefined();
    expect(metodo.nombre).toBe("Tarjeta de Crédito");
    expect(metodo.estado).toBe(true);
  });

  test("Error si falta el nombre del método", async () => {
    await expect(
      crearMetodoPago({ nombre: "" })
    ).rejects.toThrow("El nombre del método de pago es obligatorio");
  });

  test("Error si el nombre contiene solo espacios", async () => {
    await expect(
      crearMetodoPago({ nombre: "   " })
    ).rejects.toThrow("El nombre del método de pago es obligatorio");
  });
});

/* ===============================
   Listar métodos de pago activos
   =============================== */
describe("Listar métodos de pago activos", () => {
  test("Listar métodos de pago correctamente", async () => {
    const metodos = await listarMetodosPago();

    expect(metodos).toBeDefined();
    expect(Array.isArray(metodos)).toBe(true);
  });
});

/* ===============================
   Listar todos los métodos (incluye inactivos)
   =============================== */
describe("Listar todos los métodos de pago", () => {
  test("Listar todos los métodos incluyendo inactivos", async () => {
    const metodos = await listarTodosMetodosPago();

    expect(metodos).toBeDefined();
    expect(Array.isArray(metodos)).toBe(true);
  });
});

/* ===============================
   Obtener método de pago por ID
   =============================== */
describe("Obtener método de pago por ID", () => {
  test("Obtener método de pago correctamente", async () => {
    const metodo = await obtenerMetodoPago(1);

    expect(metodo).toBeDefined();
    expect(metodo.id_metodo_pago).toBe(1);
  });

  test("Error si no se envía el ID", async () => {
    await expect(obtenerMetodoPago(0)).rejects.toThrow(
      "ID de método de pago requerido"
    );
  });
});

/* ===============================
   Actualizar método de pago
   =============================== */
describe("Actualizar método de pago", () => {
  test("Actualizar nombre del método", async () => {
    const metodo = await actualizarMetodoPago(1, {
      nombre: "Tarjeta de Débito",
    });

    expect(metodo).toBeDefined();
  });

  test("Error si el nuevo nombre está vacío", async () => {
    await expect(
      actualizarMetodoPago(1, { nombre: "" })
    ).rejects.toThrow("El nombre del método de pago no puede estar vacío");
  });

  test("Error si no se envía el ID", async () => {
    await expect(
      actualizarMetodoPago(0, { nombre: "Nuevo nombre" })
    ).rejects.toThrow("ID de método de pago requerido");
  });
});

/* ===============================
   Desactivar método de pago
   =============================== */
describe("Desactivar método de pago", () => {
  test("Desactivar método de pago correctamente", async () => {
    const metodo = await desactivarMetodoPago(1);

    expect(metodo).toBeDefined();
  });

  test("Error si no se envía el ID", async () => {
    await expect(desactivarMetodoPago(0)).rejects.toThrow(
      "ID de método de pago requerido"
    );
  });
});

/* ===============================
   Reactivar método de pago
   =============================== */
describe("Reactivar método de pago", () => {
  test("Reactivar método de pago correctamente", async () => {
    const metodo = await reactivarMetodoPago(1);

    expect(metodo).toBeDefined();
  });

  test("Error si no se envía el ID", async () => {
    await expect(reactivarMetodoPago(0)).rejects.toThrow(
      "ID de método de pago requerido"
    );
  });
});
