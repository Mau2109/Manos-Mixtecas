"use client"

import { createContext, useContext, useState, useEffect, ReactNode } from "react"
import { useRouter, usePathname } from "next/navigation"

// Roles del sistema
export const ROLES = {
  ADMINISTRADOR: 1,
  VENDEDOR: 2,
} as const

export type RolId = typeof ROLES[keyof typeof ROLES]

export interface Usuario {
  id_usuario: number
  nombre: string
  email: string
  id_rol: RolId
  estado: boolean
}

interface AuthContextType {
  usuario: Usuario | null
  isLoading: boolean
  login: (usuario: Usuario) => void
  logout: () => void
  isAdmin: () => boolean
  isVendedor: () => boolean
  tieneAcceso: (modulo: string) => boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

// Módulos permitidos por rol
const PERMISOS_POR_ROL: Record<RolId, string[]> = {
  [ROLES.ADMINISTRADOR]: [
    "perfil_empresa",
    "inventario",
    "inventario_editar",
    "inventario_eliminar",
    "proveedores",
    "compras",
    "ventas",
    "usuarios",
    "reportes",
  ],
  [ROLES.VENDEDOR]: [
    "inventario", // Solo ver
    "ventas",
  ],
}

// Rutas públicas que no requieren autenticación
const RUTAS_PUBLICAS = [
  "/admin/autenticacion/login",
]

export function AuthProvider({ children }: { children: ReactNode }) {
  const [usuario, setUsuario] = useState<Usuario | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()
  const pathname = usePathname()

  // Cargar usuario de localStorage al iniciar
  useEffect(() => {
    const usuarioGuardado = localStorage.getItem("usuario_admin")
    if (usuarioGuardado) {
      try {
        const parsed = JSON.parse(usuarioGuardado)
        setUsuario(parsed)
      } catch {
        localStorage.removeItem("usuario_admin")
      }
    }
    setIsLoading(false)
  }, [])

  // Proteger rutas
  useEffect(() => {
    if (isLoading) return

    const esRutaPublica = RUTAS_PUBLICAS.some(ruta => pathname.startsWith(ruta))

    if (!usuario && !esRutaPublica && pathname.startsWith("/admin")) {
      router.push("/admin/autenticacion/login")
    }
  }, [usuario, isLoading, pathname, router])

  const login = (usuario: Usuario) => {
    setUsuario(usuario)
    localStorage.setItem("usuario_admin", JSON.stringify(usuario))
  }

  const logout = () => {
    setUsuario(null)
    localStorage.removeItem("usuario_admin")
    router.push("/admin/autenticacion/login")
  }

  const isAdmin = () => {
    return usuario?.id_rol === ROLES.ADMINISTRADOR
  }

  const isVendedor = () => {
    return usuario?.id_rol === ROLES.VENDEDOR
  }

  const tieneAcceso = (modulo: string) => {
    if (!usuario) return false
    const permisos = PERMISOS_POR_ROL[usuario.id_rol]
    return permisos?.includes(modulo) ?? false
  }

  return (
    <AuthContext.Provider value={{
      usuario,
      isLoading,
      login,
      logout,
      isAdmin,
      isVendedor,
      tieneAcceso,
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth debe usarse dentro de un AuthProvider")
  }
  return context
}
