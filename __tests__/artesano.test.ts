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
  categorizarProveedor,
  eliminarArtesano,
  asignarEstatusProveedor,
  obtenerGaleriaArtesano,
  obtenerPerfilArtesano,
  listarTiposArtesano,
  listarArtesanos,
} from "../lib/services/artesanoService";
import {
  crearArtesanoDb,
  actualizarArtesanoDb,
  eliminarArtesanoDb,
  obtenerGaleriaArtesanoDb,
  listarArtesanosDb,
  listarTiposArtesanoDb,
  obtenerPerfilArtesanoDb,
} from "../lib/persistence/repositories/artesanoRepository";
  
beforeEach(() => {
  jest.clearAllMocks();
});

// ─── USD16 / USD23 ─────────────────────────────────────────────
describe("USD16/USD23 - Visualizar perfil del artesano (historia y comunidad)", () => {
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

// ─── Soporte - Listar tipos de artesano ───────────────────────────────
describe("Soporte - Listar tipos de artesano", () => {
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

// ─── ADM24 - Directorio de artesanos/proveedores ────────────────────────────────
describe("ADM24 - Directorio de artesanos/proveedores", () => {
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

// ─── USD27 - Galería de imágenes del artesano ───────────────────────────────
describe("USD27 - Galería de imágenes del artesano", () => {
  test("Retorna la galería de imágenes del artesano", async () => {
    const mockGaleria = [
      { id_imagen: 1, url: "img1.jpg", descripcion: "Foto 1", orden: 0 },
      { id_imagen: 2, url: "img2.jpg", descripcion: "Foto 2", orden: 1 },
    ];
    (obtenerGaleriaArtesanoDb as jest.Mock).mockResolvedValue(mockGaleria);

    const galeria = await obtenerGaleriaArtesano(1);
    expect(galeria).toHaveLength(2);
  });

  test("Error si no se envía ID de artesano", async () => {
    await expect(obtenerGaleriaArtesano(0)).rejects.toThrow("ID de artesano requerido");
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

// ─── ADM27 - Categorización de proveedores ────────────────────────────────
describe("ADM27 - Categorización de proveedores", () => {
  test("Actualiza la categoría del proveedor/artesano", async () => {
    (actualizarArtesanoDb as jest.Mock).mockResolvedValue({ id_artesano: 1, id_categoria: 2 });

    const resultado = await categorizarProveedor(1, 2);
    expect(actualizarArtesanoDb).toHaveBeenCalledWith(1, { id_categoria: 2 });
    expect(resultado).toBeDefined();
  });

  test("Error si falta ID de categoría", async () => {
    await expect(categorizarProveedor(1, 0)).rejects.toThrow("ID de categoría requerido");
  });
});

// ─── ADM33 - Asignar estatus proveedor ────────────────────────────────────
describe("ADM33 - Asignar estatus proveedor (activo/inactivo)", () => {
  test("Marca proveedor como inactivo (estado=false)", async () => {
    (actualizarArtesanoDb as jest.Mock).mockResolvedValue({ id_artesano: 1, estado: false });

    const resultado = await asignarEstatusProveedor(1, false);
    expect(actualizarArtesanoDb).toHaveBeenCalledWith(1, { estado: false });
    expect(resultado).toBeDefined();
  });
});
