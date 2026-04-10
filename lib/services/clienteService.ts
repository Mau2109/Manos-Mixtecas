import {
  crearClienteDb,
  guardarPerfilClienteDb,
  type PerfilClientePayload,
} from "../persistence/repositories/clienteRepository";

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

export async function guardarPerfilCliente(cliente: PerfilClientePayload) {
  if (!cliente.nombre || !cliente.email) {
    throw new Error("Nombre y email son obligatorios");
  }

  return guardarPerfilClienteDb({
    nombre: cliente.nombre.trim(),
    email: cliente.email.trim(),
    telefono: cliente.telefono?.trim(),
    direccion: cliente.direccion?.trim(),
    foto_perfil: cliente.foto_perfil?.trim(),
    codigo_cliente: cliente.codigo_cliente?.trim(),
  });
}
