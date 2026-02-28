import {
  actualizarEmpresaDb,
  crearEmpresaDb,
  obtenerContactoYRedesDb,
  obtenerEmpresaDb,
  obtenerMisionYValoresDb,
} from "../persistence/repositories/empresaRepository";

/* ===============================
   ADM16 - Agregar perfil empresa
   =============================== */
export async function crearEmpresa(empresa: {
  nombre: string;
  direccion?: string;
  telefono?: string;
  email?: string;
  descripcion?: string;
  mision?: string;
  valores?: string;
  redes_sociales?: Record<string, string>;
  formulario_contacto_email?: string;
}) {
  if (!empresa.nombre) {
    throw new Error("El nombre de la empresa es obligatorio");
  }
  return crearEmpresaDb(empresa);
}

/* ===============================
   ADM17 - Editar perfil empresa
   =============================== */
export async function actualizarEmpresa(
  idEmpresa: number,
  empresa: {
    nombre?: string;
    direccion?: string;
    telefono?: string;
    email?: string;
    descripcion?: string;
    mision?: string;
    valores?: string;
    redes_sociales?: Record<string, string>;
    formulario_contacto_email?: string;
  }
) {
  if (!idEmpresa) {
    throw new Error("ID de empresa requerido");
  }
  return actualizarEmpresaDb(idEmpresa, empresa);
}

/* ===============================
   ADM18 / USD11 - Visualizar perfil empresa de AMD18
   Incluye: misión, valores, redes sociales y contacto (USD11, USD19, USD20)
   =============================== */
export async function obtenerEmpresa() {
  return obtenerEmpresaDb();
}

/* ===============================
   USD11 - Obtener misión y valores
   =============================== */
export async function obtenerMisionYValores() {
  return obtenerMisionYValoresDb();
}

/* ===============================
   USD19 / USD20 - Obtener datos de contacto y redes sociales
   =============================== */
export async function obtenerContactoYRedes() {
  return obtenerContactoYRedesDb();
}
