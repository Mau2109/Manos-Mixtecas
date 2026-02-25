jest.mock("../lib/supabaseClient", () => ({
  supabase: {
    from: jest.fn(),
  },
}));

import {
  crearEmpresa,
  actualizarEmpresa,
  obtenerEmpresa,
  obtenerMisionYValores,
  obtenerContactoYRedes,
} from "../lib/services/empresaService";
import { supabase } from "../lib/supabaseClient";

beforeEach(() => {
  jest.clearAllMocks();
});

function mockSingle(data: unknown) {
  (supabase.from as jest.Mock).mockReturnValue({
    insert: jest.fn().mockReturnThis(),
    update: jest.fn().mockReturnThis(),
    select: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    limit: jest.fn().mockReturnThis(),
    single: jest.fn().mockResolvedValue({ data, error: null }),
  });
}

// ─── ADM09 ─────────────────────────────────────────────────────────────────
describe("ADM09 - Crear empresa", () => {
  test("Crea empresa correctamente", async () => {
    mockSingle({ id_empresa: 1, nombre: "Manos Mixtecas" });
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
    mockSingle({ id_empresa: 1, nombre: "Manos Mixtecas Actualizada" });
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
    mockSingle({ id_empresa: 1, nombre: "Manos Mixtecas", mision: "Preservar artesanías" });
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
    mockSingle(mockData);
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
    mockSingle(mockData);
    const contacto = await obtenerContactoYRedes();
    expect(contacto.redes_sociales).toBeDefined();
    expect(contacto.email).toBe("contacto@manosmixtecas.com");
  });
});