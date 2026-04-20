"use client";
import { useRouter } from "next/navigation";
// import { Sidebar } from "@/components/layout/sidebar";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { ShoppingCart, Clock, User, CheckCircle, Ticket, TrendingUp, Truck } from "lucide-react";
import Image from "next/image";

export default function VentasOpcionesModuloPage() {
  const router = useRouter();
  return (
    <div className="flex min-h-screen">
      {/* <Sidebar /> */}
      <main className="flex-1 bg-muted/40 p-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-xs text-muted-foreground mb-2 tracking-widest">
            VENTAS <span className="text-foreground font-semibold">/ Selección de Acción</span>
          </div>
          <h1 className="text-3xl font-bold mb-1">Módulo de Ventas</h1>
          <p className="text-muted-foreground mb-8 max-w-2xl">Gestiona el ciclo de ventas, consulta historiales y mantén el control de tus ingresos con precisión artesanal.</p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
            {/* Registrar venta */}
            <Card className="flex flex-col items-start gap-4 p-6 cursor-pointer hover:shadow-lg transition min-h-[180px]" onClick={() => router.push("/admin/ventas/registrar_venta")}> 
              <div className="flex items-center justify-center w-12 h-12 rounded-full bg-orange-200 mb-2">
                <ShoppingCart className="w-6 h-6 text-orange-700" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-lg mb-1">Registrar venta</div>
                <div className="text-muted-foreground text-sm mb-2">Registra una nueva transacción, valida stock y actualiza el inventario en tiempo real. Sistema integrado de facturación.</div>
                <span className="text-xs text-yellow-900 font-mono">Ir al formulario →</span>
              </div>
            </Card>

            {/* Consultar ventas */}
            <Card className="flex flex-col items-start gap-4 p-6 cursor-pointer hover:shadow-lg transition min-h-[180px]" onClick={() => router.push("/admin/ventas/consultar_ventas")}> 
              <div className="flex items-center justify-center w-12 h-12 rounded-full bg-muted/60 mb-2">
                <Clock className="w-6 h-6 text-muted-foreground" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-lg mb-1">Consultar ventas</div>
                <div className="text-muted-foreground text-sm mb-2">Historial completo de ventas con folios, filtros por fecha y estados de entrega. Analítica de rendimiento diario.</div>
                <span className="text-xs text-yellow-900 font-mono">Ver historial →</span>
              </div>
            </Card>
          </div>

          {/* Venta reciente */}
          <Card className="flex flex-col md:flex-row items-center md:items-stretch gap-4 p-6 mb-4">
            <div className="flex items-center gap-4 flex-1 min-w-0">
              <div className="w-14 h-14 rounded-full overflow-hidden border-4 border-orange-200 flex items-center justify-center bg-white">
                <Image src="/placeholder-user.jpg" alt="Cliente" width={56} height={56} className="object-cover w-full h-full" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-xs text-muted-foreground font-semibold mb-1">VENTA RECIENTE</div>
                <div className="font-semibold text-lg mb-1">Cliente: Juana Pérez</div>
                <div className="text-xs text-muted-foreground">Folio: #CUR-2023-894</div>
              </div>
            </div>
            <div className="flex flex-col items-end justify-center min-w-[180px]">
              <div className="font-bold text-2xl text-orange-900 mb-1">$4,250.00 <span className="text-xs text-muted-foreground font-normal">MXN</span></div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span className="text-xs text-green-700 font-semibold">ENTREGADO Y PAGADO</span>
              </div>
            </div>
          </Card>

          {/* Métricas */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
            <Card className="flex flex-col items-center justify-center gap-2 p-6">
              <Ticket className="w-6 h-6 text-orange-700 mb-1" />
              <div className="text-xs text-muted-foreground">TICKETS PENDIENTES</div>
              <div className="font-bold text-2xl">12</div>
            </Card>
            <Card className="flex flex-col items-center justify-center gap-2 p-6">
              <TrendingUp className="w-6 h-6 text-orange-700 mb-1" />
              <div className="text-xs text-muted-foreground">META DIARIA</div>
              <div className="font-bold text-2xl">85%</div>
            </Card>
            <Card className="flex flex-col items-center justify-center gap-2 p-6">
              <Truck className="w-6 h-6 text-orange-700 mb-1" />
              <div className="text-xs text-muted-foreground">EN TRÁNSITO</div>
              <div className="font-bold text-2xl">04</div>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
