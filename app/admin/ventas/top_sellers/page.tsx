"use client";
import { useMemo, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Trophy, Medal, TrendingUp, Package, 
  Bell, Calendar, Star, Award
} from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";

type ProductoTopSeller = {
  id: number;
  nombre: string;
  categoria: string;
  imagen?: string;
  cantidadVendida: number;
  ingresoTotal: number;
  porcentajeVentas: number;
};

// Datos de ejemplo - En producción se cargarían desde la API
const topSellersEjemplo: ProductoTopSeller[] = [
  { 
    id: 1, 
    nombre: "Jarrón de Barro Negro", 
    categoria: "Cerámica Oaxaqueña", 
    cantidadVendida: 145, 
    ingresoTotal: 181250, 
    porcentajeVentas: 28 
  },
  { 
    id: 2, 
    nombre: "Rebozo de Seda", 
    categoria: "Textiles", 
    cantidadVendida: 98, 
    ingresoTotal: 343000, 
    porcentajeVentas: 19 
  },
  { 
    id: 3, 
    nombre: "Alebrije Tallado", 
    categoria: "Madera", 
    cantidadVendida: 87, 
    ingresoTotal: 73950, 
    porcentajeVentas: 17 
  },
  { 
    id: 4, 
    nombre: "Collar de Ámbar", 
    categoria: "Joyería", 
    cantidadVendida: 76, 
    ingresoTotal: 136800, 
    porcentajeVentas: 15 
  },
  { 
    id: 5, 
    nombre: "Tapete de Lana", 
    categoria: "Textiles", 
    cantidadVendida: 54, 
    ingresoTotal: 226800, 
    porcentajeVentas: 11 
  },
];

const getMedalColor = (posicion: number) => {
  switch (posicion) {
    case 1: return "bg-gradient-to-br from-yellow-400 to-amber-500 text-white";
    case 2: return "bg-gradient-to-br from-gray-300 to-gray-400 text-white";
    case 3: return "bg-gradient-to-br from-amber-600 to-amber-700 text-white";
    default: return "bg-neutral-200 text-neutral-600";
  }
};

const getMedalIcon = (posicion: number) => {
  if (posicion === 1) return <Trophy className="w-5 h-5" />;
  if (posicion <= 3) return <Medal className="w-5 h-5" />;
  return <Award className="w-4 h-4" />;
};

export default function TopSellersPage() {
  const [topSellers] = useState<ProductoTopSeller[]>(topSellersEjemplo);
  const [fechaInicio, setFechaInicio] = useState("");
  const [fechaFin, setFechaFin] = useState("");

  // Calcular totales
  const totales = useMemo(() => {
    const totalVendido = topSellers.reduce((acc, p) => acc + p.cantidadVendida, 0);
    const totalIngresos = topSellers.reduce((acc, p) => acc + p.ingresoTotal, 0);
    return { totalVendido, totalIngresos };
  }, [topSellers]);

  const liderActual = topSellers[0];

  return (
    <div className="flex h-screen bg-[#F8F9F4] overflow-hidden text-neutral-800">
      <main className="flex-1 p-8 overflow-y-auto">
        {/* Navbar */}
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-xl border border-neutral-100 shadow-sm">
              <TrendingUp className="w-5 h-5 text-green-500" />
              <span className="text-sm font-bold text-neutral-600">Análisis de Demanda</span>
            </div>
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
            <h1 className="text-4xl font-bold mb-2">Top Sellers</h1>
            <p className="text-neutral-500 text-sm">Ranking de los 5 productos más vendidos para identificar artesanías con mayor demanda.</p>
          </div>
        </div>

        {/* Filtros de Fecha */}
        <Card className="p-6 border-none shadow-sm rounded-[2rem] mb-6 flex flex-wrap gap-6 items-end bg-white/60">
          <div className="flex-1 min-w-[180px]">
            <label className="text-[10px] font-bold uppercase text-neutral-400 mb-2 block">Período Inicio</label>
            <Input 
              type="date" 
              value={fechaInicio} 
              onChange={(e) => setFechaInicio(e.target.value)} 
              className="rounded-xl" 
            />
          </div>
          <div className="flex-1 min-w-[180px]">
            <label className="text-[10px] font-bold uppercase text-neutral-400 mb-2 block">Período Fin</label>
            <Input 
              type="date" 
              value={fechaFin} 
              onChange={(e) => setFechaFin(e.target.value)} 
              className="rounded-xl" 
            />
          </div>
          <Button
            variant="outline"
            className="h-10 px-6 rounded-xl border-neutral-200 bg-neutral-100 font-bold"
          >
            <Calendar className="w-4 h-4 mr-2" /> Aplicar Período
          </Button>
        </Card>

        {/* Producto Líder Destacado */}
        <Card className="p-8 border-none shadow-lg rounded-[2.5rem] mb-8 bg-gradient-to-br from-amber-50 to-orange-50 relative overflow-hidden">
          <div className="absolute top-4 right-4">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-yellow-400 to-amber-500 flex items-center justify-center shadow-lg">
              <Trophy className="w-8 h-8 text-white" />
            </div>
          </div>
          <div className="flex items-start gap-6">
            <div className="w-24 h-24 rounded-2xl bg-white shadow-md flex items-center justify-center">
              <Package className="w-10 h-10 text-amber-600" />
            </div>
            <div className="flex-1">
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-amber-600 mb-2">Producto Más Vendido</p>
              <h2 className="text-3xl font-black text-neutral-800 mb-1">{liderActual.nombre}</h2>
              <p className="text-neutral-500 font-medium mb-4">{liderActual.categoria}</p>
              <div className="flex gap-8">
                <div>
                  <p className="text-[10px] font-bold text-neutral-400 uppercase">Unidades Vendidas</p>
                  <p className="text-2xl font-black text-neutral-800">{liderActual.cantidadVendida}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-neutral-400 uppercase">Ingresos Generados</p>
                  <p className="text-2xl font-black text-green-600">${liderActual.ingresoTotal.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-neutral-400 uppercase">% del Total</p>
                  <p className="text-2xl font-black text-amber-600">{liderActual.porcentajeVentas}%</p>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Ranking Completo */}
        <div className="grid grid-cols-1 gap-4 mb-8">
          <h3 className="text-lg font-bold text-neutral-700 mb-2 flex items-center gap-2">
            <Star className="w-5 h-5 text-amber-500" /> Ranking Top 5
          </h3>
          
          {topSellers.map((producto, index) => (
            <Card 
              key={producto.id} 
              className={`p-6 border-none shadow-sm rounded-[1.5rem] bg-white hover:shadow-md transition-shadow ${index === 0 ? 'ring-2 ring-amber-400/50' : ''}`}
            >
              <div className="flex items-center gap-6">
                {/* Posición */}
                <div className={`w-12 h-12 rounded-full flex items-center justify-center font-black text-lg ${getMedalColor(index + 1)}`}>
                  {getMedalIcon(index + 1)}
                </div>
                
                {/* Imagen del producto */}
                <div className="w-16 h-16 rounded-xl bg-neutral-100 flex items-center justify-center">
                  <Package className="w-8 h-8 text-neutral-400" />
                </div>
                
                {/* Info del producto */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-bold text-lg text-neutral-800 truncate">{producto.nombre}</h4>
                    {index === 0 && (
                      <span className="px-2 py-0.5 bg-amber-100 text-amber-700 text-[9px] font-bold uppercase rounded-full">
                        Líder
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-neutral-500">{producto.categoria}</p>
                  
                  {/* Barra de progreso */}
                  <div className="mt-3">
                    <Progress 
                      value={producto.porcentajeVentas} 
                      className="h-2 bg-neutral-100"
                    />
                  </div>
                </div>
                
                {/* Estadísticas */}
                <div className="text-right min-w-[120px]">
                  <p className="text-[10px] font-bold text-neutral-400 uppercase">Vendidos</p>
                  <p className="text-xl font-black text-neutral-800">{producto.cantidadVendida}</p>
                </div>
                
                <div className="text-right min-w-[140px]">
                  <p className="text-[10px] font-bold text-neutral-400 uppercase">Ingresos</p>
                  <p className="text-xl font-black text-green-600">${producto.ingresoTotal.toLocaleString()}</p>
                </div>
                
                <div className="text-right min-w-[80px]">
                  <p className="text-[10px] font-bold text-neutral-400 uppercase">% Ventas</p>
                  <p className="text-xl font-black text-amber-600">{producto.porcentajeVentas}%</p>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Resumen de Totales */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="p-8 border-none shadow-sm rounded-[2.5rem] bg-gradient-to-br from-neutral-200 to-neutral-100 relative overflow-hidden">
            <div className="relative z-10">
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-neutral-500 mb-4">Resumen Top 5</p>
              <div className="flex gap-12">
                <div>
                  <p className="text-[10px] font-bold text-neutral-400 mb-1">UNIDADES TOTALES</p>
                  <p className="text-3xl font-black text-neutral-800">{totales.totalVendido}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-neutral-400 mb-1">INGRESOS TOTALES</p>
                  <p className="text-3xl font-black text-green-600">${totales.totalIngresos.toLocaleString()}</p>
                </div>
              </div>
            </div>
            <Package className="absolute right-[-20px] bottom-[-20px] w-40 h-40 opacity-5 text-neutral-900" />
          </Card>

          <Card className="p-8 border-none shadow-sm rounded-[2.5rem] bg-[#FFDEB8] flex flex-col justify-between">
            <div>
              <TrendingUp className="w-8 h-8 text-neutral-800 mb-4" />
              <p className="text-[10px] font-black uppercase text-neutral-600 mb-1 tracking-widest">Recomendación</p>
              <p className="text-lg font-bold text-neutral-800 mb-2">Aumentar Stock</p>
            </div>
            <p className="text-sm text-neutral-600">
              Considera pedir más stock de <strong>{liderActual.nombre}</strong> para satisfacer la alta demanda.
            </p>
          </Card>
        </div>
      </main>
    </div>
  );
}
