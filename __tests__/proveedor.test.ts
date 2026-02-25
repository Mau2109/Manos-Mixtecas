jest.mock("../lib/supabaseClient", () => ({
  supabase: {
    from: jest.fn(() => ({
      insert: jest.fn().mockReturnThis(),
      update: jest.fn().mockReturnThis(),
      delete: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      order: jest.fn().mockReturnThis(),
      single: jest.fn().mockResolvedValue({ data: {}, error: null }),
    })),
  },
}));

import {
  crearProveedor,
  actualizarProveedor,
  eliminarProveedor,
  obtenerProveedores,
} from "../lib/services/proveedorService";

/* ===============================
   ADM05 - Crear proveedor
   =============================== */
test("Crear proveedor correctamente", async () => {
  const proveedor = await crearProveedor({
    nombre: "Artesanos Mixtecos",
    telefono: "9511234567",
    email: "artesanos@mail.com",
  });

  expect(proveedor).toBeDefined();
});

/* ===============================
   ADM05 - Validación
   =============================== */
test("Error si falta el nombre del proveedor", async () => {
  await expect(
    crearProveedor({ nombre: "" })
  ).rejects.toThrow("El nombre del proveedor es obligatorio");
});

/* ===============================
   ADM06 - Actualizar proveedor
   =============================== */
test("Actualizar proveedor correctamente", async () => {
  const proveedor = await actualizarProveedor(1, {
    telefono: "9519999999",
  });

  expect(proveedor).toBeDefined();
});

/* ===============================
   ADM06 - Validación ID
   =============================== */
test("Error si no se envía el id del proveedor al actualizar", async () => {
  await expect(
    actualizarProveedor(0, { nombre: "Test" })
  ).rejects.toThrow("ID de proveedor requerido");
});

/* ===============================
   ADM07 - Eliminar proveedor
   =============================== */
test("Eliminar proveedor correctamente", async () => {
  const resultado = await eliminarProveedor(1);
  expect(resultado).toBe(true);
});

/* ===============================
   ADM07 - Validación ID
   =============================== */
test("Error si no se envía el id del proveedor al eliminar", async () => {
  await expect(eliminarProveedor(0)).rejects.toThrow(
    "ID de proveedor requerido"
  );
});

/* ===============================
   Extra- Obtener proveedores
   =============================== */
test("Obtener lista de proveedores", async () => {
  const proveedoresMock = [
      { id_proveedor: 1, nombre: "Proveedor 1" },
      { id_proveedor: 2, nombre: "Proveedor 2" },
  ];
  
  const { supabase } = require("../lib/supabaseClient");
  
  supabase.from.mockReturnValueOnce({
      select: jest.fn().mockReturnThis(),
      order: jest.fn().mockResolvedValue({
      data: proveedoresMock,
      error: null,
      }),
  });
  
  const proveedores = await obtenerProveedores();
  
  expect(proveedores).toBeDefined();
  expect(proveedores.length).toBe(2);
});
    