import {
  loginAdministradorDb,
} from "../persistence/repositories/loginRepository";

/* ===============================
   ADM01 - Inicio de sesión administrador
   =============================== */
export async function loginAdministrador(email: string, password: string) {
  if (!email || !password) {
    throw new Error("Credenciales obligatorias");
  }
  return loginAdministradorDb(email, password);
}


