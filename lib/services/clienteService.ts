import { crearClienteDb } from "../persistence/repositories/clienteRepository";

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
