import {
  loginAdministradorDb,
} from "../persistence/repositories/loginRepository";

// Tipo de usuario devuelto por el login
export interface UsuarioLogin {
  id_usuario: number;
  nombre: string;
  email: string;
  id_rol: number;
  estado: boolean;
  rol_nombre: string;
}

/* ===============================
   ADM01 - Inicio de sesión administrador/vendedor
   =============================== */
export async function loginAdministrador(email: string, password: string): Promise<UsuarioLogin> {
  if (!email || !password) {
    throw new Error("Credenciales obligatorias");
  }
  return loginAdministradorDb(email, password);
}


