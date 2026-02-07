jest.mock("../lib/supabaseClient", () => ({
  supabase: {
    from: jest.fn(() => ({
      insert: jest.fn().mockReturnThis(),
      update: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn().mockResolvedValue({
        data: { id_producto: 1, stock: 10 },
        error: null,
      }),
    })),
  },
}));

import {
  consultarStock,
  crearProducto,
  actualizarProducto,
  eliminarProducto,
} from "../lib/services/productoService";

/* ===============================
   Test existente (NO se rompe)
   =============================== */
test("Consultar stock de producto", async () => {
  const stock = await consultarStock(1);
  expect(stock).toBe(10);
});

/* ===============================
   ADM02 - Crear producto
   =============================== */
test("Crear producto correctamente", async () => {
  const producto = await crearProducto({
    nombre: "Artesanía",
    precio: 200,
    stock: 5,
    id_categoria: 1,
  });

  expect(producto).toBeDefined();
});

/* ===============================
   ADM03 - Actualizar producto
   =============================== */
test("Actualizar producto correctamente", async () => {
  const producto = await actualizarProducto(1, {
    precio: 250,
  });

  expect(producto).toBeDefined();
});

/* ===============================
   ADM04 - Eliminar producto (lógico)
   =============================== */
test("Eliminar producto correctamente", async () => {
  const resultado = await eliminarProducto(1);
  expect(resultado).toBe(true);
});
