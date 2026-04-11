import { NextRequest, NextResponse } from "next/server";

import { listarVentas } from "@/lib/services/ventaService";

export const dynamic = "force-dynamic";

type ClienteRelacion =
  | {
      nombre?: string | null;
      apellido?: string | null;
      email?: string | null;
    }
  | Array<{
      nombre?: string | null;
      apellido?: string | null;
      email?: string | null;
    }>
  | null;

type VentaDb = {
  id_venta: number;
  total: number | string | null;
  estado?: string | null;
  fecha_venta?: string | null;
  confirmacion_envio?: boolean | null;
  clientes?: ClienteRelacion;
};

function normalizarFechaInicio(fecha: string | null) {
  if (!fecha) return undefined;

  const fechaInicio = `${fecha}T00:00:00`;
  return Number.isNaN(new Date(fechaInicio).getTime()) ? undefined : fechaInicio;
}

function normalizarFechaFin(fecha: string | null) {
  if (!fecha) return undefined;

  const fechaFin = `${fecha}T23:59:59.999`;
  return Number.isNaN(new Date(fechaFin).getTime()) ? undefined : fechaFin;
}

function resolverCliente(clientes: ClienteRelacion) {
  if (Array.isArray(clientes)) {
    return clientes[0] ?? null;
  }

  return clientes ?? null;
}

function mapearEstadoConsulta(estado: string | null) {
  if (!estado || estado === "all") {
    return {};
  }

  switch (estado.toUpperCase()) {
    case "PENDIENTE":
      return { estado: "Pendiente" };
    case "CONFIRMADO":
    case "PAGADO":
      return { estado: "Confirmado" };
    case "CANCELADO":
      return { estado: "Cancelado" };
    case "ENTREGADO":
      return { confirmacionEnvio: true };
    default:
      return { estado };
  }
}

function normalizarEstado(estado?: string | null) {
  switch (estado?.toLowerCase()) {
    case "confirmado":
      return "CONFIRMADO";
    case "cancelado":
      return "CANCELADO";
    case "pendiente":
      return "PENDIENTE";
    default:
      return estado?.toUpperCase() ?? "SIN_ESTADO";
  }
}

function construirFolio(idVenta: number, fechaVenta?: string | null) {
  const year = fechaVenta ? new Date(fechaVenta).getFullYear() : new Date().getFullYear();
  const yearSeguro = Number.isNaN(year) ? new Date().getFullYear() : year;

  return `MM-${yearSeguro}${String(idVenta).padStart(4, "0")}`;
}

function normalizarVenta(venta: VentaDb) {
  const cliente = resolverCliente(venta.clientes ?? null);
  const estado = normalizarEstado(venta.estado);
  const total = Number(venta.total ?? 0);

  return {
    id: venta.id_venta,
    folio: construirFolio(venta.id_venta, venta.fecha_venta),
    fecha: venta.fecha_venta,
    total: Number.isFinite(total) ? total : 0,
    estado,
    estado_envio:
      venta.confirmacion_envio === true
        ? "ENTREGADO"
        : estado === "CANCELADO"
          ? "CANCELADO"
          : "EN_CAMINO",
    cliente: {
      nombre: cliente?.nombre?.trim() || "Cliente",
      apellido: cliente?.apellido?.trim() || "",
      email: cliente?.email ?? null,
    },
  };
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const filtros = {
      ...mapearEstadoConsulta(searchParams.get("estado")),
      fechaInicio: normalizarFechaInicio(searchParams.get("fechaInicio")),
      fechaFin: normalizarFechaFin(searchParams.get("fechaFin")),
    };

    const ventas = (await listarVentas(filtros)) as VentaDb[] | null;

    return NextResponse.json((ventas ?? []).map(normalizarVenta), {
      headers: {
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    const mensaje = error instanceof Error ? error.message : "No fue posible consultar las ventas.";

    return NextResponse.json(
      { error: mensaje },
      {
        status: 500,
        headers: {
          "Cache-Control": "no-store",
        },
      }
    );
  }
}
