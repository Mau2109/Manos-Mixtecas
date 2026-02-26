jest.mock("../lib/persistence/repositories/proveedorRepository", () => ({
  crearProveedorDb: jest.fn(),
  actualizarProveedorDb: jest.fn(),
  eliminarProveedorDb: jest.fn(),
  obtenerProveedoresDb: jest.fn(),
}));

import {
  crearProveedor,
  actualizarProveedor,
  eliminarProveedor,
  obtenerProveedores,
} from "../lib/services/proveedorService";
import {
  actualizarProveedorDb,
  crearProveedorDb,
  eliminarProveedorDb,
  obtenerProveedoresDb,
} from "../lib/persistence/repositories/proveedorRepository";

/* ===============================
   ADM05 - Crear proveedor
   =============================== */
test("Crear proveedor correctamente", async () => {
  (crearProveedorDb as jest.Mock).mockResolvedValue({ id_proveedor: 1 });
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
  (actualizarProveedorDb as jest.Mock).mockResolvedValue({ id_proveedor: 1 });
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
  (eliminarProveedorDb as jest.Mock).mockResolvedValue(true);
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

  (obtenerProveedoresDb as jest.Mock).mockResolvedValue(proveedoresMock);

  const proveedores = await obtenerProveedores();

  expect(proveedores).toBeDefined();
  expect(proveedores.length).toBe(2);
});
