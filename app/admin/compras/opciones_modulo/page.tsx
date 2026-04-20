"use client";
import { useRouter } from "next/navigation";
// import { Sidebar } from "@/components/layout/sidebar";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { FileText, ShoppingCart, UploadCloud } from "lucide-react";
import React from "react";

export default function ComprasOpcionesModuloPage() {
	const router = useRouter();
	return (
		<div className="flex min-h-screen">
			{/* <Sidebar /> */}
			<main className="flex-1 bg-muted/40 p-8">
				<div className="max-w-6xl mx-auto">
					<div className="text-xs text-muted-foreground mb-2 tracking-widest">
						COMPRAS <span className="text-foreground font-semibold">/ SELECCIÓN DE ACCIÓN</span>
					</div>
					<h1 className="text-3xl font-bold mb-1">Módulo de Compras</h1>
					<p className="text-muted-foreground mb-8 max-w-2xl">Gestione el flujo de abastecimiento y la relación financiera con los maestros artesanos de la región mixteca.</p>

					<div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
						{/* Registrar compra */}
						<Card className="flex flex-col md:flex-row items-center gap-4 p-6 cursor-pointer hover:shadow-lg transition" onClick={() => router.push("/admin/compras/registrar_compra")}> 
							<div className="flex items-center justify-center w-16 h-16 rounded-xl bg-orange-100">
								<ShoppingCart className="w-8 h-8 text-orange-500" />
							</div>
							<div className="flex-1 min-w-0">
								<div className="font-semibold text-lg mb-1">Registrar compra</div>
								<div className="text-muted-foreground text-sm mb-2">Registra la adquisición de nuevas piezas artesanales de tus proveedores. Gestiona SKUs, cantidades y costos unitarios.</div>
								<div className="flex items-center gap-2">
									<Badge variant="secondary" className="bg-yellow-200 text-yellow-900 font-semibold">CMP-NEW-01</Badge>
									<span className="text-xs text-muted-foreground">· Ir al formulario →</span>
								</div>
							</div>
						</Card>

						{/* Registrar método de pago */}
						<Card className="flex flex-col md:flex-row items-center gap-4 p-6 cursor-pointer hover:shadow-lg transition" onClick={() => router.push("/admin/compras/registrar_metodo_pago")}> 
							<div className="flex items-center justify-center w-16 h-16 rounded-xl bg-yellow-100">
								<UploadCloud className="w-8 h-8 text-yellow-600" />
							</div>
							<div className="flex-1 min-w-0">
								<div className="font-semibold text-lg mb-1">Registrar método de pago</div>
								<div className="text-muted-foreground text-sm mb-2">Registra y adjunta el comprobante del pago realizado por una compra. Controla saldos pendientes y liquidaciones.</div>
								<div className="flex items-center gap-2">
									<Badge variant="secondary" className="bg-yellow-100 text-yellow-800 font-semibold">PAY-MTH-05</Badge>
									<span className="text-xs text-muted-foreground">· Subir comprobante <FileText className="inline w-4 h-4 ml-1 align-text-bottom" /></span>
								</div>
							</div>
						</Card>
					</div>

					{/* Resumen de actividad reciente */}
					<div className="mb-2 text-xs text-muted-foreground font-semibold tracking-widest">RESUMEN DE ACTIVIDAD RECIENTE</div>
					<Card className="flex flex-col md:flex-row items-center md:items-stretch gap-4 p-6 mb-4">
						<div className="flex-1 min-w-0">
							<div className="mb-1 text-xs text-muted-foreground font-semibold">C001-2024</div>
							<div className="font-semibold text-lg mb-2">Compra Reciente: Textiles de Teotitlán</div>
							<div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
								<div>
									<div className="text-muted-foreground">TOTAL</div>
									<div className="font-bold text-2xl text-orange-700">$42,500.00</div>
								</div>
								<div>
									<div className="text-muted-foreground">PIEZAS</div>
									<div className="font-bold">124</div>
								</div>
								<div>
									<div className="text-muted-foreground">PROVEEDOR</div>
									<div className="font-bold">Cooperativa Vida Nueva</div>
								</div>
								<div className="flex flex-col items-start justify-center">
									<div className="text-muted-foreground">ESTADO</div>
									<Badge variant="secondary" className="bg-yellow-100 text-yellow-800 font-semibold">Pendiente de Pago</Badge>
								</div>
							</div>
						</div>
						<Separator orientation="vertical" className="hidden md:block mx-6" />
						<div className="flex flex-col items-center justify-center min-w-[180px] bg-gradient-to-br from-yellow-200 to-orange-200 rounded-xl p-6">
							<UploadCloud className="w-8 h-8 text-orange-700 mb-2" />
							<div className="font-bold text-2xl text-orange-900 mb-1">15%</div>
							<div className="text-xs text-orange-900 text-center">del inventario mensual está pendiente de recepción física.</div>
							<div className="mt-2 text-[10px] text-orange-900/60">EN TRÁNSITO</div>
						</div>
					</Card>
					<div className="text-xs text-muted-foreground text-right mt-2">ACTUALIZADO: HOY 14:32</div>
				</div>
			</main>
		</div>
	);
}
