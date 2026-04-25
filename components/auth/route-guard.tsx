"use client"

import { useAuth } from "@/app/admin/auth-context"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { ShieldX } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

interface RouteGuardProps {
  children: React.ReactNode
  permiso: string
  redirectTo?: string
}

export function RouteGuard({ children, permiso, redirectTo }: RouteGuardProps) {
  const { tieneAcceso, isLoading, usuario } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && usuario && !tieneAcceso(permiso) && redirectTo) {
      router.push(redirectTo)
    }
  }, [isLoading, usuario, permiso, redirectTo, tieneAcceso, router])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!usuario) {
    return null // El AuthProvider redirigirá al login
  }

  if (!tieneAcceso(permiso)) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Card className="max-w-md w-full">
          <CardHeader className="text-center">
            <div className="mx-auto w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mb-4">
              <ShieldX className="w-8 h-8 text-destructive" />
            </div>
            <CardTitle className="text-xl">Acceso Denegado</CardTitle>
            <CardDescription>
              No tienes permisos para acceder a esta sección del sistema.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-sm text-muted-foreground">
              Esta función está disponible solo para usuarios con rol de Administrador.
              Si crees que deberías tener acceso, contacta al administrador del sistema.
            </p>
            <Button 
              variant="outline" 
              onClick={() => router.back()}
              className="w-full"
            >
              Volver atrás
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return <>{children}</>
}
