"use client";
import { startTransition, useEffect, useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { 
  Search, Filter, Download, FileText, Calendar, 
  Bell, Package, DollarSign
} from "lucide-react";
import { 
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue 
} from "@/components/ui/select";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

type DetalleVenta = {
  id: number;
  fecha: string;
  folio: string;
  producto: string;
  cantidad: number;
  precioUnitario: number;
  monto: number;
  cliente: string;
};

// Datos de ejemplo - En producción se cargarían desde la API
const ventasEjemplo: DetalleVenta[] = [
  { id: 1, fecha: "2024-10-24", folio: "SLS-2024-001", producto: "Jarrón de Barro Negro", cantidad: 2, precioUnitario: 1250, monto: 2500, cliente: "María García" },
  { id: 2, fecha: "2024-10-23", folio: "SLS-2024-002", producto: "Rebozo de Seda", cantidad: 1, precioUnitario: 3500, monto: 3500, cliente: "Juan Pérez" },
  { id: 3, fecha: "2024-10-22", folio: "SLS-2024-003", producto: "Alebrije Tallado", cantidad: 3, precioUnitario: 850, monto: 2550, cliente: "Ana López" },
  { id: 4, fecha: "2024-10-21", folio: "SLS-2024-004", producto: "Tapete de Lana", cantidad: 1, precioUnitario: 4200, monto: 4200, cliente: "Carlos Ruiz" },
  { id: 5, fecha: "2024-10-20", folio: "SLS-2024-005", producto: "Collar de Ámbar", cantidad: 2, precioUnitario: 1800, monto: 3600, cliente: "Laura Martínez" },
  { id: 6, fecha: "2024-10-19", folio: "SLS-2024-006", producto: "Jarrón de Barro Negro", cantidad: 1, precioUnitario: 1250, monto: 1250, cliente: "Pedro Sánchez" },
  { id: 7, fecha: "2024-10-18", folio: "SLS-2024-007", producto: "Huipil Bordado", cantidad: 1, precioUnitario: 2800, monto: 2800, cliente: "Sofia Hernández" },
];

export default function ReporteVentasPage() {
  const [ventas, setVentas] = useState<DetalleVenta[]>(ventasEjemplo);
  const [loading, setLoading] = useState(false);
  const [busqueda, setBusqueda] = useState("");
  const [fechaInicio, setFechaInicio] = useState("");
  const [fechaFin, setFechaFin] = useState("");

  // Filtrar ventas
  const ventasFiltradas = useMemo(() => {
    let resultado = ventas;
    
    // Filtro por búsqueda
    if (busqueda.trim()) {
      const termino = busqueda.toLowerCase();
      resultado = resultado.filter(v => 
        v.producto.toLowerCase().includes(termino) ||
        v.folio.toLowerCase().includes(termino) ||
        v.cliente.toLowerCase().includes(termino)
      );
    }
    
    // Filtro por fecha inicio
    if (fechaInicio) {
      resultado = resultado.filter(v => v.fecha >= fechaInicio);
    }
    
    // Filtro por fecha fin
    if (fechaFin) {
      resultado = resultado.filter(v => v.fecha <= fechaFin);
    }
    
    return resultado;
  }, [ventas, busqueda, fechaInicio, fechaFin]);

  // Calcular totales
  const totales = useMemo(() => {
    const totalMonto = ventasFiltradas.reduce((acc, v) => acc + v.monto, 0);
    const totalProductos = ventasFiltradas.reduce((acc, v) => acc + v.cantidad, 0);
    return { totalMonto, totalProductos, totalVentas: ventasFiltradas.length };
  }, [ventasFiltradas]);

  // Generar y descargar CSV
  const descargarCSV = () => {
    const headers = ["Fecha", "Folio", "Producto", "Cantidad", "Precio Unitario", "Monto Total", "Cliente"];
    const csvContent = [
      headers.join(","),
      ...ventasFiltradas.map(v => [
        v.fecha,
        v.folio,
        `"${v.producto}"`,
        v.cantidad,
        v.precioUnitario,
        v.monto,
        `"${v.cliente}"`
      ].join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `reporte_ventas_${new Date().toISOString().split("T")[0]}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Generar y descargar PDF (simulado como texto formateado)
  const descargarPDF = () => {
    // Crear contenido HTML para el PDF
    const contenidoHTML = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Reporte de Ventas - Manos Mixtecas</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 40px; }
          h1 { color: #8B5E3C; border-bottom: 2px solid #8B5E3C; padding-bottom: 10px; }
          .info { margin: 20px 0; color: #666; }
          table { width: 100%; border-collapse: collapse; margin-top: 20px; }
          th { background: #8B5E3C; color: white; padding: 12px; text-align: left; }
          td { padding: 10px; border-bottom: 1px solid #ddd; }
          tr:hover { background: #f5f5f5; }
          .total { margin-top: 30px; text-align: right; font-size: 18px; font-weight: bold; }
          .footer { margin-top: 40px; text-align: center; color: #999; font-size: 12px; }
        </style>
      </head>
      <body>
        <h1>Reporte de Ventas</h1>
        <div class="info">
          <p><strong>Fecha de generación:</strong> ${new Date().toLocaleDateString("es-MX")}</p>
          <p><strong>Período:</strong> ${fechaInicio || "Inicio"} - ${fechaFin || "Actual"}</p>
          <p><strong>Total de registros:</strong> ${ventasFiltradas.length}</p>
        </div>
        <table>
          <thead>
            <tr>
              <th>Fecha</th>
              <th>Folio</th>
              <th>Producto</th>
              <th>Cantidad</th>
              <th>Precio Unit.</th>
              <th>Monto</th>
              <th>Cliente</th>
            </tr>
          </thead>
          <tbody>
            ${ventasFiltradas.map(v => `
              <tr>
                <td>${new Date(v.fecha).toLocaleDateString("es-MX")}</td>
                <td>${v.folio}</td>
                <td>${v.producto}</td>
                <td>${v.cantidad}</td>
                <td>$${v.precioUnitario.toLocaleString()}</td>
                <td>$${v.monto.toLocaleString()}</td>
                <td>${v.cliente}</td>
              </tr>
            `).join("")}
          </tbody>
        </table>
        <div class="total">
          <p>Total Productos Vendidos: ${totales.totalProductos}</p>
          <p>Monto Total: $${totales.totalMonto.toLocaleString()} MXN</p>
        </div>
        <div class="footer">
          <p>Manos Mixtecas - Sistema de Gestión de Artesanías</p>
        </div>
      </body>
      </html>
    `;

    const printWindow = window.open("", "_blank");
    if (printWindow) {
      printWindow.document.write(contenidoHTML);
      printWindow.document.close();
      printWindow.print();
    }
  };

  return (
    <div className="flex h-screen bg-[#F8F9F4] overflow-hidden text-neutral-800">
      <main className="flex-1 p-8 overflow-y-auto">
        {/* Navbar */}
        <div className="flex justify-between items-center mb-8">
          <div className="relative w-96">
            <Input 
              className="pl-10 bg-white border-none shadow-sm rounded-xl h-11"
              placeholder="Buscar por producto, folio o cliente..."
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
            <h1 className="text-4xl font-bold mb-2">Reporte de Ventas</h1>
            <p className="text-neutral-500 text-sm">Genera y descarga reportes detallados de tus ventas.</p>
          </div>
          <div className="flex gap-3">
            <Button 
              onClick={descargarCSV}
              variant="outline"
              className="px-6 h-12 rounded-2xl font-bold border-[#8B5E3C] text-[#8B5E3C] hover:bg-[#8B5E3C] hover:text-white"
            >
              <Download className="w-5 h-5 mr-2" /> Descargar CSV
            </Button>
            <Button 
              onClick={descargarPDF}
              className="bg-[#8B5E3C] hover:bg-[#6F4A2F] text-white px-6 h-12 rounded-2xl font-bold shadow-lg shadow-amber-900/10"
            >
              <FileText className="w-5 h-5 mr-2" /> Generar PDF
            </Button>
          </div>
        </div>

        {/* Filtros */}
        <Card className="p-6 border-none shadow-sm rounded-[2rem] mb-6 flex flex-wrap gap-6 items-end bg-white/60">
          <div className="flex-1 min-w-[180px]">
            <label className="text-[10px] font-bold uppercase text-neutral-400 mb-2 block">Fecha Inicio</label>
            <Input 
              type="date" 
              value={fechaInicio} 
              onChange={(e) => setFechaInicio(e.target.value)} 
              className="rounded-xl" 
            />
          </div>
          <div className="flex-1 min-w-[180px]">
            <label className="text-[10px] font-bold uppercase text-neutral-400 mb-2 block">Fecha Fin</label>
            <Input 
              type="date" 
              value={fechaFin} 
              onChange={(e) => setFechaFin(e.target.value)} 
              className="rounded-xl" 
            />
          </div>
          <Button
            onClick={() => {
              setFechaInicio("");
              setFechaFin("");
              setBusqueda("");
            }}
            variant="outline"
            className="h-10 px-6 rounded-xl border-neutral-200 bg-neutral-100 font-bold"
          >
            <Filter className="w-4 h-4 mr-2" /> Limpiar Filtros
          </Button>
        </Card>

        {/* KPIs del Reporte */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <Card className="p-6 border-none shadow-sm rounded-[2rem] bg-white">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase text-neutral-400">Monto Total</p>
                <p className="text-2xl font-black text-neutral-800">${totales.totalMonto.toLocaleString()}</p>
              </div>
            </div>
          </Card>
          <Card className="p-6 border-none shadow-sm rounded-[2rem] bg-white">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                <Package className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase text-neutral-400">Productos Vendidos</p>
                <p className="text-2xl font-black text-neutral-800">{totales.totalProductos}</p>
              </div>
            </div>
          </Card>
          <Card className="p-6 border-none shadow-sm rounded-[2rem] bg-white">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center">
                <Calendar className="w-6 h-6 text-amber-600" />
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase text-neutral-400">Total Ventas</p>
                <p className="text-2xl font-black text-neutral-800">{totales.totalVentas}</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Tabla de Ventas */}
        <Card className="border-none shadow-sm rounded-[2rem] overflow-hidden bg-white">
          <Table>
            <TableHeader>
              <TableRow className="bg-neutral-50 border-b border-neutral-100">
                <TableHead className="px-6 py-4 text-[10px] font-bold uppercase text-neutral-400">Fecha</TableHead>
                <TableHead className="px-6 py-4 text-[10px] font-bold uppercase text-neutral-400">Folio</TableHead>
                <TableHead className="px-6 py-4 text-[10px] font-bold uppercase text-neutral-400">Producto</TableHead>
                <TableHead className="px-6 py-4 text-[10px] font-bold uppercase text-neutral-400 text-center">Cantidad</TableHead>
                <TableHead className="px-6 py-4 text-[10px] font-bold uppercase text-neutral-400 text-right">Precio Unit.</TableHead>
                <TableHead className="px-6 py-4 text-[10px] font-bold uppercase text-neutral-400 text-right">Monto</TableHead>
                <TableHead className="px-6 py-4 text-[10px] font-bold uppercase text-neutral-400">Cliente</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} className="px-6 py-12 text-center text-sm text-neutral-500">
                    Cargando reporte...
                  </TableCell>
                </TableRow>
              ) : ventasFiltradas.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="px-6 py-12 text-center text-sm text-neutral-500">
                    No se encontraron ventas con los filtros seleccionados.
                  </TableCell>
                </TableRow>
              ) : (
                ventasFiltradas.map((venta) => (
                  <TableRow key={venta.id} className="hover:bg-neutral-50/50 transition-colors">
                    <TableCell className="px-6 py-4 text-neutral-500">
                      {new Date(venta.fecha).toLocaleDateString("es-MX")}
                    </TableCell>
                    <TableCell className="px-6 py-4 font-mono font-bold text-[#8B5E3C]">
                      {venta.folio}
                    </TableCell>
                    <TableCell className="px-6 py-4 font-medium text-neutral-700">
                      {venta.producto}
                    </TableCell>
                    <TableCell className="px-6 py-4 text-center font-bold">
                      {venta.cantidad}
                    </TableCell>
                    <TableCell className="px-6 py-4 text-right font-mono">
                      ${venta.precioUnitario.toLocaleString()}
                    </TableCell>
                    <TableCell className="px-6 py-4 text-right font-bold text-green-600">
                      ${venta.monto.toLocaleString()}
                    </TableCell>
                    <TableCell className="px-6 py-4 text-neutral-600">
                      {venta.cliente}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </Card>
      </main>
    </div>
  );
}
