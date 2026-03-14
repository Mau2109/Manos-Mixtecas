jest.mock("../lib/persistence/repositories/contactoRepository", () => ({
  enviarMensajeContactoDb: jest.fn(),
}));

import { enviarMensajeContacto } from "../lib/services/contactoService";
import { enviarMensajeContactoDb } from "../lib/persistence/repositories/contactoRepository";

beforeEach(() => {
  jest.clearAllMocks();
});

describe("USD17 - Mensaje de confirmación (contacto)", () => {
  test("Retorna confirmación cuando el mensaje se envía", async () => {
    (enviarMensajeContactoDb as jest.Mock).mockResolvedValue({ id_mensaje: 123 });

    const res = await enviarMensajeContacto({
      nombre: "Ana",
      email: "ana@mail.com",
      mensaje: "Hola, tengo una duda.",
    });

    expect(res.confirmacion).toBe(true);
    expect(res.id_mensaje).toBe(123);
  });

  test("Error si faltan datos obligatorios", async () => {
    await expect(
      enviarMensajeContacto({ nombre: "", email: "", mensaje: "" })
    ).rejects.toThrow("Datos de contacto obligatorios");
  });
});

