jest.mock("../lib/supabaseClient", () => ({
  supabase: {
    from: jest.fn(() => ({
      insert: jest.fn().mockReturnThis(),
    })),
  },
}));

import { agregarProductoCarrito } from "../lib/services/carritoService";

test("Agregar producto al carrito", async () => {
  const resultado = await agregarProductoCarrito(1, 1, 2, 100);
  expect(resultado).toBe(true);
});

test("Error si cantidad inválida", async () => {
  await expect(
    agregarProductoCarrito(1, 1, 0, 100)
  ).rejects.toThrow("Cantidad inválida");
});
