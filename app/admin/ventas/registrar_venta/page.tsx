"use client";
import React, { useState, useMemo } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Alert } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Search, Minus, Plus, Calendar, Package, Percent, Tag } from "lucide-react";

const PRODUCTO = {
  nombre: "Jarrón de Barro Negro",
  categoria: "Cerámica Oaxaqueña",
  sku: "MM-CER-042",
  precio: 1250,
  stock: 5,
};

export default function RegistrarVentaPage() {
  const [cantidad, setCantidad] = useState(1);
  const [busqueda, setBusqueda] = useState("");
  
  // Estados para el descuento
  const [descuentoPorcentaje, setDescuentoPorcentaje] = useState<number>(0);
  const [descuentoError, setDescuentoError] = useState<string | null>(null);
  
  const stockDisponible = PRODUCTO.stock;
  const stockInsuficiente = cantidad > stockDisponible;

  // Cálculos con descuento
  const calculos = useMemo(() => {
    const subtotal = cantidad * PRODUCTO.precio;
    const montoDescuento = (subtotal * descuentoPorcentaje) / 100;
    const subtotalConDescuento = subtotal - montoDescuento;
    const impuestos = subtotalConDescuento * 0.16;
    const total = subtotalConDescuento + impuestos;
    
    return {
      subtotal,
      montoDescuento,
      subtotalConDescuento,
      impuestos,
      total
    };
  }, [cantidad, descuentoPorcentaje]);

  const handleCantidad = (delta: number) => {
    setCantidad((prev) => {
      let next = prev + delta;
      return next < 1 ? 1 : next;
    });
  };

  // Manejar cambio de descuento con validación
  const handleDescuentoChange = (value: string) => {
    setDescuentoError(null);
    
    // Permitir campo vacío
    if (value === "") {
      setDescuentoPorcentaje(0);
      return;
    }
    
    const numero = parseFloat(value);
    
    // Validar que sea un número
    if (isNaN(numero)) {
      setDescuentoError("Ingresa un número válido");
      return;
    }
    
    // Validar que sea positivo
    if (numero < 0) {
      setDescuentoError("El descuento debe ser un valor positivo");
      return;
    }
    
    // Validar que no exceda 100%
    if (numero > 100) {
      setDescuentoError("El descuento no puede ser mayor a 100%");
      return;
    }
    
    setDescuentoPorcentaje(numero);
  };

  // Aplicar descuentos predefinidos
  const aplicarDescuentoRapido = (porcentaje: number) => {
    setDescuentoError(null);
    setDescuentoPorcentaje(porcentaje);
  };

  return (
    <div className="flex h-screen bg-[#FBFBFB] overflow-hidden">
      <main className="flex-1 p-6 lg:p-10 flex flex-col">
        
        {/* Header */}
        <div className="flex justify-between items-start mb-6 w-full max-w-6xl mx-auto">
          <div>
            <h1 className="text-3xl font-black tracking-tight text-neutral-900">Registrar Venta</h1>
            <p className="text-[10px] font-mono text-amber-700 font-bold uppercase tracking-[0.2em]">REF: SLS-2024-001</p>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-xl border border-neutral-100 shadow-sm text-neutral-600">
            <Calendar className="w-4 h-4" />
            <span className="text-xs font-bold uppercase">{new Date().toLocaleDateString("es-MX", { day: "2-digit", month: "short", year: "numeric" })}</span>
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-6 w-full max-w-6xl mx-auto flex-1 min-h-0">
          
          {/* Columna Izquierda */}
          <div className="flex-[1.4] flex flex-col gap-6 min-h-0">
            <div className="relative">
              <Input
                className="pl-12 h-12 bg-white rounded-xl border-neutral-200 shadow-sm"
                placeholder="Buscar por nombre o SKU..."
                value={busqueda}
                onChange={e => setBusqueda(e.target.value)}
              />
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
            </div>

            <Card className="rounded-[2rem] overflow-hidden border border-neutral-100 shadow-xl bg-white flex-1 flex flex-col min-h-0">
              <div className="relative w-full h-40 bg-neutral-50 flex items-center justify-center flex-shrink-0">
                <Package className="w-12 h-12 text-neutral-200" />
                <Badge className="absolute top-4 left-4 bg-amber-600 text-white border-none">EN SELECCIÓN</Badge>
              </div>

              <div className="p-6 flex flex-col justify-between flex-1">
                <div className="flex justify-between items-start">
                  <div>
                    <h2 className="font-bold text-2xl text-neutral-800 leading-tight">{PRODUCTO.nombre}</h2>
                    <p className="text-neutral-500 text-sm font-medium italic">{PRODUCTO.categoria}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-tighter">Unitario</span>
                    <p className="font-mono text-2xl font-black text-neutral-900">$ {PRODUCTO.precio.toFixed(2)}</p>
                  </div>
                </div>

                <div className="flex gap-3 mt-4">
                  <div className="flex-1 bg-neutral-50 rounded-xl p-3 border border-neutral-100 text-center">
                    <span className="text-[9px] font-bold text-neutral-400 uppercase block">SKU</span>
                    <span className="font-mono font-bold text-neutral-700 text-sm">{PRODUCTO.sku}</span>
                  </div>
                  <div className="flex-1 bg-neutral-50 rounded-xl p-3 border border-neutral-100 text-center">
                    <span className="text-[9px] font-bold text-neutral-400 uppercase block">Stock</span>
                    <span className="font-mono font-bold text-neutral-700 text-sm">
                      {PRODUCTO.stock.toString().padStart(2, "0")} Unds
                    </span>
                  </div>
                </div>
              </div>
            </Card>
          </div>

          {/* Columna Derecha: PANEL OSCURO */}
          <div className="flex-1 min-w-[340px]">
            <div 
              style={{ backgroundColor: '#171717', color: 'white' }} 
              className="rounded-[2.5rem] p-8 shadow-2xl h-full flex flex-col border border-white/5"
            >
              <h3 className="text-[11px] font-bold text-amber-500 mb-6 tracking-[0.2em] uppercase">Resumen de Venta</h3>
              
              <div className="space-y-6 flex-1">
                {/* Selector Unidades */}
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-neutral-300">Unidades</span>
                  <div className="flex items-center gap-4 bg-neutral-800/50 p-1.5 rounded-2xl border border-white/10">
                    <Button 
                      size="icon" variant="ghost" 
                      style={{ color: 'white' }}
                      className="h-9 w-9 hover:bg-neutral-700 rounded-xl"
                      onClick={() => handleCantidad(-1)}
                    >
                      <Minus className="w-4 h-4" />
                    </Button>
                    <span className="w-6 text-center font-black text-white text-xl">{cantidad}</span>
                    <Button 
                      size="icon" variant="ghost" 
                      style={{ color: 'white' }}
                      className="h-9 w-9 hover:bg-neutral-700 rounded-xl"
                      onClick={() => handleCantidad(1)}
                    >
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                {stockInsuficiente && (
                  <Alert className="bg-red-950/40 border-red-500/50 text-red-200 py-2 rounded-xl">
                    <span className="text-[10px] font-bold">Stock insuficiente (Máx: {stockDisponible})</span>
                  </Alert>
                )}

                {/* Campo de Descuento */}
                <div className="pt-4 border-t border-white/10">
                  <div className="flex items-center gap-2 mb-3">
                    <Tag className="w-4 h-4 text-amber-500" />
                    <Label className="text-sm font-bold text-neutral-300">Aplicar Descuento</Label>
                  </div>
                  
                  <div className="relative">
                    <Input
                      type="number"
                      min="0"
                      max="100"
                      step="0.5"
                      placeholder="0"
                      value={descuentoPorcentaje || ""}
                      onChange={(e) => handleDescuentoChange(e.target.value)}
                      className="bg-neutral-800/50 border-white/10 text-white pr-10 rounded-xl h-11 font-mono text-lg"
                    />
                    <Percent className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                  </div>
                  
                  {descuentoError && (
                    <p className="text-red-400 text-[10px] mt-2 font-bold">{descuentoError}</p>
                  )}
                  
                  {/* Botones de descuento rápido */}
                  <div className="flex gap-2 mt-3">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => aplicarDescuentoRapido(5)}
                      className={`flex-1 h-8 text-[10px] font-bold rounded-lg border-white/10 ${descuentoPorcentaje === 5 ? 'bg-amber-600 text-white border-amber-600' : 'bg-transparent text-neutral-400 hover:bg-neutral-800'}`}
                    >
                      5%
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => aplicarDescuentoRapido(10)}
                      className={`flex-1 h-8 text-[10px] font-bold rounded-lg border-white/10 ${descuentoPorcentaje === 10 ? 'bg-amber-600 text-white border-amber-600' : 'bg-transparent text-neutral-400 hover:bg-neutral-800'}`}
                    >
                      10%
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => aplicarDescuentoRapido(15)}
                      className={`flex-1 h-8 text-[10px] font-bold rounded-lg border-white/10 ${descuentoPorcentaje === 15 ? 'bg-amber-600 text-white border-amber-600' : 'bg-transparent text-neutral-400 hover:bg-neutral-800'}`}
                    >
                      15%
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => aplicarDescuentoRapido(20)}
                      className={`flex-1 h-8 text-[10px] font-bold rounded-lg border-white/10 ${descuentoPorcentaje === 20 ? 'bg-amber-600 text-white border-amber-600' : 'bg-transparent text-neutral-400 hover:bg-neutral-800'}`}
                    >
                      20%
                    </Button>
                  </div>
                </div>

                {/* Desglose Gastos */}
                <div className="space-y-3 pt-4 border-t border-white/10">
                  <div className="flex justify-between text-neutral-400 text-sm font-medium">
                    <span>Subtotal</span>
                    <span className="font-mono text-white">$ {calculos.subtotal.toLocaleString()}</span>
                  </div>
                  
                  {/* Mostrar descuento si aplica */}
                  {descuentoPorcentaje > 0 && (
                    <div className="flex justify-between text-sm font-medium">
                      <span className="text-green-400 flex items-center gap-1">
                        <Tag className="w-3 h-3" />
                        Descuento ({descuentoPorcentaje}%)
                      </span>
                      <span className="font-mono text-green-400">- $ {calculos.montoDescuento.toLocaleString()}</span>
                    </div>
                  )}
                  
                  {descuentoPorcentaje > 0 && (
                    <div className="flex justify-between text-neutral-400 text-sm font-medium">
                      <span>Subtotal con descuento</span>
                      <span className="font-mono text-white">$ {calculos.subtotalConDescuento.toLocaleString()}</span>
                    </div>
                  )}
                  
                  <div className="flex justify-between text-neutral-400 text-sm font-medium">
                    <span>IVA (16%)</span>
                    <span className="font-mono text-white">$ {calculos.impuestos.toLocaleString(undefined, { maximumFractionDigits: 2 })}</span>
                  </div>
                  
                  <div className="pt-4 mt-2 flex flex-col items-end border-t border-white/5">
                    <span className="text-[10px] font-black text-amber-500 uppercase tracking-widest">Total a pagar</span>
                    <span className="text-4xl font-black text-white font-mono leading-none mt-2">
                      ${calculos.total.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                    </span>
                    {descuentoPorcentaje > 0 && (
                      <span className="text-[10px] text-green-400 mt-1 font-bold">
                        Ahorro: ${calculos.montoDescuento.toLocaleString()}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Botón Final */}
              <div className="mt-6">
                <Button
                  style={{ backgroundColor: stockInsuficiente || descuentoError ? '#262626' : '#f59e0b', color: stockInsuficiente || descuentoError ? '#525252' : 'white' }}
                  className="w-full h-14 rounded-2xl text-base font-black tracking-widest transition-all shadow-xl active:scale-95"
                  disabled={stockInsuficiente || !!descuentoError}
                >
                  CONFIRMAR VENTA
                </Button>
                <p className="text-[9px] text-neutral-500 text-center mt-4 uppercase font-bold tracking-[0.1em] opacity-50">
                  Transacción Segura • Inventario Real
                </p>
              </div>
            </div>
          </div>
          
        </div>
      </main>
    </div>
  );
}
