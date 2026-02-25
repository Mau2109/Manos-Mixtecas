jest.mock("../lib/supabaseClient", () => ({
  supabase: {
    from: jest.fn(() => ({
      insert: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      single: jest.fn().mockResolvedValue({ data: {}, error: null }),
    })),
  },
}));

import { crearCliente } from "../lib/services/clienteService";

test("Crear cliente correctamente", async () => {
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