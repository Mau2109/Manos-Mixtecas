import { supabase } from "../../supabaseClient";

export async function loginAdministradorDb(email: string, password: string) {
  const { data, error } = await supabase
    .from("usuarios")
    .select("*")
    .eq("email", email)
    .eq("password", password)
    .eq("estado", true)
    .single();

  if (error || !data) {
    throw new Error("Credenciales invalidas");
  }

  return data;
}

export async function crearUsuarioDb(usuario: {
  nombre: string;
  email: string;
  password: string;
  id_rol: number;
}) {
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
