export type DatosEnvioCheckout = {
  nombre: string;
  apellido?: string;
  email?: string;
  telefono: string;
  direccion: string;
  ciudad: string;
  estado?: string;
  codigo_postal?: string;
};

export function calcularCostoEnvio(
  datosEnvio: Partial<DatosEnvioCheckout> | null | undefined,
  cantidadPiezas: number
) {
  if (!datosEnvio?.estado && !datosEnvio?.codigo_postal) {
    return 0;
  }

  const piezasExtra = Math.max(0, cantidadPiezas - 1) * 15;
  const estado = (datosEnvio.estado ?? "").trim().toLowerCase();
  const cp = (datosEnvio.codigo_postal ?? "").trim();

  if (estado.includes("oaxaca")) return 99 + piezasExtra;
  if (cp.startsWith("0") || cp.startsWith("1")) return 129 + piezasExtra;
  return 149 + piezasExtra;
}

export function calcularResumenCheckout(params: {
  subtotal: number;
  cantidadPiezas: number;
  datosEnvio?: Partial<DatosEnvioCheckout> | null;
}) {
  const subtotal = Number(params.subtotal || 0);
  const envio = calcularCostoEnvio(params.datosEnvio, params.cantidadPiezas);
  const total = subtotal + envio;

  return {
    subtotal,
    envio,
    total,
  };
}
