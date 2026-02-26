import {
  actualizarProveedorDb,
  crearProveedorDb,
  eliminarProveedorDb,
  limpiarDatosProveedorDb,
  obtenerProveedoresDb,
} from "../persistence/repositories/proveedorRepository";

/* ===============================
   ADM05 - Registrar proveedor
   =============================== */
export async function crearProveedor(proveedor: {
  nombre: string;
  telefono?: string;
  email?: string;
  direccion?: string;
}) {
  if (!proveedor.nombre) {
    throw new Error("El nombre del proveedor es obligatorio");
  }
  return crearProveedorDb(proveedor);
}


/* ===============================
   ADM06 - Actualizar proveedor
   =============================== */
export async function actualizarProveedor(
    idProveedor: number,
    proveedor: {
      nombre?: string;
      telefono?: string;
      email?: string;
      direccion?: string;
    }
  ) {
    if (!idProveedor) {
      throw new Error("ID de proveedor requerido");
    }
    return actualizarProveedorDb(idProveedor, proveedor);
}
  
/* ===============================
   ADM07 - Eliminar proveedor
   =============================== */
export async function eliminarProveedor(idProveedor: number) {
    if (!idProveedor) {
      throw new Error("ID de proveedor requerido");
    }
    return eliminarProveedorDb(idProveedor);
}

/* ===============================
 Consultar proveedores- es por si se ocupa, no venia en la historia de usuario
   =============================== */
export async function obtenerProveedores() {
    return obtenerProveedoresDb();
}
  
export async function limpiarDatosProveedor(idProveedor: number) {
  if (!idProveedor) {
    throw new Error("ID de proveedor requerido");
  }
  return limpiarDatosProveedorDb(idProveedor);
}
