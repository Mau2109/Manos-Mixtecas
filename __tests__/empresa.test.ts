jest.mock("../lib/supabaseClient", () => ({
    supabase: {
      from: jest.fn(() => ({
        insert: jest.fn().mockReturnThis(),
        update: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({ data: {}, error: null }),
      })),
    },
  }));
  
  import {
    crearEmpresa,
    actualizarEmpresa,
    obtenerEmpresa,
  } from "../lib/services/empresaService";
  
  /* ===============================
     ADM09 - Crear empresa
     =============================== */
  test("Crear empresa correctamente", async () => {
    const empresa = await crearEmpresa({
      nombre: "Manos Mixtecas",
      direccion: "Oaxaca",
      telefono: "9510000000",
      email: "contacto@manosmixtecas.com",
    });
  
    expect(empresa).toBeDefined();
  });
  
  /* ===============================
     ADM09 - Validación
     =============================== */
  test("Error si falta el nombre de la empresa", async () => {
    await expect(
      crearEmpresa({ nombre: "" })
    ).rejects.toThrow("El nombre de la empresa es obligatorio");
  });
  
  /* ===============================
     ADM10 - Actualizar empresa
     =============================== */
  test("Actualizar información de la empresa", async () => {
    const empresa = await actualizarEmpresa(1, {
      nombre: "Manos Mixtecas Actualizada",
    });
  
    expect(empresa).toBeDefined();
  });
  
  /* ===============================
     ADM10 - Validación ID
     =============================== */
  test("Error si no se envía el id de empresa", async () => {
    await expect(
      actualizarEmpresa(0, { nombre: "Test" })
    ).rejects.toThrow("ID de empresa requerido");
  });
  
  /* ===============================
     ADM11 - Obtener empresa
     =============================== */
  test("Obtener información de la empresa", async () => {
    const empresa = await obtenerEmpresa();
    expect(empresa).toBeDefined();
  });
  