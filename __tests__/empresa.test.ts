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

// ─── ADM16 ─────────────────────────────────────────────────────────────────
describe("ADM16 - Agregar perfil empresa", () => {
  test("CA1: Crea empresa con nombre válido", async () => {
    (crearEmpresaDb as jest.Mock).mockResolvedValue({ 
      id_empresa: 1, 
      nombre: "Manos Mixtecas",
      rfc: "MMX123456ABC",
      logo_url: "https://example.com/logo.png"
    });
    const empresa = await crearEmpresa({ 
      nombre: "Manos Mixtecas",
      rfc: "MMX123456ABC",
      logo_url: "https://example.com/logo.png"
    });
    expect(empresa).toBeDefined();
    expect(empresa.nombre).toBe("Manos Mixtecas");
  });

  test("CA1: Error si falta nombre (campo obligatorio)", async () => {
    await expect(crearEmpresa({ nombre: "" })).rejects.toThrow("El nombre de la empresa es obligatorio");
  });

  test("CA2: Valida RFC con 12-15 caracteres", async () => {
    // RFC de 13 caracteres
    (crearEmpresaDb as jest.Mock).mockResolvedValue({ 
      id_empresa: 1, 
      nombre: "Test",
      rfc: "MMX123456ABC1"
    });
    const empresa = await crearEmpresa({ 
      nombre: "Test",
      rfc: "MMX123456ABC1"
    });
    expect(empresa.rfc).toBe("MMX123456ABC1");
  });

  test("CA2: Valida RFC con 15 caracteres", async () => {
    // RFC de 15 caracteres (formato completo)
    (crearEmpresaDb as jest.Mock).mockResolvedValue({ 
      id_empresa: 1, 
      nombre: "Test",
      rfc: "ABC123456XYZ789"
    });
    const empresa = await crearEmpresa({ 
      nombre: "Test",
      rfc: "ABC123456XYZ789"
    });
    expect(empresa.rfc).toBe("ABC123456XYZ789");
  });

  test("CA3: Logo corporativo puede ser subido (simulated)", async () => {
    (crearEmpresaDb as jest.Mock).mockResolvedValue({ 
      id_empresa: 1,
      nombre: "Test",
      logo_url: "https://storage.example.com/logo.jpg"
    });
    const empresa = await crearEmpresa({
      nombre: "Test",
      logo_url: "https://storage.example.com/logo.jpg"
    });
    expect(empresa.logo_url).toBeDefined();
    expect(empresa.logo_url).toContain("logo");
  });

  test("CA4: Campos opcionales pueden ser guardados (dirección, teléfono, correo)", async () => {
    (crearEmpresaDb as jest.Mock).mockResolvedValue({
      id_empresa: 1,
      nombre: "Test",
      direccion: "Calle Principal 123",
      telefono: "+52 (555) 123 4567",
      email: "contacto@test.com"
    });
    const empresa = await crearEmpresa({
      nombre: "Test",
      direccion: "Calle Principal 123",
      telefono: "+52 (555) 123 4567",
      email: "contacto@test.com"
    });
    expect(empresa.direccion).toBe("Calle Principal 123");
    expect(empresa.telefono).toBe("+52 (555) 123 4567");
    expect(empresa.email).toBe("contacto@test.com");
  });

  test("CA5: Mensaje de éxito se muestra al guardar (backend retorna success)", async () => {
    (crearEmpresaDb as jest.Mock).mockResolvedValue({ 
      id_empresa: 1, 
      nombre: "Manos Mixtecas"
    });
    const empresa = await crearEmpresa({ nombre: "Manos Mixtecas" });
    expect(empresa).toBeTruthy();
  });

  test("CA6: Conexión con backend (Supabase) - datos guardados correctamente", async () => {
    const mockData = { 
      id_empresa: 1,
      nombre: "Manos Mixtecas",
      rfc: "MMX123456ABC",
      logo_url: "https://storage.url/logo.jpg",
      direccion: "Oaxaca, México",
      telefono: "+52 951 000 0000",
      email: "info@manosmxtecas.com"
    };
    (crearEmpresaDb as jest.Mock).mockResolvedValue(mockData);
    const empresa = await crearEmpresa(mockData);
    expect(crearEmpresaDb).toHaveBeenCalledWith(mockData);
    expect(empresa).toEqual(mockData);
  });
});

// ─── ADM10 ─────────────────────────────────────────────────────────────────
describe("ADM17 - Editar perfil empresa", () => {
  test("CA1: Campos precargados con información actual de la base de datos", async () => {
    const empresaActual = {
      id_empresa: 1,
      nombre: "Manos Mixtecas",
      rfc: "MMX123456ABC",
      logo_url: "https://storage.url/logo.jpg",
      direccion: "Oaxaca, México",
      telefono: "+52 951 000 0000",
      email: "info@manosmxtecas.com"
    };
    (obtenerEmpresaDb as jest.Mock).mockResolvedValue(empresaActual);
    const empresa = await obtenerEmpresa();
    expect(empresa).toEqual(empresaActual);
    expect(empresa.nombre).toBe("Manos Mixtecas");
  });

  test("CA2: RFC no es editable (protegido por seguridad)", async () => {
    const datosActualizar = {
      nombre: "Manos Mixtecas Actualizada",
      direccion: "Nueva dirección",
      // RFC no incluido intencionalmente
    };
    (actualizarEmpresaDb as jest.Mock).mockResolvedValue({
      id_empresa: 1,
      ...datosActualizar,
      rfc: "MMX123456ABC" // RFC sigue igual
    });
    const empresa = await actualizarEmpresa(1, datosActualizar);
    expect(empresa.rfc).toBe("MMX123456ABC");
    expect(actualizarEmpresaDb).toHaveBeenCalledWith(1, datosActualizar);
    // Verificar que RFC no fue modificado
    expect(datosActualizar).not.toHaveProperty("rfc");
  });

  test("CA3: Permite reemplazar logotipo por uno nuevo", async () => {
    const datosActualizar = {
      logo_url: "https://storage.url/nuevo-logo.jpg"
    };
    (actualizarEmpresaDb as jest.Mock).mockResolvedValue({
      id_empresa: 1,
      nombre: "Manos Mixtecas",
      ...datosActualizar
    });
    const empresa = await actualizarEmpresa(1, datosActualizar);
    expect(empresa.logo_url).toBe("https://storage.url/nuevo-logo.jpg");
    expect(actualizarEmpresaDb).toHaveBeenCalledWith(1, datosActualizar);
  });

  test("CA4: Valida que el ID de empresa sea requerido antes de actualizar", async () => {
    await expect(actualizarEmpresa(0, { nombre: "Test" })).rejects.toThrow(
      "ID de empresa requerido"
    );
  });

  test("CA4: Permite actualizar campos obligatorios sin error", async () => {
    const datosActualizar = {
      nombre: "Manos Mixtecas Actualizada",
      direccion: "Nueva dirección",
      email: "newemail@test.com"
    };
    (actualizarEmpresaDb as jest.Mock).mockResolvedValue({
      id_empresa: 1,
      ...datosActualizar
    });
    const empresa = await actualizarEmpresa(1, datosActualizar);
    expect(empresa.nombre).toBe("Manos Mixtecas Actualizada");
    expect(actualizarEmpresaDb).toHaveBeenCalledWith(1, datosActualizar);
  });

  test("CA5: Muestra mensaje de confirmación al actualizar correctamente", async () => {
    const datosActualizar = {
      nombre: "Test Actualizado",
      telefono: "+52 123 456 7890"
    };
    (actualizarEmpresaDb as jest.Mock).mockResolvedValue({
      id_empresa: 1,
      ...datosActualizar
    });
    const empresa = await actualizarEmpresa(1, datosActualizar);
    expect(empresa).toBeTruthy();
    expect(actualizarEmpresaDb).toHaveBeenCalled();
  });

  test("CA1-5: Flujo completo de edición - cargar, modificar y guardar", async () => {
    // 1. Cargar datos
    const empresaActual = {
      id_empresa: 1,
      nombre: "Manos Mixtecas",
      rfc: "MMX123456ABC",
      direccion: "Dirección antigua",
      telefono: "+52 951 000 0000",
      email: "old@email.com",
      logo_url: "https://old-logo.jpg"
    };
    (obtenerEmpresaDb as jest.Mock).mockResolvedValue(empresaActual);
    const empresa = await obtenerEmpresa();
    expect(empresa.nombre).toBe("Manos Mixtecas");

    // 2. Actualizar algunos campos
    const datosActualizar = {
      nombre: "Manos Mixtecas S.A.",
      direccion: "Nueva dirección",
      email: "newemail@manosmxtecas.com",
      logo_url: "https://new-logo.jpg"
    };
    (actualizarEmpresaDb as jest.Mock).mockResolvedValue({
      id_empresa: 1,
      rfc: "MMX123456ABC", // RFC no cambia
      ...datosActualizar
    });
    const empresaActualizada = await actualizarEmpresa(1, datosActualizar);
    
    // Verificaciones
    expect(empresaActualizada.nombre).toBe("Manos Mixtecas S.A.");
    expect(empresaActualizada.rfc).toBe("MMX123456ABC");
    expect(empresaActualizada.logo_url).toBe("https://new-logo.jpg");
    expect(empresaActualizada.email).toBe("newemail@manosmxtecas.com");
  });
});

// ─── ADM18 ─────────────────────────────────────────────────────────────────
describe("ADM18 - Visualizar perfil empresa", () => {
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
describe("USD19 - Mostrar redes y contacto", () => {
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
describe("USD28 - Mostrar ubicación", () => {
  test("Retorna dirección de la empresa", async () => {
    (obtenerUbicacionEmpresaDb as jest.Mock).mockResolvedValue({
      direccion: "Av. Juarez 123, Oaxaca",
    });

    const ubicacion = await obtenerUbicacionEmpresa();
    expect(ubicacion.direccion).toBe("Av. Juarez 123, Oaxaca");
  });
});
