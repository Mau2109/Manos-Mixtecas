"use client";
import React, { useEffect, useState, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Toaster } from "@/components/ui/sonner";
import { Alert } from "@/components/ui/alert";
import { FileText, X, UploadCloud, Loader2 } from "lucide-react";
import { registrarCompra } from "@/lib/services/compraService";
import { listarArtesanos } from "@/lib/services/artesanoService";
import { consultarProductos } from "@/lib/services/productoService";
import { adjuntarComprobante } from "@/lib/services/comprobanteService";
import { supabase } from "@/lib/supabaseClient";
import { toast } from "sonner";

export default function RegistrarCompraPage() {
  const [mounted, setMounted] = useState(false);
  const [artesanos, setArtesanos] = useState<any[]>([]);
  const [productos, setProductos] = useState<any[]>([]);
  const [idArtesano, setIdArtesano] = useState("");
  const [idProducto, setIdProducto] = useState("");
  const [cantidad, setCantidad] = useState("");
  const [costoUnitario, setCostoUnitario] = useState("");
  const [archivoComprobante, setArchivoComprobante] = useState<File | null>(null);
  const [previewNombre, setPreviewNombre] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setMounted(true);
    listarArtesanos().then(setArtesanos);
    consultarProductos().then(setProductos);
  }, []);

  const costoTotal = Number(cantidad) > 0 && Number(costoUnitario) > 0 ? Number(cantidad) * Number(costoUnitario) : 0;
  const isFormValid = idArtesano && idProducto && Number(cantidad) > 0 && Number(costoUnitario) > 0;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setArchivoComprobante(selectedFile);
      setPreviewNombre(selectedFile.name);
    }
  };

  const subirComprobanteAStorage = async (file: File) => {
    const fileExt = file.name.split('.').pop();
    const fileName = `compra-${Date.now()}.${fileExt}`;
    const { error: uploadError } = await supabase.storage
      .from('comprobantes')
      .upload(fileName, file);

    if (uploadError) throw uploadError;
    const { data } = supabase.storage.from('comprobantes').getPublicUrl(fileName);
    return data.publicUrl;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid) return;
    setLoading(true);
    setError("");
    setSuccess("");
    try {
      const nuevaCompra = await registrarCompra({
        id_artesano: Number(idArtesano),
        detalles: [{
          id_producto: Number(idProducto),
          cantidad: Number(cantidad),
          costo_unitario: Number(costoUnitario),
        }],
      });

      if (archivoComprobante && nuevaCompra?.id_compra) {
        const urlPublica = await subirComprobanteAStorage(archivoComprobante);
        await adjuntarComprobante({
          id_compra: nuevaCompra.id_compra,
          url_archivo: urlPublica,
          tipo: archivoComprobante.type,
          descripcion: `Comprobante de compra de ${previewNombre}`
        });
      }

      setSuccess("Compra registrada con éxito");
      toast.success("¡Registro completado!");
      setIdArtesano(""); setIdProducto(""); setCantidad(""); setCostoUnitario("");
      setArchivoComprobante(null); setPreviewNombre("");
    } catch (err: any) {
      setError(err?.message || "Error en el servidor");
    } finally {
      setLoading(false);
    }
  };

  if (!mounted) return null;

  return (
    <div className="flex min-h-screen">
      <main className="flex-1 bg-muted/40 flex flex-col items-center py-10 px-4">
        <Toaster />
        <div className="w-full max-w-4xl">
          <h1 className="text-3xl font-bold mb-8">Registrar Compra</h1>

          {success && <Alert className="mb-6 bg-green-50 border-green-200 text-green-800">{success}</Alert>}
          {error && <Alert variant="destructive" className="mb-6">{error}</Alert>}

          <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-2 p-6 space-y-6">
              <div className="space-y-2">
                <Label>Artesano Proveedor</Label>
                <Select value={idArtesano} onValueChange={setIdArtesano}>
                  <SelectTrigger><SelectValue placeholder="Seleccionar artesano..." /></SelectTrigger>
                  <SelectContent>
                    {artesanos.map((a: any) => (
                      <SelectItem key={a.id_artesano} value={String(a.id_artesano)}>
                        {a.nombre} {a.apellido}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Producto</Label>
                <Select value={idProducto} onValueChange={setIdProducto}>
                  <SelectTrigger><SelectValue placeholder="Seleccionar producto..." /></SelectTrigger>
                  <SelectContent>
                    {productos.map((p: any) => (
                      <SelectItem key={p.id_producto} value={String(p.id_producto)}>
                        {p.nombre} (Stock: {p.stock})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Input type="number" value={cantidad} onChange={e => setCantidad(e.target.value)} placeholder="Cantidad" />
                <Input type="number" value={costoUnitario} onChange={e => setCostoUnitario(e.target.value)} placeholder="Costo Unitario" />
              </div>

              <div className="bg-amber-50 p-4 rounded-xl flex justify-between">
                <span className="font-bold">TOTAL</span>
                <span className="font-bold text-amber-700">$ {costoTotal.toFixed(2)}</span>
              </div>
            </Card>

            <div className="space-y-6">
              <Card className="p-6">
                <Label className="mb-4 block">Comprobante</Label>
                <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*,.pdf" />
                
                {!archivoComprobante ? (
                  <div onClick={() => fileInputRef.current?.click()} className="border-2 border-dashed p-8 rounded-xl flex flex-col items-center cursor-pointer hover:bg-gray-50">
                    <UploadCloud className="text-gray-400 mb-2" />
                    <span className="text-xs text-gray-500">Subir archivo</span>
                  </div>
                ) : (
                  <div className="flex items-center justify-between bg-gray-50 p-2 rounded-lg">
                    <span className="text-xs truncate max-w-[100px]">{previewNombre}</span>
                    <X className="cursor-pointer text-red-500" size={16} onClick={() => setArchivoComprobante(null)} />
                  </div>
                )}
              </Card>

              <Button 
                type="submit" 
                disabled={loading || !isFormValid}
                className="w-full bg-amber-700 hover:bg-amber-800 text-white py-6 rounded-xl font-bold"
              >
                {loading ? <Loader2 className="animate-spin" /> : "Finalizar Registro"}
              </Button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}