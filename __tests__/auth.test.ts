jest.mock("../lib/persistence/repositories/loginRepository", () => ({
  loginAdministradorDb: jest.fn(),
  crearUsuarioDb: jest.fn(),
}));

import { loginAdministrador } from "../lib/services/loginServices";
import { crearUsuario } from "../lib/services/loginServices";
import {
  crearUsuarioDb,
  loginAdministradorDb,
} from "../lib/persistence/repositories/loginRepository";

describe("ADM01 - Inicio de sesión administrador", () => {
  test("Login administrador correcto", async () => {
    (loginAdministradorDb as jest.Mock).mockResolvedValue({
      id_usuario: 1,
      nombre: "Admin",
      email: "admin@mail.com",
      id_rol: 1,
    });
    const usuario = await loginAdministrador("admin@mail.com", "1234");

    expect(usuario).toBeDefined();
    expect(usuario.email).toBe("admin@mail.com");
  });

  test("Error si faltan credenciales", async () => {
    await expect(loginAdministrador("", "")).rejects.toThrow(
      "Credenciales obligatorias"
    );
  });
});

describe("ADM20/ADM23 - Crear usuario y asignar rol", () => {
  test("Crear usuario con rol correctamente", async () => {
    (crearUsuarioDb as jest.Mock).mockResolvedValue({
      id_usuario: 1,
      nombre: "Administrador",
      email: "admin@mail.com",
      id_rol: 1,
    });
    const usuario = await crearUsuario({
      nombre: "Administrador",
      email: "admin@mail.com",
      password: "1234",
      id_rol: 1, // Administrador
    });

    expect(usuario).toBeDefined();
    expect(usuario.id_rol).toBe(1);
  });

  test("Error si faltan datos del usuario", async () => {
    await expect(
      crearUsuario({
        nombre: "",
        email: "",
        password: "",
        id_rol: 0,
      })
    ).rejects.toThrow("Datos obligatorios del usuario");
  });
});
