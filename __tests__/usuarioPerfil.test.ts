jest.mock("../lib/persistence/repositories/clienteRepository", () => ({
  crearClienteDb: jest.fn(),
  guardarPerfilClienteDb: jest.fn(),
}));

import { guardarPerfilCliente } from "../lib/services/clienteService";
import { guardarPerfilClienteDb } from "../lib/persistence/repositories/clienteRepository";

describe("USD01 - Guardar perfil ampliado de cliente", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("guarda perfil con campos saneados", async () => {
    (guardarPerfilClienteDb as jest.Mock).mockResolvedValue({
      cliente: { id_cliente: 7, nombre: "Elena Rodriguez" },
      partialSave: false,
    });

    const result = await guardarPerfilCliente({
      nombre: " Elena Rodriguez ",
      email: " elena@artesanal.mx ",
      telefono: " +52 55 4321 9876 ",
      direccion: " Oaxaca ",
      foto_perfil: " https://img.test/elena.jpg ",
    });

    expect(guardarPerfilClienteDb).toHaveBeenCalledWith({
      nombre: "Elena Rodriguez",
      email: "elena@artesanal.mx",
      telefono: "+52 55 4321 9876",
      direccion: "Oaxaca",
      foto_perfil: "https://img.test/elena.jpg",
      codigo_cliente: undefined,
    });
    expect(result.cliente.id_cliente).toBe(7);
  });

  test("lanza error si faltan datos principales", async () => {
    await expect(
      guardarPerfilCliente({
        nombre: "",
        email: "",
      })
    ).rejects.toThrow("Nombre y email son obligatorios");
  });
});
