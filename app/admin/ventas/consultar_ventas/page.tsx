"use client";
import { startTransition, useEffect, useEffectEvent, useMemo, useState } from "react";
// import { Sidebar } from "@/components/layout/sidebar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { 
  Search, Filter, Plus,
  Truck, Bell, Package
} from "lucide-react";
import { 
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue 
} from "@/components/ui/select";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

type Venta = {
  id: number;
  folio: string;
  fecha: string | null;
  total: number;
  estado: string;
  estado_envio: string;
  cliente: {
    nombre: string;
    apellido: string;
    email?: string | null;
  };
};

function construirUrlVentas(filtros: {
  estado: string;
  fechaInicio: string;
  fechaFin: string;
}) {
  const searchParams = new URLSearchParams();

  if (filtros.estado !== "all") {
    searchParams.set("estado", filtros.estado);
  }

  if (filtros.fechaInicio) {
    searchParams.set("fechaInicio", filtros.fechaInicio);
  }

  if (filtros.fechaFin) {
    searchParams.set("fechaFin", filtros.fechaFin);
  }

  const query = searchParams.toString();

  return query ? `/api/ventas?${query}` : "/api/ventas";
}

async function obtenerVentas(filtros: {
  estado: string;
  fechaInicio: string;
  fechaFin: string;
}) {
  const response = await fetch(construirUrlVentas(filtros), {
    cache: "no-store",
    headers: {
      Accept: "application/json",
    },
  });

  const contentType = response.headers.get("content-type") ?? "";
  const esJson = contentType.includes("application/json");

  if (!response.ok) {
    if (esJson) {
      const body = (await response.json()) as { error?: string };
      throw new Error(body.error || "No fue posible cargar las ventas.");
    }

    const errorText = await response.text();
    throw new Error(
      errorText.trim().startsWith("<!DOCTYPE html")
        ? "La ruta de ventas devolvió HTML en lugar de JSON."
        : errorText || "No fue posible cargar las ventas."
    );
  }

  if (!esJson) {
    throw new Error("La respuesta del backend no llegó en formato JSON.");
  }

  const data = (await response.json()) as Venta[];
  return Array.isArray(data) ? data : [];
}

function obtenerIniciales(nombre: string, apellido: string) {
  return `${nombre.trim().charAt(0)}${apellido.trim().charAt(0)}`.trim() || "CL";
}

function obtenerNombreCliente(cliente: Venta["cliente"]) {
  return [cliente.nombre, cliente.apellido].filter(Boolean).join(" ").trim() || "Cliente sin nombre";
}

function obtenerClaseEstado(estado: string) {
  switch (estado) {
    case "CONFIRMADO":
      return "bg-green-100 text-green-700";
    case "CANCELADO":
      return "bg-red-100 text-red-700";
    case "PENDIENTE":
      return "bg-amber-100 text-amber-700";
    default:
      return "bg-neutral-100 text-neutral-700";
  }
}

export default function ConsultarVentasPage() {
  const [ventas, setVentas] = useState<Venta[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [recargaManual, setRecargaManual] = useState(0);
  
  // Estados de Filtros (Basados en ADM25 de tu service)
  const [busqueda, setBusqueda] = useState("");
  const [filtroEstado, setFiltroEstado] = useState("all");
  const [fechaInicio, setFechaInicio] = useState("");
  const [fechaFin, setFechaFin] = useState("");

  const cargarVentas = useEffectEvent(async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await obtenerVentas({
        estado: filtroEstado,
        fechaInicio,
        fechaFin,
      });

      setVentas(data);
    } catch (error) {
      const mensaje =
        error instanceof Error ? error.message : "Ocurrió un problema al consultar las ventas.";

      console.error("Error en la consulta de ventas:", mensaje);
      setVentas([]);
      setError(mensaje);
    } finally {
      setLoading(false);
    }
  });

  useEffect(() => {
    void cargarVentas();
  }, [fechaFin, fechaInicio, filtroEstado, recargaManual]);

  // 2. Lógica de búsqueda local (para no saturar el server)
  const ventasFiltradas = useMemo(() => {
    const termino = busqueda.trim().toLowerCase();

    if (!termino) {
      return ventas;
    }

    return ventas.filter((venta) => {
      const nombreCliente = obtenerNombreCliente(venta.cliente).toLowerCase();

      return (
        venta.folio.toLowerCase().includes(termino) ||
        nombreCliente.includes(termino)
      );
    });
  }, [busqueda, ventas]);

  // 3. Cálculos para los KPIs (ADM29/ADM30)
  const stats = useMemo(() => {
    const totalVendido = ventas.reduce((acc, v) => acc + v.total, 0);
    const promedio = ventas.length > 0 ? totalVendido / ventas.length : 0;
    const enTransito = ventas.filter((v) => v.estado_envio === "EN_CAMINO").length;
    
    return { totalVendido, promedio, enTransito };
  }, [ventas]);

  return (
    <div className="flex h-screen bg-[#F8F9F4] overflow-hidden text-neutral-800">
      {/* <Sidebar /> */}
      
      <main className="flex-1 p-8 overflow-y-auto">
        {/* Navbar */}
        <div className="flex justify-between items-center mb-8">
          <div className="relative w-96">
            <Input 
              className="pl-10 bg-white border-none shadow-sm rounded-xl h-11"
              placeholder="Buscar por folio o cliente..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
            />
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
          </div>
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" className="bg-white rounded-full shadow-sm">
              <Bell className="w-5 h-5" />
            </Button>
            <div className="flex items-center gap-3 bg-white p-1 pr-4 rounded-full shadow-sm border border-neutral-100">
              <Avatar className="h-8 w-8">
                <AvatarFallback className="bg-slate-700 text-white text-[10px]">AD</AvatarFallback>
              </Avatar>
              <span className="text-xs font-bold text-neutral-500 uppercase tracking-tighter">Admin Mixteca</span>
            </div>
          </div>
        </div>

        {/* Encabezado */}
        <div className="flex justify-between items-end mb-8">
          <div>
            <h1 className="text-4xl font-bold mb-2">Consultar Ventas</h1>
            <p className="text-neutral-500 text-sm">Historial de transacciones de artesanías.</p>
          </div>
          <Button className="bg-[#8B5E3C] hover:bg-[#6F4A2F] text-white px-6 h-12 rounded-2xl font-bold shadow-lg shadow-amber-900/10">
            <Plus className="w-5 h-5 mr-2" /> Nueva Venta
          </Button>
        </div>

        {/* Filtros (Conectados a los estados del service) */}
        <Card className="p-6 border-none shadow-sm rounded-[2rem] mb-6 flex flex-wrap gap-6 items-end bg-white/60">
          <div className="flex-1 min-w-[180px]">
            <label className="text-[10px] font-bold uppercase text-neutral-400 mb-2 block">Fecha Inicio</label>
            <Input type="date" value={fechaInicio} onChange={(e) => setFechaInicio(e.target.value)} className="rounded-xl" />
          </div>
          <div className="flex-1 min-w-[180px]">
            <label className="text-[10px] font-bold uppercase text-neutral-400 mb-2 block">Fecha Fin</label>
            <Input type="date" value={fechaFin} onChange={(e) => setFechaFin(e.target.value)} className="rounded-xl" />
          </div>
          <div className="flex-1 min-w-[180px]">
            <label className="text-[10px] font-bold uppercase text-neutral-400 mb-2 block">Estado</label>
            <Select onValueChange={setFiltroEstado} value={filtroEstado}>
              <SelectTrigger className="rounded-xl">
                <SelectValue placeholder="Todos" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="PENDIENTE">Pendiente</SelectItem>
                <SelectItem value="CONFIRMADO">Confirmado</SelectItem>
                <SelectItem value="ENTREGADO">Entregado</SelectItem>
                <SelectItem value="CANCELADO">Cancelado</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button
            onClick={() => {
              startTransition(() => {
                setRecargaManual((valor) => valor + 1);
              });
            }}
            variant="outline"
            className="h-10 px-6 rounded-xl border-neutral-200 bg-neutral-100 font-bold"
          >
            <Filter className="w-4 h-4 mr-2" /> Filtrar
          </Button>
        </Card>

        {/* Tabla */}
        <Card className="border-none shadow-sm rounded-[2rem] overflow-hidden bg-white mb-8">
          <table className="w-full">
            <thead className="bg-neutral-50 border-b border-neutral-100 text-[10px] font-bold uppercase text-neutral-400">
              <tr>
                <th className="px-8 py-5 text-left">Folio</th>
                <th className="px-8 py-5 text-left">Fecha</th>
                <th className="px-8 py-5 text-left">Cliente</th>
                <th className="px-8 py-5 text-left">Total</th>
                <th className="px-8 py-5 text-left">Estado</th>
                <th className="px-8 py-5 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-50 text-sm">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-8 py-12 text-center text-sm text-neutral-500">
                    Cargando ventas...
                  </td>
                </tr>
              ) : ventasFiltradas.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-8 py-12 text-center text-sm text-neutral-500">
                    {error || "No se encontraron ventas con los filtros seleccionados."}
                  </td>
                </tr>
              ) : (
                ventasFiltradas.map((v) => (
                  <tr key={v.id} className="hover:bg-neutral-50/50 transition-colors">
                    <td className="px-8 py-6 font-mono font-bold text-[#8B5E3C]">{v.folio}</td>
                    <td className="px-8 py-6 text-neutral-500">
                      {v.fecha ? new Date(v.fecha).toLocaleDateString("es-MX") : "Sin fecha"}
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8 bg-neutral-100 text-neutral-600 font-bold text-[10px]">
                          <AvatarFallback>{obtenerIniciales(v.cliente.nombre, v.cliente.apellido)}</AvatarFallback>
                        </Avatar>
                        <span className="font-bold text-neutral-700">{obtenerNombreCliente(v.cliente)}</span>
                      </div>
                    </td>
                    <td className="px-8 py-6 font-bold">$ {v.total.toLocaleString("es-MX")}</td>
                    <td className="px-8 py-6">
                      <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${obtenerClaseEstado(v.estado)}`}>
                        • {v.estado}
                      </span>
                    </td>
                    <td className="px-8 py-6 text-right">
                      <Button variant="link" className="text-[#8B5E3C] font-bold text-xs p-0">Ver Detalle</Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </Card>

        {/* KPIs dinámicos (Conectados a la data del Service) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="md:col-span-2 p-8 border-none shadow-sm rounded-[2.5rem] bg-gradient-to-br from-neutral-200 to-neutral-100 relative overflow-hidden group">
            <div className="relative z-10">
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-neutral-500 mb-6">Resumen del Mes</p>
              <div className="flex gap-12">
                <div>
                  <p className="text-[10px] font-bold text-neutral-400 mb-1">VENTAS TOTALES</p>
                  <p className="text-3xl font-black text-neutral-800">$ {stats.totalVendido.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-neutral-400 mb-1">PROMEDIO</p>
                  <p className="text-3xl font-black text-neutral-800">$ {stats.promedio.toLocaleString(undefined, {maximumFractionDigits:0})}</p>
                </div>
              </div>
            </div>
            <Package className="absolute right-[-20px] bottom-[-20px] w-48 h-48 opacity-5 text-neutral-900 group-hover:scale-110 transition-transform" />
          </Card>

          <Card className="p-8 border-none shadow-sm rounded-[2.5rem] bg-[#FFDEB8] flex flex-col justify-between">
            <div>
              <Truck className="w-8 h-8 text-neutral-800 mb-4" />
              <p className="text-[10px] font-black uppercase text-neutral-600 mb-1 tracking-widest">En Tránsito</p>
              <p className="text-5xl font-black text-neutral-800">{stats.enTransito.toString().padStart(2, '0')}</p>
            </div>
            <p className="text-[10px] text-neutral-600 font-medium">Envíos pendientes de entrega</p>
          </Card>
        </div>
      </main>
    </div>
  );
}
