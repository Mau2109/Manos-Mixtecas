"use client";
import React, { useState } from "react";
import { Sidebar } from "@/components/layout/sidebar";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Alert } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Search, Minus, Plus, Calendar, Package } from "lucide-react";

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
  const stockDisponible = PRODUCTO.stock;
  const subtotal = cantidad * PRODUCTO.precio;
  const impuestos = subtotal * 0.16;
  const total = subtotal + impuestos;
  const stockInsuficiente = cantidad > stockDisponible;

  const handleCantidad = (delta: number) => {
    setCantidad((prev) => {
      let next = prev + delta;
      return next < 1 ? 1 : next;
    });
  };

  return (
    <div className="flex h-screen bg-[#FBFBFB] overflow-hidden">
      <Sidebar />
      <main className="flex-1 p-6 lg:p-10 flex flex-col">
        
        {/* Header */}
        <div className="flex justify-between items-start mb-6 w-full max-w-6xl mx-auto">
          <div>
            <h1 className="text-3xl font-black tracking-tight text-neutral-900">Registrar Venta</h1>
            <p className="text-[10px] font-mono text-amber-700 font-bold uppercase tracking-[0.2em]">REF: SLS-2024-001</p>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-xl border border-neutral-100 shadow-sm text-neutral-600">
            <Calendar className="w-4 h-4" />
            <span className="text-xs font-bold uppercase">24 OCT 2023</span>
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

          {/* Columna Derecha: PANEL OSCURO FORZADO */}
          <div className="flex-1 min-w-[340px]">
            <div 
              style={{ backgroundColor: '#171717', color: 'white' }} 
              className="rounded-[2.5rem] p-8 shadow-2xl h-full flex flex-col border border-white/5"
            >
              <h3 className="text-[11px] font-bold text-amber-500 mb-8 tracking-[0.2em] uppercase">Resumen de Venta</h3>
              
              <div className="space-y-8 flex-1">
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
                    <span className="text-[10px] font-bold">⚠️ STOCK SUPERADO (Max: {stockDisponible})</span>
                  </Alert>
                )}

                {/* Desglose Gastos */}
                <div className="space-y-4 pt-6 border-t border-white/10">
                  <div className="flex justify-between text-neutral-400 text-sm font-medium">
                    <span>Subtotal</span>
                    <span className="font-mono text-white">$ {subtotal.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-neutral-400 text-sm font-medium">
                    <span>IVA (16%)</span>
                    <span className="font-mono text-white">$ {impuestos.toLocaleString()}</span>
                  </div>
                  
                  <div className="pt-6 mt-4 flex flex-col items-end border-t border-white/5">
                    <span className="text-[10px] font-black text-amber-500 uppercase tracking-widest">Total a pagar</span>
                    <span className="text-5xl font-black text-white font-mono leading-none mt-2">
                      ${total.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>

              {/* Botón Final */}
              <div className="mt-8">
                <Button
                  style={{ backgroundColor: stockInsuficiente ? '#262626' : '#f59e0b', color: stockInsuficiente ? '#525252' : 'white' }}
                  className="w-full h-16 rounded-2xl text-base font-black tracking-widest transition-all shadow-xl active:scale-95"
                  disabled={stockInsuficiente}
                >
                  CONFIRMAR VENTA
                </Button>
                <p className="text-[9px] text-neutral-500 text-center mt-6 uppercase font-bold tracking-[0.1em] opacity-50">
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