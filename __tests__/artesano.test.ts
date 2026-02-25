jest.mock("../lib/supabaseClient", () => ({
    supabase: {
      from: jest.fn(),
    },
  }));
  
  import {
    obtenerPerfilArtesano,
    listarTiposArtesano,
    listarArtesanos,
  } from "../lib/services/artesanoService";
  import { supabase } from "../lib/supabaseClient";
  
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
      (supabase.from as jest.Mock).mockReturnValue({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({ data: mockArtesano, error: null }),
      });
  
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
      (supabase.from as jest.Mock).mockReturnValue({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        not: jest.fn().mockResolvedValue({
          data: [{ tipo: "Tejedor" }, { tipo: "Alfarero" }, { tipo: "Tejedor" }],
          error: null,
        }),
      });
  
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
      (supabase.from as jest.Mock).mockReturnValue({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockResolvedValue({ data: mockArtesanos, error: null }),
      });
  
      const artesanos = await listarArtesanos();
      expect(artesanos).toHaveLength(2);
    });
  });