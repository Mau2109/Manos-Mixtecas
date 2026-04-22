"use client";
import { useRouter, usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ShoppingCart, Clock, FileText, Trophy, LayoutGrid } from "lucide-react";
import { cn } from "@/lib/utils";

export function VentasTopBar() {
  const router = useRouter();
  const pathname = usePathname();

  const navItems = [
    // { name: "Panel", href: "/admin/ventas", icon: LayoutGrid },
    { name: "Registrar", href: "/admin/ventas/registrar_venta", icon: ShoppingCart },
    { name: "Consultar", href: "/admin/ventas/consultar_ventas", icon: Clock },
    { name: "Reportes", href: "/admin/ventas/reporte_ventas", icon: FileText },
    { name: "Top Sellers", href: "/admin/ventas/top_sellers", icon: Trophy },
  ];

  return (
    <div className="w-full bg-white border-b border-neutral-100 px-8 py-3 flex items-center justify-between sticky top-0 z-10">
      <div className="flex items-center gap-2">
        {navItems.map((item) => (
          <Button
            key={item.href}
            variant="ghost"
            size="sm"
            onClick={() => router.push(item.href)}
            className={cn(
              "gap-2 font-bold text-xs uppercase tracking-widest transition-all",
              pathname === item.href 
                ? "bg-orange-50 text-orange-700 hover:bg-orange-100" 
                : "text-neutral-400 hover:text-neutral-600"
            )}
          >
            <item.icon className="w-4 h-4" />
            {item.name}
          </Button>
        ))}
      </div>
      
      <div className="text-[10px] font-black text-neutral-300 uppercase tracking-[0.3em]">
        Ecosistema Ventas
      </div>
    </div>
  );
}