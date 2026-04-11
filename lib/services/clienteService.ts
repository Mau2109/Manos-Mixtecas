import {
  crearClienteTemporalDb,
  crearClienteDb,
  guardarPerfilClienteDb,
  obtenerPerfilClienteDb,
  obtenerClientePorAuthIdDb,
  obtenerClientePorEmailDb,
  upsertClienteAuthDb,
  type ClientePerfil,
  type PerfilClientePayload,
} from "../persistence/repositories/clienteRepository";

function normalizarTelefono(telefono?: string) {
  if (!telefono) return undefined;
  const digits = telefono.replace(/\D/g, "");
  if (!digits) return undefined;
  if (digits.length !== 10) {
    throw new Error("El teléfono debe tener 10 dígitos.");
  }
  return digits;
}

/* ===============================
   USD01 - Crear perfil cliente
   =============================== */
export async function crearCliente(cliente: {
  nombre: string;
  email: string;
}) {
  if (!cliente.nombre || !cliente.email) {
    throw new Error("Datos obligatorios");
  }
  return crearClienteDb(cliente);
}

export async function crearClienteTemporal() {
  return crearClienteTemporalDb();
}

export async function obtenerPerfilCliente(idCliente: number): Promise<ClientePerfil> {
  if (!idCliente) {
    throw new Error("ID de cliente requerido");
  }

  return obtenerPerfilClienteDb(idCliente);
}

export async function sincronizarClienteAuth(params: {
  auth_user_id?: string;
  email: string;
  nombre?: string;
  apellido?: string;
  telefono?: string;
  direccion?: string;
}) {
  if (!params.email) {
    throw new Error("Email requerido");
  }

  const nombreLimpio =
    params.nombre?.trim() || params.email.split("@")[0] || "Cliente";

  if (params.auth_user_id) {
    return upsertClienteAuthDb({
      auth_user_id: params.auth_user_id,
      nombre: nombreLimpio,
      apellido: params.apellido?.trim(),
      email: params.email.trim(),
      telefono: normalizarTelefono(params.telefono),
      direccion: params.direccion?.trim(),
    });
  }

  return guardarPerfilClienteDb({
    nombre: nombreLimpio,
    apellido: params.apellido?.trim(),
    email: params.email.trim(),
    telefono: normalizarTelefono(params.telefono),
    direccion: params.direccion?.trim(),
  });
}

export async function obtenerClientePorAuthId(authUserId: string) {
  if (!authUserId) {
    throw new Error("Auth user id requerido");
  }
  return obtenerClientePorAuthIdDb(authUserId);
}

export async function obtenerClientePorEmail(email: string) {
  if (!email) {
    throw new Error("Email requerido");
  }
  return obtenerClientePorEmailDb(email.trim());
}

export async function guardarPerfilCliente(cliente: PerfilClientePayload) {
  if (!cliente.nombre || !cliente.email) {
    throw new Error("Nombre y email son obligatorios");
  }

  return guardarPerfilClienteDb({
    id_cliente: cliente.id_cliente,
    auth_user_id: cliente.auth_user_id,
    nombre: cliente.nombre.trim(),
    apellido: cliente.apellido?.trim(),
    email: cliente.email.trim(),
    telefono: normalizarTelefono(cliente.telefono),
    direccion: cliente.direccion?.trim(),
  });
}
