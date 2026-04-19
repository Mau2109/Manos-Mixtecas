import { supabase } from "../../supabaseClient";

export type PerfilClientePayload = {
  id_cliente?: number;
  auth_user_id?: string | null;
  nombre: string;
  apellido?: string;
  email: string;
  telefono?: string;
  direccion?: string;
};

export type PerfilClienteGuardado = {
  cliente: Record<string, unknown>;
};

export type ClientePerfil = {
  id_cliente: number;
  auth_user_id?: string | null;
  nombre: string;
  apellido?: string | null;
  email: string;
  telefono?: string | null;
  direccion?: string | null;
  fecha_registro?: string | null;
  estado?: boolean | null;
};

function construirPayloadDB(cliente: PerfilClientePayload) {
  const payload: Record<string, unknown> = {
    auth_user_id: cliente.auth_user_id ?? null,
    nombre: cliente.nombre,
    apellido: cliente.apellido || null,
    email: cliente.email,
  };

  if (cliente.telefono !== undefined && cliente.telefono !== "") {
    payload.telefono = cliente.telefono || null;
  }
  if (cliente.direccion !== undefined && cliente.direccion !== "") {
    payload.direccion = cliente.direccion || null;
  }

  return payload;
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

export async function obtenerClientePorIdDb(idCliente: number) {
  const { data, error } = await supabase
    .from("clientes")
    .select("*")
    .eq("id_cliente", idCliente)
    .single();

  if (error) throw error;
  return data;
}

export async function obtenerPerfilClienteDb(idCliente: number): Promise<ClientePerfil> {
  const { data, error } = await supabase
    .from("clientes")
    .select(
      "id_cliente, auth_user_id, nombre, apellido, email, telefono, direccion, fecha_registro, estado"
    )
    .eq("id_cliente", idCliente)
    .single();

  if (error) throw error;
  return data;
}

export async function obtenerClientePorAuthIdDb(authUserId: string) {
  const { data, error } = await supabase
    .from("clientes")
    .select("*")
    .eq("auth_user_id", authUserId)
    .limit(1)
    .maybeSingle();

  if (error) throw error;
  return data;
}

export async function upsertClienteAuthDb(payload: PerfilClientePayload) {
  if (!payload.auth_user_id) {
    throw new Error("Auth user id requerido");
  }

  const existenteAuth = await obtenerClientePorAuthIdDb(payload.auth_user_id);
  if (existenteAuth?.id_cliente) {
    const merged: PerfilClientePayload = {
      id_cliente: existenteAuth.id_cliente,
      auth_user_id: payload.auth_user_id ?? existenteAuth.auth_user_id ?? null,
      nombre: payload.nombre || existenteAuth.nombre,
      apellido: payload.apellido ?? (existenteAuth.apellido ?? undefined),
      email: payload.email || existenteAuth.email,
      telefono: payload.telefono ?? (existenteAuth.telefono ?? undefined),
      direccion: payload.direccion ?? (existenteAuth.direccion ?? undefined),
    };
    return actualizarCliente(existenteAuth.id_cliente, merged);
  }

  const existenteEmail = await obtenerClientePorEmailDb(payload.email);
  if (existenteEmail?.id_cliente) {
    const merged: PerfilClientePayload = {
      id_cliente: existenteEmail.id_cliente,
      auth_user_id: payload.auth_user_id ?? existenteEmail.auth_user_id ?? null,
      nombre: payload.nombre || existenteEmail.nombre,
      apellido: payload.apellido ?? (existenteEmail.apellido ?? undefined),
      email: payload.email || existenteEmail.email,
      telefono: payload.telefono ?? (existenteEmail.telefono ?? undefined),
      direccion: payload.direccion ?? (existenteEmail.direccion ?? undefined),
    };
    return actualizarCliente(existenteEmail.id_cliente, merged);
  }

  const { data, error } = await supabase
    .from("clientes")
    .upsert(construirPayloadDB(payload), { onConflict: "auth_user_id" })
    .select()
    .single();

  if (error) throw error;
  return { cliente: data };
}

export async function crearClienteTemporalDb() {
  const sello = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  const payload = {
    nombre: "Invitado",
    apellido: "Temporal",
    email: `invitado-${sello}@manosmixtecas.local`,
    telefono: null,
    direccion: null,
  };

  const { data, error } = await supabase
    .from("clientes")
    .insert(payload)
    .select()
    .single();

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
  if (cliente.id_cliente) {
    const existentePorId = await obtenerClientePorIdDb(cliente.id_cliente);
    const existentePorEmail = await obtenerClientePorEmailDb(cliente.email);

    if (
      existentePorEmail?.id_cliente &&
      existentePorEmail.id_cliente !== cliente.id_cliente
    ) {
      throw new Error("El email ya se encuentra registrado");
    }

    if (existentePorId?.id_cliente) {
      return actualizarCliente(cliente.id_cliente, cliente);
    }
  }

  const existente = await obtenerClientePorEmailDb(cliente.email);

  if (existente?.id_cliente && typeof existente.id_cliente === "number") {
    return actualizarCliente(existente.id_cliente, cliente);
  }

  return insertarCliente(cliente);
}
