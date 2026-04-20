// (El archivo estaba vacío)
"use client";
import React, { useRef, useState } from "react";
import { Sidebar } from "@/components/layout/sidebar";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Alert } from "@/components/ui/alert";
import { Toaster } from "@/components/ui/sonner";
import { supabase } from "@/lib/supabaseClient";
import { adjuntarComprobante } from "@/lib/services/comprobanteService";

const METODOS = [
	{ value: "Efectivo", label: "Efectivo" },
	{ value: "Transferencia Bancaria", label: "Transferencia Bancaria" },
	{ value: "Tarjeta de Débito/Crédito", label: "Tarjeta de Débito/Crédito" },
];

export default function RegistrarMetodoPagoPage() {
	const [metodo, setMetodo] = useState("");
	const [referencia, setReferencia] = useState("");
	const [file, setFile] = useState<File | null>(null);
	const [fileUrl, setFileUrl] = useState("");
	const [fileName, setFileName] = useState("");
	const [success, setSuccess] = useState("");
	const [error, setError] = useState("");
	const [loading, setLoading] = useState(false);
	const fileInputRef = useRef<HTMLInputElement>(null);

	// Simulación de total a pagar y estado
	const totalPagar = 4250;
	const estado = "PENDIENTE";

	const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const f = e.target.files?.[0];
		if (f && (f.type.startsWith("image/") || f.type === "application/pdf") && f.size <= 10 * 1024 * 1024) {
			setFile(f);
			setFileName(f.name);
		} else {
			setError("Solo se permiten imágenes o PDF hasta 10MB");
			setFile(null);
			setFileName("");
		}
	};

	const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
		e.preventDefault();
		const f = e.dataTransfer.files?.[0];
		if (f && (f.type.startsWith("image/") || f.type === "application/pdf") && f.size <= 10 * 1024 * 1024) {
			setFile(f);
			setFileName(f.name);
		} else {
			setError("Solo se permiten imágenes o PDF hasta 10MB");
			setFile(null);
			setFileName("");
		}
	};

	const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
		e.preventDefault();
	};

	const handleRemoveFile = () => {
		setFile(null);
		setFileName("");
		setFileUrl("");
	};

	const isFormValid = metodo && (metodo !== "Transferencia Bancaria" || referencia) && file;

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setError("");
		setSuccess("");
		setLoading(true);
		try {
			let uploadedUrl = "";
			if (file) {
				const ext = file.name.split(".").pop();
				const path = `comprobantes/${Date.now()}_${file.name}`;
				const { data, error: uploadError } = await supabase.storage.from("comprobantes").upload(path, file);
				if (uploadError) throw uploadError;
				uploadedUrl = data?.path || path;
				setFileUrl(uploadedUrl);
			}
			// Aquí deberías obtener el id_compra real
			await adjuntarComprobante({
				id_compra: 1, // <-- Reemplazar por el id real de la compra
				url_archivo: fileUrl || uploadedUrl,
				tipo: file?.type,
				descripcion: referencia,
			});
			setSuccess("Información de pago guardada con éxito");
			setMetodo("");
			setReferencia("");
			setFile(null);
			setFileName("");
			setFileUrl("");
		} catch (err: any) {
			setError(err?.message || "Error al guardar información de pago");
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className="flex min-h-screen">
			<Sidebar />
			<main className="flex-1 bg-muted/40 p-8 flex flex-col items-center">
				<Toaster />
				<div className="w-full max-w-3xl">
					<div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
						<div>
							<h1 className="text-3xl font-bold">Registrar Método de Pago</h1>
							<span className="text-muted-foreground text-sm ml-2">REF: #ART-2024-8892</span>
						</div>
					</div>
					{success && (
						<Alert variant="default" className="mb-6 bg-green-50 border-green-200 text-green-800">
							<span className="font-medium">✔ Información de pago guardada con éxito</span>
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
									<div className="flex items-center justify-between mb-2">
										<div>
											<span className="text-muted-foreground text-xs font-semibold">TOTAL A PAGAR</span>
											<div className="text-4xl font-bold mt-1">$ {totalPagar.toLocaleString(undefined, { minimumFractionDigits: 2 })}</div>
										</div>
										<span className="bg-yellow-100 text-yellow-800 text-xs font-semibold px-4 py-1 rounded-full">{estado}</span>
									</div>
									<div>
										<Label>MÉTODO DE PAGO</Label>
										<Select value={metodo} onValueChange={setMetodo}>
											<SelectTrigger className="w-full bg-muted/40">
												<SelectValue placeholder="Selecciona un método de pago" />
											</SelectTrigger>
											<SelectContent>
												{METODOS.map((m) => (
													<SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>
												))}
											</SelectContent>
										</Select>
									</div>
									{metodo === "Transferencia Bancaria" && (
										<div>
											<Label>NÚMERO DE REFERENCIA</Label>
											<Input
												type="text"
												value={referencia}
												onChange={e => setReferencia(e.target.value.replace(/[^0-9]/g, ""))}
												placeholder="Ej: 9283746501"
												required
											/>
										</div>
									)}
									<div>
										<Label>ADJUNTAR COMPROBANTE</Label>
										<div
											className="border-2 border-dashed border-muted-foreground/30 rounded-lg p-6 flex flex-col items-center justify-center cursor-pointer bg-muted/30 hover:bg-muted/50 transition"
											onClick={() => fileInputRef.current?.click()}
											onDrop={handleDrop}
											onDragOver={handleDragOver}
										>
											<input
												ref={fileInputRef}
												type="file"
												accept="image/*,application/pdf"
												className="hidden"
												onChange={handleFileChange}
											/>
											<svg width="40" height="40" fill="none" viewBox="0 0 24 24"><path d="M12 16V4m0 0L8 8m4-4 4 4" stroke="#8b5a2b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><rect x="4" y="16" width="16" height="4" rx="2" fill="#f5f0eb"/></svg>
											<span className="mt-2 text-sm text-muted-foreground">Haga clic o arrastre su archivo<br /><span className="text-xs">PNG, JPG o PDF up to 10MB</span></span>
										</div>
										{fileName && (
											<div className="mt-2 flex items-center gap-2 bg-muted/60 rounded px-3 py-2">
												<svg width="20" height="20" fill="none" viewBox="0 0 24 24"><rect width="20" height="20" rx="4" fill="#8b5a2b"/><path d="M7 10h6M7 14h4" stroke="#fff" strokeWidth="2" strokeLinecap="round"/></svg>
												<span className="text-xs font-medium truncate max-w-[160px]">{fileName}</span>
												<button type="button" className="ml-auto text-destructive text-xs" onClick={handleRemoveFile}>✕</button>
											</div>
										)}
									</div>
								</div>
							</CardContent>
							<CardFooter>
								<Button
									type="submit"
									className="w-full bg-primary text-primary-foreground hover:bg-primary/90 text-base py-2 rounded-full mt-4"
									disabled={loading || !isFormValid}
								>
									Guardar Información de Pago
								</Button>
							</CardFooter>
						</Card>
					</form>
					<div className="mt-8 text-xs text-muted-foreground bg-muted/30 rounded-lg p-4">
						<b>Proceso Curatorial</b><br />
						Cada transacción apoya directamente a los talleres artesanales de la región. La validación del pago garantiza la autenticidad del registro.
					</div>
				</div>
			</main>
		</div>
	);
}
