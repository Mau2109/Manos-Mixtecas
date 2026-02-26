import { supabase } from "../../supabaseClient";

export async function crearProveedorDb(proveedor: {
  nombre: string;
  telefono?: string;
  email?: string;
  direccion?: string;
}) {
  const { data, error } = await supabase
    .from("proveedores")
    .insert(proveedor)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function actualizarProveedorDb(
  idProveedor: number,
  proveedor: {
    nombre?: string;
    telefono?: string;
    email?: string;
    direccion?: string;
  }
) {
  const { data, error } = await supabase
    .from("proveedores")
    .update(proveedor)
    .eq("id_proveedor", idProveedor)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function eliminarProveedorDb(idProveedor: number) {
  const { error } = await supabase
    .from("proveedores")
    .delete()
    .eq("id_proveedor", idProveedor);

  if (error) throw error;
  return true;
}

export async function obtenerProveedoresDb() {
  const { data, error } = await supabase
    .from("proveedores")
    .select("*")
    .order("nombre", { ascending: true });

  if (error) throw error;
  return data;
}

export async function limpiarDatosProveedorDb(idProveedor: number) {
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
