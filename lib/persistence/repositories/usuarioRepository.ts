import { supabase } from "../../supabaseClient";

/* ===============================
   ADM20 - Crear usuario (persistencia)
   ADM23 - Asignar roles (id_rol)
   =============================== */
export async function crearUsuarioDb(usuario: {
  nombre: string;
  email: string;
  password: string;
  id_rol: number;
}) {
  const { data, error } = await supabase
    .from("usuarios")
    .insert({
      nombre: usuario.nombre,
      email: usuario.email,
      password: usuario.password,
      id_rol: usuario.id_rol,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function getUsuarios() {
    const { data, error } = await supabase
        .from('usuarios')
        .select('nombre, email, rol');
    
    if (error) throw error;
    return data;
}

export async function deleteUsuario(nombre: string) {
    const { error } = await supabase
        .from('usuarios')
        .delete()
        .eq('nombre', nombre);
    
    if (error) throw error;
    
}

export async function getVendedorAccess(nombre: string) {
    const { data, error } = await supabase
        .from('usuarios')
        .select('rol')
        .eq('nombre', nombre)
        .single();
    
    if (error) throw error;
    
    return {
        ventas: true,
        inventario: true,
        otros: false
    };
}

