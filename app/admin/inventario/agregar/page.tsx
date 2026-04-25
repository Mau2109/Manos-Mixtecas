"use client"

import { AgregarProductoForm } from "@/components/productos/agregar-producto-form"
import { RouteGuard } from "@/components/auth/route-guard"

export default function AgregarProductoPage() {
  return (
    <RouteGuard permiso="inventario_editar">
      <AgregarProductoForm />
    </RouteGuard>
  )
}
