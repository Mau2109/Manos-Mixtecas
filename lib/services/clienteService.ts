import { supabase } from "../supabaseClient";

export async function crearCliente(cliente: {
  nombre: string;
  email: string;
}) {
  if (!cliente.nombre || !cliente.email) {
    throw new Error("Datos obligatorios");
  }

  const { data, error } = await supabase
    .from("clientes")
    .insert(cliente)
    .select()
    .single();

  if (error) throw error;
  return data;
}
