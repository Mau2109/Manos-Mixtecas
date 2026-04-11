import { supabase } from "../../supabaseClient";

export type PerfilClientePayload = {
  nombre: string;
  apellido?: string;
  email: string;
  telefono?: string;
  direccion?: string;
};

export type PerfilClienteGuardado = {
  cliente: Record<string, unknown>;
};

function construirPayloadDB(cliente: PerfilClientePayload) {
  return {
    nombre: cliente.nombre,
    apellido: cliente.apellido || null,
    email: cliente.email,
    telefono: cliente.telefono || null,
    direccion: cliente.direccion || null,
  };
}

/* ===============================
   USD01 - Crear perfil cliente (persistencia)
   =============================== */
export async function crearClienteDb(cliente: { nombre: string; email: string }) {
  const existente = await obtenerClientePorEmailDb(cliente.email);
  if (existente?.id_cliente) return existente;

  const { data, error } = await supabase
    .from("clientes")
    .insert(cliente)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function obtenerClientePorEmailDb(email: string) {
  const { data, error } = await supabase
    .from("clientes")
    .select("*")
    .eq("email", email)
    .limit(1)
    .maybeSingle();

  if (error) throw error;
  return data;
}

async function insertarCliente(
  payload: PerfilClientePayload
): Promise<PerfilClienteGuardado> {
  const { data, error } = await supabase
    .from("clientes")
    .insert(construirPayloadDB(payload))
    .select()
    .single();

  if (error) throw error;
  return { cliente: data };
}

async function actualizarCliente(
  idCliente: number,
  payload: PerfilClientePayload
): Promise<PerfilClienteGuardado> {
  const { data, error } = await supabase
    .from("clientes")
    .update(construirPayloadDB(payload))
    .eq("id_cliente", idCliente)
    .select()
    .single();

  if (error) throw error;
  return { cliente: data };
}

export async function guardarPerfilClienteDb(
  cliente: PerfilClientePayload
): Promise<PerfilClienteGuardado> {
  const existente = await obtenerClientePorEmailDb(cliente.email);

  if (existente?.id_cliente && typeof existente.id_cliente === "number") {
    return actualizarCliente(existente.id_cliente, cliente);
  }

  return insertarCliente(cliente);
}
