jest.mock("../lib/persistence/repositories/artesanoRepository", () => ({
  crearArtesanoDb: jest.fn(),
  actualizarArtesanoDb: jest.fn(),
  eliminarArtesanoDb: jest.fn(),
  obtenerPerfilArtesanoDb: jest.fn(),
  obtenerGaleriaArtesanoDb: jest.fn(),
  listarTiposArtesanoDb: jest.fn(),
  listarArtesanosDb: jest.fn(),
}));

import {
  crearArtesano,
  actualizarArtesano,
  eliminarArtesano,
  obtenerPerfilArtesano,
  listarTiposArtesano,
  listarArtesanos,
} from "../lib/services/artesanoService";
import {
  crearArtesanoDb,
  actualizarArtesanoDb,
  eliminarArtesanoDb,
  listarArtesanosDb,
  listarTiposArtesanoDb,
  obtenerPerfilArtesanoDb,
} from "../lib/persistence/repositories/artesanoRepository";
  
beforeEach(() => {
  jest.clearAllMocks();
});

// ─── USD16 / USD22 / USD24 / USD28 / USD29 ────────────────────────────────
describe("USD16/22/24/28/29 - Perfil del artesano", () => {
  test("Retorna perfil completo del artesano (bio, comunidad, historia, ubicación)", async () => {
    const mockArtesano = {
      id_artesano: 1,
      nombre: "María",
      apellido: "García",
      biografia: "Tejedora de Teotitlán",
      tipo: "Tejedor",
      comunidad: "Teotitlán del Valle",
      historia: "Generaciones de tejedores...",
      ubicacion: "Oaxaca, México",
      foto_perfil: "https://ejemplo.com/foto.jpg",
      telefono: "9510000000",
      email: "maria@ejemplo.com",
      categorias: { nombre: "Textiles" },
    };
    (obtenerPerfilArtesanoDb as jest.Mock).mockResolvedValue(mockArtesano);

    const artesano = await obtenerPerfilArtesano(1);
    expect(artesano.nombre).toBe("María");
    expect(artesano.comunidad).toBe("Teotitlán del Valle");
    expect(artesano.historia).toBeDefined();
    expect(artesano.ubicacion).toBe("Oaxaca, México");
  });

  test("Error si no se envía ID de artesano", async () => {
    await expect(obtenerPerfilArtesano(0)).rejects.toThrow("ID de artesano requerido");
  });
});

// ─── USD21 - Tipos de artesano para filtros ───────────────────────────────
describe("USD21 - Listar tipos de artesano", () => {
  test("Retorna lista de tipos únicos de artesano", async () => {
    (listarTiposArtesanoDb as jest.Mock).mockResolvedValue([
      { tipo: "Tejedor" },
      { tipo: "Alfarero" },
      { tipo: "Tejedor" },
    ]);

    const tipos = await listarTiposArtesano();
    expect(tipos).toContain("Tejedor");
    expect(tipos).toContain("Alfarero");
    // Verifica que no haya duplicados
    expect(tipos.length).toBe(new Set(tipos).size);
  });
});

// ─── USD21 / USD25 - Listar artesanos ─────────────────────────────────────
describe("USD21/25 - Listar todos los artesanos", () => {
  test("Retorna lista de artesanos activos", async () => {
    const mockArtesanos = [
      { id_artesano: 1, nombre: "María", tipo: "Tejedor", comunidad: "Teotitlán" },
      { id_artesano: 2, nombre: "Juan", tipo: "Alfarero", comunidad: "Coyotepec" },
    ];
    (listarArtesanosDb as jest.Mock).mockResolvedValue(mockArtesanos);

    const artesanos = await listarArtesanos();
    expect(artesanos).toHaveLength(2);
  });
});

// ─── ADM08 - Registrar artesano ────────────────────────────────
describe("ADM08 - Registrar artesano", () => {
  test("Crea artesano correctamente", async () => {
    (crearArtesanoDb as jest.Mock).mockResolvedValue({ id_artesano: 1 });
    const artesano = await crearArtesano({ nombre: "María" });
    expect(artesano).toBeDefined();
  });

  test("Error si falta el nombre del artesano", async () => {
    await expect(crearArtesano({ nombre: "" })).rejects.toThrow(
      "El nombre del artesano es obligatorio"
    );
  });
});

// ─── ADM10 - Actualizar artesano ────────────────────────────────
describe("ADM10 - Actualizar artesano", () => {
  test("Actualiza artesano correctamente", async () => {
    (actualizarArtesanoDb as jest.Mock).mockResolvedValue({ id_artesano: 1 });
    const artesano = await actualizarArtesano(1, { telefono: "9510000000" });
    expect(artesano).toBeDefined();
  });

  test("Error si no se envía el id del artesano", async () => {
    await expect(actualizarArtesano(0, { nombre: "Test" })).rejects.toThrow(
      "ID de artesano requerido"
    );
  });
});

// ─── ADM11 - Eliminar artesano ────────────────────────────────
describe("ADM11 - Eliminar artesano", () => {
  test("Elimina artesano correctamente", async () => {
    (eliminarArtesanoDb as jest.Mock).mockResolvedValue(true);
    const resultado = await eliminarArtesano(1);
    expect(resultado).toBe(true);
  });

  test("Error si no se envía el id del artesano al eliminar", async () => {
    await expect(eliminarArtesano(0)).rejects.toThrow("ID de artesano requerido");
  });
});
