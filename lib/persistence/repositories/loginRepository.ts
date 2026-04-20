import { supabase } from "../../supabaseClient";

/* ===============================
   ADM01 - Inicio de sesión administrador (persistencia)
   =============================== */
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


