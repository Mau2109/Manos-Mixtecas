import { supabase } from "../../supabaseClient";

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

