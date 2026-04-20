"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardHeader, CardTitle, CardContent, CardFooter, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Toaster } from "@/components/ui/sonner";
import { loginAdministrador } from "@/lib/services/loginServices";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function LoginPage() {
	const router = useRouter();
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [error, setError] = useState("");
	const [emailError, setEmailError] = useState("");
	const [loading, setLoading] = useState(false);

	const isFormValid = email.length > 0 && password.length > 0;

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setError("");
		setEmailError("");
		if (!EMAIL_REGEX.test(email)) {
			setEmailError("Formato de correo inválido");
			return;
		}
		setLoading(true);
		try {
			await loginAdministrador(email, password);
			// Aquí podrías redirigir o mostrar mensaje de éxito
			setError("");
			router.push("/admin/perfil_empresa/visualizar_empresa");
		} catch (err: any) {
			setError("Correo o contraseña incorrectos");
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className="min-h-screen flex items-center justify-center">
			<Toaster />
			<form onSubmit={handleSubmit} className="w-full max-w-md">
				{error && (
					<div className="mb-4">
						<div className="flex justify-center">
							<div className="bg-destructive text-destructive-foreground px-6 py-2 rounded-full font-medium text-sm shadow-lg animate-in fade-in slide-in-from-top-4">
								{error}
							</div>
						</div>
					</div>
				)}
				<Card className="shadow-xl">
					<CardHeader className="flex flex-col items-center gap-2">
						<div className="bg-primary/90 rounded-full p-3 mb-2">
							<svg width="32" height="32" fill="none" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" fill="#8b5a2b" /><path d="M12 13a3 3 0 1 0 0-6 3 3 0 0 0 0 6Zm0 2c-2.67 0-8 1.34-8 4v1a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-1c0-2.66-5.33-4-8-4Z" fill="#fff" /></svg>
						</div>
						<CardTitle className="text-2xl font-bold text-center">Manos Mixtecas</CardTitle>
						<CardDescription className="text-center">ACCESO ADMINISTRATIVO</CardDescription>
						<div className="flex items-center gap-2 mt-2">
							<span className="text-xs text-muted-foreground">AUTH CODE:</span>
							<Badge variant="secondary" className="tracking-widest">ADM01</Badge>
						</div>
					</CardHeader>
					<CardContent className="space-y-4">
						<div>
							<Label htmlFor="email">EMAIL</Label>
							<Input
								id="email"
								type="email"
								value={email}
								onChange={e => setEmail(e.target.value)}
								aria-invalid={!!emailError}
								className={emailError ? "border-destructive" : ""}
								placeholder="admin@manosmixtecas.com"
								autoComplete="username"
								required
							/>
							{emailError && (
								<span className="text-destructive text-xs mt-1 block">{emailError}</span>
							)}
						</div>
						<div>
							<Label htmlFor="password">PASSWORD</Label>
							<Input
								id="password"
								type="password"
								value={password}
								onChange={e => setPassword(e.target.value)}
								placeholder="********"
								autoComplete="current-password"
								required
							/>
						</div>
					</CardContent>
					<CardFooter>
						<Button
							type="submit"
							className="w-full bg-primary text-primary-foreground hover:bg-primary/90 text-base py-2 rounded-full"
							disabled={loading || !isFormValid}
						>
							{loading ? "Verificando..." : "Entrar al Panel"}
						</Button>
					</CardFooter>
				</Card>
				<div className="text-center text-xs text-muted-foreground mt-6">
					CONEXIÓN CIFRADA DE GRADO ARTESANAL
				</div>
				<div className="flex justify-center gap-2 mt-2 text-xs text-muted-foreground">
					<a href="#" className="hover:underline">PRIVACY POLICY</a>
					<span>•</span>
					<a href="#" className="hover:underline">SECURITY PROTOCOL</a>
				</div>
				<div className="text-center text-[10px] text-muted-foreground mt-2">
					© 2024 MANOS MIXTECAS. ARTISANAL INTEGRITY.
				</div>
			</form>
		</div>
	);
}
