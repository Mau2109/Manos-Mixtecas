import { supabase } from "../../supabaseClient";

export async function crearClienteDb(cliente: { nombre: string; email: string }) {
  const { data, error } = await supabase
    .from("clientes")
    .insert(cliente)
    .select()
    .single();

  if (error) throw error;
  return data;
}
