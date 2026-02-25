import { supabase } from "../supabaseClient";

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

  const { data, error } = await supabase
    .from("proveedores")
    .insert(proveedor)
    .select()
    .single();

  if (error) throw error;
  return data;
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
  
    const { data, error } = await supabase
      .from("proveedores")
      .update(proveedor)
      .eq("id_proveedor", idProveedor)
      .select()
      .single();
  
    if (error) throw error;
    return data;
}
  
/* ===============================
   ADM07 - Eliminar proveedor
   =============================== */
export async function eliminarProveedor(idProveedor: number) {
    if (!idProveedor) {
      throw new Error("ID de proveedor requerido");
    }
  
    const { error } = await supabase
      .from("proveedores")
      .delete()
      .eq("id_proveedor", idProveedor);
  
    if (error) throw error;
    return true;
}

/* ===============================
 Consultar proveedores- es por si se ocupa, no venia en la historia de usuario
   =============================== */
export async function obtenerProveedores() {
    const { data, error } = await supabase
      .from("proveedores")
      .select("*")
      .order("nombre", { ascending: true });
  
    if (error) throw error;
    return data;
}
  
export async function limpiarDatosProveedor(idProveedor: number) {
  if (!idProveedor) {
    throw new Error("ID de proveedor requerido");
  }

  const { error } = await supabase
    .from("proveedores")
    .update({
      telefono: null,
      email: null,
      direccion: null,
    })
    .eq("id_proveedor", idProveedor);

  if (error) throw error;
  return true;
}