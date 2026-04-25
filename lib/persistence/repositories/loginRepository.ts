import { supabase } from "../../supabaseClient";

/* ===============================
   ADM01 - Login 
   =============================== */
export async function loginAdministradorDb(email: string, password: string) {
  const { data, error } = await supabase
    .from("usuarios")
    .select(`
      id_usuario,
      nombre,
      email,
      id_rol,
      estado,
      roles (
        id_rol,
        nombre
      )
    `)
    .eq("email", email)
    .eq("password", password)
    .eq("estado", true)
    .single();

  if (error || !data) {
    throw new Error("Credenciales inválidas");
  }

  const rol = Array.isArray(data.roles)
    ? data.roles[0]
    : data.roles;

  return {
    id_usuario: data.id_usuario,
    nombre: data.nombre,
    email: data.email,
    id_rol: data.id_rol,
    estado: data.estado,
    rol_nombre: rol?.nombre || "Desconocido",
  };
}



