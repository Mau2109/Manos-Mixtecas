"use client"

import { usePathname } from "next/navigation"
import { Sidebar } from "@/components/layout/sidebar"
import { SidebarProvider, useSidebar } from "./sidebar-context"
import { AuthProvider } from "./auth-context"

// Rutas que no requieren sidebar (páginas públicas del admin)
const PUBLIC_ROUTES = ["/admin", "/admin/autenticacion/login"]

function DashboardContent({ children }: { children: React.ReactNode }) {
  const { collapsed } = useSidebar()
  const pathname = usePathname()
  
  // Si es una ruta pública, no aplicar margen del sidebar
  const isPublicRoute = PUBLIC_ROUTES.includes(pathname)

  if (isPublicRoute) {
    return <>{children}</>
  }

  return (
    <main className={`flex-1 overflow-auto transition-all duration-300 ${collapsed ? "ml-20" : "ml-64"}`}>
      <div className="p-6 lg:p-8">{children}</div>
    </main>
  )
}

function LayoutContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const isPublicRoute = PUBLIC_ROUTES.includes(pathname)

  if (isPublicRoute) {
    return <DashboardContent>{children}</DashboardContent>
  }

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <DashboardContent>{children}</DashboardContent>
    </div>
  )
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <AuthProvider>
      <SidebarProvider>
        <LayoutContent>{children}</LayoutContent>
      </SidebarProvider>
    </AuthProvider>
  )
}
