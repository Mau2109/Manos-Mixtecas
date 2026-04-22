"use client"

import { Sidebar } from "@/components/layout/sidebar"
import { SidebarProvider, useSidebar } from "./sidebar-context"

function DashboardContent({ children }: { children: React.ReactNode }) {
  const { collapsed } = useSidebar()

  return (
    <main className={`flex-1 overflow-auto transition-all duration-300 ${collapsed ? "ml-20" : "ml-64"}`}>
      <div className="p-6 lg:p-8">{children}</div>
    </main>
  )
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <SidebarProvider>
      <div className="flex min-h-screen bg-background">
        <Sidebar />
        <DashboardContent>{children}</DashboardContent>
      </div>
    </SidebarProvider>
  )
}