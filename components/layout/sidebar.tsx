"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  Building2,
  Package,
  Truck,
  ShoppingCart,
  DollarSign,
  Users,
  BarChart3,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  LogOut,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useSidebar } from "@/app/admin/sidebar-context"
import { useAuth, ROLES } from "@/app/admin/auth-context"
import { Button } from "@/components/ui/button"

// Todos los items del menú con sus permisos requeridos
const menuItems = [
  { name: "Perfil de Empresa", href: "/admin/perfil_empresa/agregar_perfil_empresa", icon: Building2, permiso: "perfil_empresa" },
  { name: "Inventario", href: "/admin/inventario", icon: Package, permiso: "inventario" },
  { name: "Artesanos", href: "/admin/proveedores", icon: Truck, permiso: "proveedores" },
  { name: "Compras", href: "/admin/compras/registrar_compra", icon: ShoppingCart, permiso: "compras" },
  { name: "Ventas", href: "/admin/ventas/registrar_venta", icon: DollarSign, permiso: "ventas" },
  { name: "Usuarios", href: "/admin/usuarios", icon: Users, permiso: "usuarios" },
  { name: "Reportes", href: "/admin/reportes", icon: BarChart3, permiso: "reportes" },
]

export function Sidebar() {
  const { collapsed, setCollapsed } = useSidebar()
  const { usuario, logout, tieneAcceso, isLoading } = useAuth()
  const pathname = usePathname()

  // No mostrar sidebar en login o mientras carga
  if (pathname === "/admin/autenticacion/login") {
    return null
  }

  // Filtrar menú según permisos del usuario
  const menuFiltrado = menuItems.filter(item => tieneAcceso(item.permiso))

  // Obtener iniciales del usuario
  const getIniciales = (nombre: string) => {
    return nombre
      .split(" ")
      .map(n => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  // Obtener nombre del rol
  const getNombreRol = (idRol: number) => {
    switch (idRol) {
      case ROLES.ADMINISTRADOR:
        return "Administrador"
      case ROLES.VENDEDOR:
        return "Vendedor"
      default:
        return "Usuario"
    }
  }

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 bottom-0 flex flex-col bg-sidebar text-sidebar-foreground h-screen transition-all duration-300 z-40",
        collapsed ? "w-20" : "w-64"
      )}
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 py-6 border-b border-sidebar-border">
        <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary">
          <Sparkles className="w-5 h-5 text-primary-foreground" />
        </div>
        {!collapsed && (
          <div>
            <h1 className="font-semibold text-lg text-sidebar-foreground">Artesanías</h1>
            <p className="text-xs text-sidebar-foreground/60">Sistema de Gestión</p>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {menuFiltrado.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + "/")
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors",
                isActive
                  ? "bg-sidebar-accent text-sidebar-accent-foreground"
                  : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
              )}
            >
              <item.icon className="w-5 h-5 shrink-0" />
              {!collapsed && <span className="text-sm font-medium">{item.name}</span>}
            </Link>
          )
        })}
      </nav>

      {/* User section */}
      <div className="px-3 py-4 border-t border-sidebar-border">
        <div className="flex items-center gap-3 px-3 py-2">
          <Avatar className="w-9 h-9">
            <AvatarImage src="/placeholder-user.jpg" alt="Usuario" />
            <AvatarFallback className="bg-accent text-accent-foreground text-sm">
              {usuario ? getIniciales(usuario.nombre) : "??"}
            </AvatarFallback>
          </Avatar>
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-sidebar-foreground truncate">
                {usuario?.nombre || "Usuario"}
              </p>
              <p className="text-xs text-sidebar-foreground/60 truncate">
                {usuario ? getNombreRol(usuario.id_rol) : "Sin rol"}
              </p>
            </div>
          )}
        </div>
        
        {/* Botón de cerrar sesión */}
        <Button
          variant="ghost"
          size={collapsed ? "icon" : "default"}
          onClick={logout}
          className={cn(
            "w-full mt-2 text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent/50",
            collapsed ? "justify-center" : "justify-start"
          )}
        >
          <LogOut className="w-4 h-4" />
          {!collapsed && <span className="ml-2">Cerrar Sesión</span>}
        </Button>
      </div>

      {/* Collapse button */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="flex items-center justify-center py-3 border-t border-sidebar-border hover:bg-sidebar-accent/50 transition-colors"
      >
        {collapsed ? (
          <ChevronRight className="w-5 h-5 text-sidebar-foreground/70" />
        ) : (
          <ChevronLeft className="w-5 h-5 text-sidebar-foreground/70" />
        )}
      </button>
    </aside>
  )
}
