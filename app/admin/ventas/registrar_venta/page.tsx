"use client";
import React, { useState, useEffect, useMemo } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { 
  Search, Minus, Plus, Calendar, Package, Percent, Tag, 
  ShoppingCart, Trash2, Image as ImageIcon, Loader2, CheckCircle2 
} from "lucide-react";
import { toast, Toaster } from "sonner";

// Librerías para el Ticket Local
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

// Servicios
import { consultarProductos } from "@/lib/services/productoService";
import { crearVenta, agregarProductoVenta, confirmarYActualizarStock } from "@/lib/services/ventaService";

interface ItemCarrito {
  id_producto: number;
  nombre: string;
  precio: number;
  cantidad: number;
  stock: number;
  imagen: string | null;
}

export default function RegistrarVentaPage() {
  const [mounted, setMounted] = useState(false);
  const [busqueda, setBusqueda] = useState("");
  const [productosData, setProductosData] = useState<any[]>([]);
  const [carrito, setCarrito] = useState<ItemCarrito[]>([]);
  const [generarTicket, setGenerarTicket] = useState(true);
  const [isConfirming, setIsConfirming] = useState(false);

  // Estados para el descuento
  const [descuentoPorcentaje, setDescuentoPorcentaje] = useState<number>(0);
  const [descuentoError, setDescuentoError] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
    consultarProductos().then(setProductosData);
  }, []);

  const resultadosBusqueda = productosData.filter(p => 
    p.nombre.toLowerCase().includes(busqueda.toLowerCase()) || 
    p.id_producto.toString().includes(busqueda)
  );

  const agregarAlCarrito = (p: any) => {
    if (p.stock <= 0) return toast.error("Producto sin stock");
    setCarrito(prev => {
      const existe = prev.find(item => item.id_producto === p.id_producto);
      if (existe) {
        if (existe.cantidad >= p.stock) {
          toast.warning("Límite de stock alcanzado");
          return prev;
        }
        return prev.map(item => 
          item.id_producto === p.id_producto ? { ...item, cantidad: item.cantidad + 1 } : item
        );
      }
      return [...prev, { id_producto: p.id_producto, nombre: p.nombre, precio: p.precio, cantidad: 1, stock: p.stock, imagen: p.imagen }];
    });
    setBusqueda("");
  };

  const actualizarCantidad = (id: number, delta: number) => {
    setCarrito(prev => prev.map(item => {
      if (item.id_producto === id) {
        const nuevaCant = item.cantidad + delta;
        if (nuevaCant < 1 || nuevaCant > item.stock) return item;
        return { ...item, cantidad: nuevaCant };
      }
      return item;
    }));
  };

  const eliminarDelCarrito = (id: number) => {
    setCarrito(prev => prev.filter(item => item.id_producto !== id));
  };

  // Cálculos globales del carrito con descuento aplicado
  const calculos = useMemo(() => {
    const subtotalBase = carrito.reduce((acc, item) => acc + (item.precio * item.cantidad), 0);
    const montoDescuento = (subtotalBase * descuentoPorcentaje) / 100;
    const subtotalConDescuento = subtotalBase - montoDescuento;
    const impuestos = subtotalConDescuento * 0.16;
    const total = subtotalConDescuento + impuestos;
    
    return {
      subtotal: subtotalBase,
      montoDescuento,
      subtotalConDescuento,
      impuestos,
      total
    };
  }, [carrito, descuentoPorcentaje]);

  const handleDescuentoChange = (value: string) => {
    setDescuentoError(null);
    if (value === "") {
      setDescuentoPorcentaje(0);
      return;
    }
    const numero = parseFloat(value);
    if (isNaN(numero)) {
      setDescuentoError("Número inválido");
      return;
    }
    if (numero < 0 || numero > 100) {
      setDescuentoError("Rango 0-100%");
      return;
    }
    setDescuentoPorcentaje(numero);
  };

  // Generación de Ticket Local (HTML to PDF)
  const generarTicketLocal = async (idVenta: number) => {
    const container = document.createElement("div");
    container.style.width = "80mm";
    container.style.padding = "20px";
    container.style.backgroundColor = "#fff";
    container.style.color = "#000";
    container.style.fontFamily = "monospace";
    container.style.position = "absolute";
    container.style.left = "-9999px";

    container.innerHTML = `
      <div style="text-align: center; border-bottom: 1px dashed #000; padding-bottom: 10px;">
        <h2 style="margin: 0;">MANOS MIXTECAS</h2>
        <p style="font-size: 10px;">Ticket: #V-${idVenta}</p>
      </div>
      <table style="width: 100%; font-size: 11px; margin-top: 10px;">
        ${carrito.map(item => `
          <tr>
            <td>${item.cantidad}x ${item.nombre.substring(0, 15)}</td>
            <td style="text-align: right;">$${(item.precio * item.cantidad).toFixed(2)}</td>
          </tr>
        `).join('')}
      </table>
      <div style="border-top: 1px dashed #000; margin-top: 10px; text-align: right; font-size: 12px;">
        <p>Subtotal: $${calculos.subtotal.toFixed(2)}</p>
        ${descuentoPorcentaje > 0 ? `<p>Desc: -$${calculos.montoDescuento.toFixed(2)}</p>` : ''}
        <p>IVA: $${calculos.impuestos.toFixed(2)}</p>
        <h3 style="margin: 0;">TOTAL: $${calculos.total.toFixed(2)}</h3>
      </div>
    `;

    document.body.appendChild(container);
    try {
      const canvas = await html2canvas(container, { scale: 2 });
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF({ unit: "mm", format: [80, 150] });
      pdf.addImage(imgData, "PNG", 0, 0, 80, 150);
      pdf.save(`ticket-${idVenta}.pdf`);
    } finally {
      document.body.removeChild(container);
    }
  };

  const handleConfirmarVenta = async () => {
    if (carrito.length === 0) return;
    setIsConfirming(true);
    try {
      const venta = await crearVenta({
        id_cliente: 29, 
        total: Number(calculos.total.toFixed(2)), 
        subtotal: Number(calculos.subtotalConDescuento.toFixed(2)),
        id_metodo_pago: 1, 
        descuento_pct: descuentoPorcentaje,
        datos_envio: { nombre: "Venta", apellido: "Mostrador", direccion: "Tienda", ciudad: "Huajuapan", estado: "Oaxaca", codigo_postal: "69000", telefono: "000" }
      });

      if (!venta?.id_venta) throw new Error("Error al crear venta");

      for (const item of carrito) {
        await agregarProductoVenta({
          id_venta: venta.id_venta,
          id_producto: item.id_producto,
          cantidad: item.cantidad,
          precio_unitario: Number(item.precio.toFixed(2))
        });
      }

      await confirmarYActualizarStock(venta.id_venta);

      if (generarTicket) await generarTicketLocal(venta.id_venta);

      toast.success("¡Venta completada!");
      setCarrito([]);
      setDescuentoPorcentaje(0);
      const nuevosProds = await consultarProductos();
      setProductosData(nuevosProds);
    } catch (error: any) {
      toast.error(error.message || "Error en la venta");
    } finally {
      setIsConfirming(false);
    }
  };

  if (!mounted) return null;

  return (
    <div className="flex h-screen bg-[#F8F9FA] overflow-hidden">
      <Toaster richColors position="top-right" />
      <main className="flex-1 p-6 lg:p-10 flex flex-col gap-6">
        
        {/* Cabecera */}
        <div className="flex justify-between items-center w-full max-w-7xl mx-auto">
          <div>
            <h1 className="text-4xl font-black text-neutral-900 tracking-tight">Punto de Venta</h1>
            <p className="text-amber-600 font-bold text-xs tracking-widest uppercase font-mono">Control de Inventario Real</p>
          </div>
          <div className="bg-white px-4 py-2 rounded-2xl shadow-sm border border-neutral-100 flex items-center gap-3">
            <Calendar className="w-4 h-4 text-neutral-400" />
            <span className="font-bold text-neutral-600 text-xs uppercase">
                {new Date().toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' })}
            </span>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-8 w-full max-w-7xl mx-auto flex-1 min-h-0">
          
          <div className="flex-[1.5] flex flex-col gap-6 min-h-0">
            {/* Buscador */}
            <div className="relative group">
              <Input
                className="pl-14 h-16 bg-white rounded-[1.5rem] border-none shadow-xl text-lg"
                placeholder="Escribe para buscar artesanías..."
                value={busqueda}
                onChange={e => setBusqueda(e.target.value)}
              />
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-6 h-6 text-neutral-300" />
              {busqueda && (
                <Card className="absolute w-full mt-2 bg-white rounded-2xl shadow-2xl z-50 border-none overflow-hidden max-h-64 overflow-y-auto">
                  {resultadosBusqueda.map(p => (
                    <div key={p.id_producto} className="p-4 hover:bg-amber-50 cursor-pointer border-b border-neutral-50 flex justify-between items-center" onClick={() => agregarAlCarrito(p)}>
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-neutral-100 rounded-xl overflow-hidden flex items-center justify-center border border-neutral-200">
                           {p.imagen ? <img src={p.imagen} className="object-cover w-full h-full" alt={p.nombre}/> : <Package size={20} className="text-neutral-400" />}
                        </div>
                        <div><p className="font-bold text-neutral-800">{p.nombre}</p><p className="text-[10px] font-black text-neutral-400 uppercase">Stock: {p.stock}</p></div>
                      </div>
                      <p className="font-mono font-bold text-amber-600">$ {p.precio}</p>
                    </div>
                  ))}
                </Card>
              )}
            </div>

            {/* Carrito */}
            <Card className="flex-1 bg-white rounded-[2.5rem] border-none shadow-sm overflow-hidden flex flex-col p-8">
              <div className="flex items-center gap-3 mb-8">
                <ShoppingCart className="text-amber-500" size={24} />
                <h2 className="font-black text-xl text-neutral-800 uppercase tracking-tighter">Carrito de Venta</h2>
                <Badge className="ml-auto bg-neutral-100 text-neutral-500 border-none px-3 py-1">{carrito.length} Items</Badge>
              </div>

              <div className="flex-1 overflow-y-auto pr-2 space-y-4">
                {carrito.length > 0 ? (
                  carrito.map((item) => (
                    <div key={item.id_producto} className="flex items-center gap-4 p-4 bg-neutral-50 rounded-2xl border border-neutral-100 transition-all hover:border-amber-200">
                      <div className="w-14 h-14 bg-white rounded-xl overflow-hidden border border-neutral-200 flex-shrink-0 flex items-center justify-center">
                        {item.imagen ? <img src={item.imagen} alt={item.nombre} className="w-full h-full object-cover" /> : <ImageIcon size={20} className="text-neutral-300" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-neutral-800 mb-1">{item.nombre}</p>
                        <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">$ {item.precio.toFixed(2)}</p>
                      </div>
                      <div className="flex items-center gap-3 bg-white rounded-xl border border-neutral-200 p-1">
                        <Button size="icon" variant="ghost" className="h-8 w-8 rounded-lg" onClick={() => actualizarCantidad(item.id_producto, -1)}><Minus size={14}/></Button>
                        <span className="font-black text-neutral-800 w-5 text-center">{item.cantidad}</span>
                        <Button size="icon" variant="ghost" className="h-8 w-8 rounded-lg" onClick={() => actualizarCantidad(item.id_producto, 1)}><Plus size={14}/></Button>
                      </div>
                      <div className="w-28 text-right font-mono font-black text-neutral-900 text-lg">$ {(item.precio * item.cantidad).toLocaleString()}</div>
                      <Button variant="ghost" size="icon" className="text-neutral-300 hover:text-red-500" onClick={() => eliminarDelCarrito(item.id_producto)}><Trash2 size={18} /></Button>
                    </div>
                  ))
                ) : (
                  <div className="h-full flex flex-col items-center justify-center opacity-20"><Package size={64} className="mb-4" /><p className="font-black uppercase tracking-widest text-xs">Sin productos en la lista</p></div>
                )}
              </div>
            </Card>
          </div>

          {/* Checkout Panel Oscuro */}
          <div className="flex-1 lg:max-w-[420px]">
            <div className="bg-[#171717] rounded-[3rem] p-10 h-full flex flex-col border border-white/5 shadow-2xl relative overflow-hidden text-white">
              <h3 className="text-[10px] font-black text-amber-500 mb-10 tracking-[0.4em] uppercase">Checkout</h3>
              
              <div className="space-y-6 flex-1">
                <div className="flex justify-between text-neutral-400 font-bold text-xs uppercase"><span>Subtotal</span><span className="font-mono">$ {calculos.subtotal.toLocaleString()}</span></div>
                
                {/* Descuento */}
                <div className="pt-4 border-t border-white/10">
                  <div className="flex items-center gap-2 mb-3">
                    <Tag className="w-4 h-4 text-amber-500" />
                    <Label className="text-xs font-bold text-neutral-300 uppercase">Descuento %</Label>
                  </div>
                  <Input
                    type="number"
                    value={descuentoPorcentaje || ""}
                    onChange={(e) => handleDescuentoChange(e.target.value)}
                    className="bg-neutral-800/50 border-white/10 text-white rounded-xl h-11"
                  />
                  {descuentoError && <p className="text-red-400 text-[10px] mt-1">{descuentoError}</p>}
                </div>

                <div className="flex justify-between text-neutral-400 font-bold text-xs uppercase"><span>IVA (16%)</span><span className="font-mono">$ {calculos.impuestos.toLocaleString(undefined, { maximumFractionDigits: 2 })}</span></div>
                
                <div className="pt-10 border-t border-white/5 flex flex-col items-end">
                  <span className="text-[10px] font-black text-amber-500 uppercase tracking-[0.2em] mb-4">Total a Pagar</span>
                  <span className="text-6xl font-black font-mono">${calculos.total.toLocaleString(undefined, { maximumFractionDigits: 2 })}</span>
                </div>
              </div>

              <div className="mt-10 space-y-6">
                <div className="flex items-center justify-between bg-white/5 p-5 rounded-3xl border border-white/5">
                  <Label className="text-[10px] font-black text-neutral-300 uppercase">Generar Ticket</Label>
                  <Switch checked={generarTicket} onCheckedChange={setGenerarTicket} />
                </div>

                <Button 
                  disabled={carrito.length === 0 || isConfirming || !!descuentoError}
                  onClick={handleConfirmarVenta}
                  className="w-full h-20 rounded-[2rem] text-lg font-black bg-amber-500 hover:bg-amber-400 text-white shadow-2xl transition-all active:scale-95 flex gap-3"
                >
                  {isConfirming ? <Loader2 className="animate-spin" /> : <><CheckCircle2 /> CONFIRMAR</>}
                </Button>
                <p className="text-[9px] text-neutral-500 text-center uppercase tracking-widest opacity-50">Transacción Segura • Inventario Real</p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}