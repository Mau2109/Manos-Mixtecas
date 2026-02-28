jest.mock("../lib/persistence/repositories/empresaRepository", () => ({
  crearEmpresaDb: jest.fn(),
  actualizarEmpresaDb: jest.fn(),
  obtenerEmpresaDb: jest.fn(),
  obtenerMisionYValoresDb: jest.fn(),
  obtenerContactoYRedesDb: jest.fn(),
  obtenerUbicacionEmpresaDb: jest.fn(),
}));

import {
  crearEmpresa,
  actualizarEmpresa,
  obtenerEmpresa,
  obtenerMisionYValores,
  obtenerContactoYRedes,
  obtenerUbicacionEmpresa,
} from "../lib/services/empresaService";
import {
  actualizarEmpresaDb,
  crearEmpresaDb,
  obtenerContactoYRedesDb,
  obtenerEmpresaDb,
  obtenerMisionYValoresDb,
  obtenerUbicacionEmpresaDb,
} from "../lib/persistence/repositories/empresaRepository";

beforeEach(() => {
  jest.clearAllMocks();
});

// ─── ADM09 ─────────────────────────────────────────────────────────────────
describe("ADM09 - Crear empresa", () => {
  test("Crea empresa correctamente", async () => {
    (crearEmpresaDb as jest.Mock).mockResolvedValue({ id_empresa: 1, nombre: "Manos Mixtecas" });
    const empresa = await crearEmpresa({ nombre: "Manos Mixtecas" });
    expect(empresa).toBeDefined();
  });

  test("Error si falta nombre", async () => {
    await expect(crearEmpresa({ nombre: "" })).rejects.toThrow("El nombre de la empresa es obligatorio");
  });
});

// ─── ADM10 ─────────────────────────────────────────────────────────────────
describe("ADM10 - Actualizar empresa", () => {
  test("Actualiza empresa correctamente", async () => {
    (actualizarEmpresaDb as jest.Mock).mockResolvedValue({ id_empresa: 1, nombre: "Manos Mixtecas Actualizada" });
    const empresa = await actualizarEmpresa(1, { nombre: "Manos Mixtecas Actualizada" });
    expect(empresa).toBeDefined();
  });

  test("Error si no se envía ID", async () => {
    await expect(actualizarEmpresa(0, { nombre: "Test" })).rejects.toThrow("ID de empresa requerido");
  });
});

// ─── ADM11 ─────────────────────────────────────────────────────────────────
describe("ADM11 - Obtener empresa completa", () => {
  test("Retorna todos los datos de la empresa", async () => {
    (obtenerEmpresaDb as jest.Mock).mockResolvedValue({ id_empresa: 1, nombre: "Manos Mixtecas", mision: "Preservar artesanías" });
    const empresa = await obtenerEmpresa();
    expect(empresa).toBeDefined();
  });
});

// ─── USD11 ─────────────────────────────────────────────────────────────────
describe("USD11 - Misión y valores", () => {
  test("Retorna misión y valores de la empresa", async () => {
    const mockData = {
      mision: "Preservar y difundir las artesanías oaxaqueñas",
      valores: "Respeto, autenticidad, comunidad",
    };
    (obtenerMisionYValoresDb as jest.Mock).mockResolvedValue(mockData);
    const datos = await obtenerMisionYValores();
    expect(datos.mision).toBeDefined();
    expect(datos.valores).toBeDefined();
  });
});

// ─── USD19 / USD20 ─────────────────────────────────────────────────────────
describe("USD19/20 - Contacto y redes sociales", () => {
  test("Retorna teléfono, email y redes sociales", async () => {
    const mockData = {
      telefono: "9510000000",
      email: "contacto@manosmixtecas.com",
      redes_sociales: { instagram: "@manosmixtecas", facebook: "ManosMinxtecas" },
      formulario_contacto_email: "contacto@manosmixtecas.com",
    };
    (obtenerContactoYRedesDb as jest.Mock).mockResolvedValue(mockData);
    const contacto = await obtenerContactoYRedes();
    expect(contacto.redes_sociales).toBeDefined();
    expect(contacto.email).toBe("contacto@manosmixtecas.com");
  });
});

// ─── USD28 ─────────────────────────────────────────────────────────────────
describe("USD28 - Mostrar ubicacion", () => {
  test("Retorna direccion de la empresa (implementacion parcial)", async () => {
    (obtenerUbicacionEmpresaDb as jest.Mock).mockResolvedValue({
      direccion: "Av. Juarez 123, Oaxaca",
    });

    const ubicacion = await obtenerUbicacionEmpresa();
    expect(ubicacion.direccion).toBe("Av. Juarez 123, Oaxaca");
  });
});
