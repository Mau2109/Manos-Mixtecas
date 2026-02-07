import { supabase } from "../supabaseClient";

/* ===============================
   ADM01 - Iniciar sesión
   =============================== */
export async function loginAdministrador(email: string, password: string) {
  if (!email || !password) {
    throw new Error("Credenciales obligatorias");
  }

  const { data, error } = await supabase
    .from("usuarios")
    .select("*")
    .eq("email", email)
    .eq("password", password)
    .eq("estado", true)
    .single();

  if (error || !data) {
    throw new Error("Credenciales inválidas");
  }

  return data;
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
  
    const { data, error } = await supabase
      .from("usuarios")
      .insert({
        nombre: usuario.nombre,
        email: usuario.email,
        password: usuario.password,
        id_rol: usuario.id_rol,
      })
      .select()
      .single();
  
    if (error) throw error;
    return data;
  }