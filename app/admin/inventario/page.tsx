"use client"

import { InventarioList } from "@/components/productos/inventario-list"
import { InventarioReadonly } from "@/components/productos/inventario-readonly"
import { useAuth } from "@/app/admin/auth-context"

export default function InventarioPage() {
  const { tieneAcceso, isLoading } = useAuth()

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  // Si tiene permiso de editar, mostrar versión completa
  if (tieneAcceso("inventario_editar")) {
    return <InventarioList />
  }

  // Si solo tiene permiso de ver, mostrar versión de solo lectura
  return <InventarioReadonly />
}
