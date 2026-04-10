import { supabase } from "../../supabaseClient";

export type PerfilClientePayload = {
  nombre: string;
  email: string;
  telefono?: string;
  direccion?: string;
  foto_perfil?: string;
  codigo_cliente?: string;
};

export type PerfilClienteGuardado = {
  cliente: Record<string, unknown>;
  partialSave: boolean;
};

function construirPayloadBase(cliente: PerfilClientePayload) {
  return {
    nombre: cliente.nombre,
    email: cliente.email,
  };
}

function construirPayloadExtendido(cliente: PerfilClientePayload) {
  return {
    ...construirPayloadBase(cliente),
    telefono: cliente.telefono || null,
    direccion: cliente.direccion || null,
    foto_perfil: cliente.foto_perfil || null,
    codigo_cliente: cliente.codigo_cliente || null,
  };
}

function esErrorPorColumnaFaltante(error: unknown) {
  if (!error || typeof error !== "object" || !("message" in error)) {
    return false;
  }

  const message = String(error.message).toLowerCase();
  return (
    message.includes("column") ||
    message.includes("schema cache") ||
    message.includes("could not find") ||
    message.includes("does not exist")
  );
}

/* ===============================
   USD01 - Crear perfil cliente (persistencia)
   =============================== */
export async function crearClienteDb(cliente: { nombre: string; email: string }) {
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
  const extendido = await supabase
    .from("clientes")
    .insert(construirPayloadExtendido(payload))
    .select()
    .single();

  if (!extendido.error) {
    return { cliente: extendido.data, partialSave: false };
  }

  if (!esErrorPorColumnaFaltante(extendido.error)) {
    throw extendido.error;
  }

  const base = await supabase
    .from("clientes")
    .insert(construirPayloadBase(payload))
    .select()
    .single();

  if (base.error) throw base.error;
  return { cliente: base.data, partialSave: true };
}

async function actualizarCliente(
  idCliente: number,
  payload: PerfilClientePayload
): Promise<PerfilClienteGuardado> {
  const extendido = await supabase
    .from("clientes")
    .update(construirPayloadExtendido(payload))
    .eq("id_cliente", idCliente)
    .select()
    .single();

  if (!extendido.error) {
    return { cliente: extendido.data, partialSave: false };
  }

  if (!esErrorPorColumnaFaltante(extendido.error)) {
    throw extendido.error;
  }

  const base = await supabase
    .from("clientes")
    .update(construirPayloadBase(payload))
    .eq("id_cliente", idCliente)
    .select()
    .single();

  if (base.error) throw base.error;
  return { cliente: base.data, partialSave: true };
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
