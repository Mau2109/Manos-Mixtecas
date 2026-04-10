import{
    getUsuarios,
    deleteUsuario,
    getVendedorAccess
} from '../persistence/repositories/usuarioRepository';


/* ===============================
   AMD10 - Consultar lista de usuarios
   =============================== */

export async function listarUsuarios() {
    const data = await getUsuarios();
    if (!data || data.length === 0) {
        console.log('No existen usuarios en la lista');
        return [];
    }
    return data;
}

/* ===============================
   AMD11 - Eliminar usuario
   =============================== */

export async function eliminarUsuario(nombre: string) {
    if (!nombre) throw new Error("Nombre de usuario requerido");
    console.log(`Usuario ${nombre} eliminado correctamente`);
    return deleteUsuario(nombre);
}

/* ===============================
   AMD16 - Interfaz limitada para vendedores
   =============================== */

export async function obtenerAccesoVendedor(nombre: string) {
    const data = await getUsuarios();
    const usuario = data?.find(u => u.nombre === nombre);
    if (usuario?.rol !== 'vendedor') {
        throw new Error('Acceso denegado. Solo vendedores pueden acceder.');
    }
    
    return getVendedorAccess(nombre);
}

