jest.mock("../lib/services/clienteService", () => ({
  guardarPerfilCliente: jest.fn(),
}));

import { guardarPerfilCliente } from "../lib/services/clienteService";
import { guardarPerfilUsuarioAction } from "../app/usuario/actions";

describe("USD01 - Action para guardar perfil de usuario", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("devuelve el mensaje de error cuando el repositorio lanza un objeto de Supabase", async () => {
    (guardarPerfilCliente as jest.Mock).mockRejectedValue({
      message: 'new row violates row-level security policy for table "clientes"',
    });

    const formData = new FormData();
    formData.set("nombre", "Elena Rodriguez");
    formData.set("email", "elena@artesanal.mx");
    formData.set("telefono", "+52 55 4321 9876");
    formData.set("direccion", "Oaxaca");
    formData.set("fotoPerfil", "https://img.test/elena.jpg");

    const result = await guardarPerfilUsuarioAction(
      { status: "idle", message: "" },
      formData
    );

    expect(result.status).toBe("error");
    expect(result.message).toContain("row-level security policy");
  });

  test("devuelve un mensaje claro cuando falla la conexion con Supabase", async () => {
    (guardarPerfilCliente as jest.Mock).mockRejectedValue({
      message: "TypeError: fetch failed",
      details:
        "ConnectTimeoutError: Connect Timeout Error (attempted addresses: 104.18.38.10:443)",
    });

    const formData = new FormData();
    formData.set("nombre", "Elena Rodriguez");
    formData.set("email", "elena@artesanal.mx");

    const result = await guardarPerfilUsuarioAction(
      { status: "idle", message: "" },
      formData
    );

    expect(result.status).toBe("error");
    expect(result.message).toContain("No se pudo conectar con Supabase");
  });
});
