"use client";
import { useRouter, usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ShoppingBag, CreditCard, LayoutGrid, Package } from "lucide-react";
import { cn } from "@/lib/utils";

export function ComprasTopBar() {
  const router = useRouter();
  const pathname = usePathname();

  const navItems = [
    // { name: "Panel", href: "/admin/compras/opciones_modulo", icon: LayoutGrid },
    { name: "Nueva Compra", href: "/admin/compras/registrar_compra", icon: ShoppingBag },
    { name: "Métodos de Pago", href: "/admin/compras/registrar_metodo_pago", icon: CreditCard },
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
              "gap-2 font-bold text-xs uppercase tracking-widest transition-all rounded-xl",
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
      
      <div className="flex items-center gap-3">
        <div className="text-[10px] font-black text-neutral-300 uppercase tracking-[0.3em]">
          Módulo Compras
        </div>
        <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center">
          <Package className="w-4 h-4 text-orange-700" />
        </div>
      </div>
    </div>
  );
}