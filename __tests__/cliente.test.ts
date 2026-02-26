jest.mock("../lib/persistence/repositories/clienteRepository", () => ({
  crearClienteDb: jest.fn(),
}));

import { crearCliente } from "../lib/services/clienteService";
import { crearClienteDb } from "../lib/persistence/repositories/clienteRepository";

test("Crear cliente correctamente", async () => {
  (crearClienteDb as jest.Mock).mockResolvedValue({});
  const cliente = await crearCliente({
    nombre: "Juan",
    email: "juan@mail.com",
  });

  expect(cliente).toBeDefined();
});

test("Error si faltan datos", async () => {
  await expect(
    crearCliente({ nombre: "", email: "" })
  ).rejects.toThrow("Datos obligatorios");
});
