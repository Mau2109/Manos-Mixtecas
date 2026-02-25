jest.mock("../lib/supabaseClient", () => ({
  supabase: {
    from: jest.fn(() => ({
      /* Login */
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),

      /* Crear usuario */
      insert: jest.fn().mockReturnThis(),

      /* Común */
      single: jest.fn().mockResolvedValue({
        data: {
          id_usuario: 1,
          nombre: "Admin",
          email: "admin@mail.com",
          id_rol: 1,
        },
        error: null,
      }),
    })),
  },
}));


import { loginAdministrador } from "../lib/services/loginServices";
import { crearUsuario } from "../lib/services/loginServices";

  /* ===============================
      AMD01-Login administrador
       =============================== */
test("Login administrador correcto", async () => {
  const usuario = await loginAdministrador(
    "admin@mail.com",
    "1234"
  );

  expect(usuario).toBeDefined();
  expect(usuario.email).toBe("admin@mail.com");
});

test("Error si faltan credenciales", async () => {
  await expect(
    loginAdministrador("", "")
  ).rejects.toThrow("Credenciales obligatorias");
});

/* ===============================
 AMD08-Crear usuario con rol
 =============================== */
 test("Crear usuario con rol correctamente", async () => {
  const usuario = await crearUsuario({
    nombre: "Administrador",
    email: "admin@mail.com",
    password: "1234",
    id_rol: 1, // Administrador
  });

  expect(usuario).toBeDefined();
  expect(usuario.id_rol).toBe(1);
});

/* ===============================
   Validación
   =============================== */
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