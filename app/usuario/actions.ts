"use server";

import { guardarPerfilCliente } from "@/lib/services/clienteService";

type ActionState = {
  status: "idle" | "success" | "error";
  message: string;
};

export async function guardarPerfilUsuarioAction(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  try {
    await guardarPerfilCliente({
      nombre: String(formData.get("nombre") ?? ""),
      apellido: String(formData.get("apellido") ?? ""),
      email: String(formData.get("email") ?? ""),
      telefono: String(formData.get("telefono") ?? ""),
      direccion: String(formData.get("direccion") ?? ""),
    });

    return {
      status: "success",
      message: "Perfil guardado correctamente",
    };
  } catch (error: any) {
    const message = String(error?.message ?? "No se pudo guardar el perfil");
    const details = String(error?.details ?? "");

    if (message.toLowerCase().includes("fetch failed") || details.includes("ConnectTimeoutError")) {
      return {
        status: "error",
        message: "No se pudo conectar con Supabase. Verifica tu conexión e inténtalo nuevamente.",
      };
    }

    return {
      status: "error",
      message,
    };
  }
}
