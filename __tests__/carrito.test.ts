jest.mock("../lib/supabaseClient", () => ({
  supabase: {
    from: jest.fn(() => ({
      insert: jest.fn().mockReturnThis(),
      delete: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
    })),
  },
}));

import { agregarProductoCarrito, eliminarProductoCarrito } from "../lib/services/carritoService";
import { supabase } from "../lib/supabaseClient";

test("Agregar producto al carrito", async () => {
  const resultado = await agregarProductoCarrito(1, 1, 2, 100);
  expect(resultado).toBe(true);
});

test("Error si cantidad inválida", async () => {
  await expect(
    agregarProductoCarrito(1, 1, 0, 100)
  ).rejects.toThrow("Cantidad inválida");
});

describe("Eliminar producto del carrito", () => {
  test("Elimina un producto del carrito correctamente", async () => {
    // Mock del delete exitoso
    (supabase.from as jest.Mock).mockReturnValue({
      delete: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
    });

    const resultado = await eliminarProductoCarrito(1, 5);

    expect(resultado).toBe(true);
    expect(supabase.from).toHaveBeenCalledWith("carrito");
  });
});