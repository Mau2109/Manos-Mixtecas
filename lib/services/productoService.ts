import { supabase } from "../supabaseClient";


/* ===============================
   EXTRA01 - Consultar stock de un producto
   =============================== */
export async function consultarStock(id_producto: number) {
  const { data, error } = await supabase
    .from("productos")
    .select("stock")
    .eq("id_producto", id_producto)
    .single();

  if (error) throw error;
  return data.stock;
}

/* ===============================
   ADM02 - Registrar producto
   =============================== */
   export async function crearProducto(producto: {
    nombre: string;
    descripcion?: string;
    precio: number;
    stock: number;
    imagen?: string;
    id_categoria: number;
  }) {
    if (!producto.nombre || producto.precio == null || producto.stock == null) {
      throw new Error("Datos obligatorios del producto");
    }
  
    const { data, error } = await supabase
      .from("productos")
      .insert(producto)
      .select()
      .single();
  
    if (error) throw error;
    return data;
  }
  
/* ===============================
   ADM03 - Actualizar producto
   =============================== */
   export async function actualizarProducto(
    idProducto: number,
    producto: {
      nombre?: string;
      descripcion?: string;
      precio?: number;
      stock?: number;
      imagen?: string;
      id_categoria?: number;
      estado?: boolean;
    }
  ) {
    if (!idProducto) {
      throw new Error("ID de producto requerido");
    }
  
    const { data, error } = await supabase
      .from("productos")
      .update(producto)
      .eq("id_producto", idProducto)
      .select()
      .single();
  
    if (error) throw error;
    return data;
  }

/* ===============================
   ADM04 - Eliminar producto (lógico)
   =============================== */
   export async function eliminarProducto(idProducto: number) {
    if (!idProducto) {
      throw new Error("ID de producto requerido");
    }
  
    const { error } = await supabase
      .from("productos")
      .update({ estado: false })
      .eq("id_producto", idProducto);
  
    if (error) throw error;
    return true;
  }
  

