import {
  crearUsuarioDb,
  loginAdministradorDb,
} from "../persistence/repositories/loginRepository";

/* ===============================
   ADM01 - Iniciar sesión
   =============================== */
export async function loginAdministrador(email: string, password: string) {
  if (!email || !password) {
    throw new Error("Credenciales obligatorias");
  }
  return loginAdministradorDb(email, password);
}

/* ===============================
   ADM08- Creación de usuarios y roles
   =============================== */
   export async function crearUsuario(usuario: {
    nombre: string;
    email: string;
    password: string;
    id_rol: number;
  }) {
    if (!usuario.nombre || !usuario.email || !usuario.password || !usuario.id_rol) {
      throw new Error("Datos obligatorios del usuario");
    }

    return crearUsuarioDb(usuario);
  }
