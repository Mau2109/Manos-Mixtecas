"use client";
import React, { useEffect, useState } from "react";
// import { Sidebar } from "@/components/layout/sidebar";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Toaster } from "@/components/ui/sonner";
import { Alert } from "@/components/ui/alert";
import { registrarCompra } from "@/lib/services/compraService";
import { listarArtesanos } from "@/lib/services/artesanoService";
import { consultarProductos } from "@/lib/services/productoService";

export default function RegistrarCompraPage() {
  const [artesanos, setArtesanos] = useState<any[]>([]);
  const [productos, setProductos] = useState<any[]>([]);
  const [idArtesano, setIdArtesano] = useState("");
  const [idProducto, setIdProducto] = useState("");
  const [cantidad, setCantidad] = useState("");
  const [costoUnitario, setCostoUnitario] = useState("");
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    listarArtesanos().then(setArtesanos);
    consultarProductos().then(setProductos);
  }, []);

  const selectedProducto = productos.find((p: any) => String(p.id_producto) === idProducto);
  const costoTotal = Number(cantidad) > 0 && Number(costoUnitario) > 0 ? Number(cantidad) * Number(costoUnitario) : 0;

  const isCantidadValida = Number(cantidad) > 0 && !isNaN(Number(cantidad));
  const isCostoUnitarioValido = Number(costoUnitario) > 0 && !isNaN(Number(costoUnitario));
  const isFormValid = idArtesano && idProducto && isCantidadValida && isCostoUnitarioValido;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    if (!isFormValid) return;
    setLoading(true);
    try {
      await registrarCompra({
        id_artesano: Number(idArtesano),
        detalles: [
          {
            id_producto: Number(idProducto),
            cantidad: Number(cantidad),
            costo_unitario: Number(costoUnitario),
          },
        ],
      });
      setSuccess("Compra registrada y stock actualizado correctamente");
      setIdArtesano("");
      setIdProducto("");
      setCantidad("");
      setCostoUnitario("");
    } catch (err: any) {
      setError(err?.message || "Error al registrar compra");
    } finally {
      setLoading(false);
    }
  };

	return (
		<div className="flex min-h-screen">
			{/* <Sidebar /> */}
			<main className="flex-1 bg-muted/40 flex flex-col items-center py-10">
				<Toaster />
				<div className="w-full max-w-4xl">
					<div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
						<div>
							<h1 className="text-3xl font-bold">Registrar Compra</h1>
							<span className="text-muted-foreground text-sm ml-2">REF: PRC-2023-084</span>
						</div>
						<div className="text-primary font-semibold tracking-widest text-xs">REGISTER PURCHASE</div>
					</div>
					{success && (
						<Alert variant="default" className="mb-6 bg-green-50 border-green-200 text-green-800">
							<span className="font-medium">✔ Compra registrada y stock actualizado correctamente</span>
						</Alert>
					)}
					{error && (
						<Alert variant="destructive" className="mb-6">
							{error}
						</Alert>
					)}
					<form onSubmit={handleSubmit} className="flex justify-center">
						<Card className="w-full max-w-2xl p-0">
							<CardContent className="py-8">
								<div className="grid gap-6">
									<div>
										<Label>SELECCIONAR ARTESANO</Label>
										<Select value={idArtesano} onValueChange={setIdArtesano}>
											<SelectTrigger className="w-full bg-muted/40">
												<SelectValue placeholder="Selecciona un artesano" />
											</SelectTrigger>
											<SelectContent>
												{artesanos.map((a: any) => (
													<SelectItem key={a.id_artesano} value={String(a.id_artesano)}>
														{a.nombre}{a.apellido ? ` ${a.apellido}` : ""}{a.comunidad ? ` - ${a.comunidad}` : ""}
													</SelectItem>
												))}
											</SelectContent>
										</Select>
									</div>
									<div>
										<Label>SELECCIONAR PRODUCTO</Label>
										<Select value={idProducto} onValueChange={setIdProducto}>
											<SelectTrigger className="w-full bg-muted/40">
												<SelectValue placeholder="Selecciona un producto" />
											</SelectTrigger>
											<SelectContent>
												{productos.map((p: any) => (
													<SelectItem key={p.id_producto} value={String(p.id_producto)}>
														<div className="flex items-center gap-2">
															{p.imagen && <img src={p.imagen} alt={p.nombre} className="w-8 h-8 rounded object-cover border" />}
															<span className="font-medium">{p.nombre}</span>
															<span className="text-xs text-muted-foreground ml-2">SKU: {p.id_producto}</span>
														</div>
													</SelectItem>
												))}
											</SelectContent>
										</Select>
									</div>
									<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
										<div>
											<Label>CANTIDAD</Label>
											<Input
												type="number"
												min={1}
												value={cantidad}
												onChange={e => setCantidad(e.target.value.replace(/[^0-9]/g, ""))}
												placeholder="0"
												required
												aria-invalid={!isCantidadValida}
											/>
											{!isCantidadValida && cantidad && (
												<span className="text-destructive text-xs">Debe ser un número mayor a cero</span>
											)}
										</div>
										<div>
											<Label>COSTO UNITARIO</Label>
											<Input
												type="number"
												min={0.01}
												step={0.01}
												value={costoUnitario}
												onChange={e => setCostoUnitario(e.target.value.replace(/[^0-9.]/g, ""))}
												placeholder="$ 0.00"
												required
												aria-invalid={!isCostoUnitarioValido}
											/>
											{!isCostoUnitarioValido && costoUnitario && (
												<span className="text-destructive text-xs">Debe ser un número mayor a cero</span>
											)}
										</div>
									</div>
									<div className="bg-muted/50 rounded-lg p-4 flex flex-col gap-1">
										<div className="flex items-center justify-between">
											<span className="font-semibold text-muted-foreground">COSTO TOTAL DE INVERSIÓN</span>
											<span className="text-2xl font-bold text-primary">$ {costoTotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
										</div>
										<span className="text-xs text-muted-foreground">Cálculo automático basado en unidades</span>
									</div>
								</div>
							</CardContent>
							<CardFooter>
								<Button
									type="submit"
									className="w-full bg-primary text-primary-foreground hover:bg-primary/90 text-base py-2 rounded-full mt-4"
									disabled={loading || !isFormValid}
								>
									Guardar Compra en Registro
								</Button>
							</CardFooter>
						</Card>
					</form>
				</div>
			</main>
		</div>
	);
}
