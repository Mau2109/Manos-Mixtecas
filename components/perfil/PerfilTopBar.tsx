"use client";
import { useRouter, usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Building2, UserPlus, Edit3, Eye } from "lucide-react";
import { cn } from "@/lib/utils";

export function PerfilTopBar() {
  const router = useRouter();
  const pathname = usePathname();

  const perfilYaExiste = true; 

  const navItems = [
    { 
      name: "Agregar Perfil", 
      href: "/admin/perfil_empresa/agregar_perfil_empresa", 
      icon: UserPlus,
      disabled: perfilYaExiste 
    },
    { 
      name: "Editar Perfil", 
      href: "/admin/perfil_empresa/editar_perfil", 
      icon: Edit3,
      disabled: false 
    },
    { 
      name: "Visualizar Empresa", 
      href: "/admin/perfil_empresa/visualizar_empresa", 
      icon: Eye,
      disabled: false 
    },
  ];

  // Función para determinar si un botón debe estar activo
  const isItemActive = (href: string) => {
    // Si la ruta coincide exactamente
    if (pathname === href) return true;
    
    // LOGICA POR DEFECTO: Si acabas de entrar al módulo (/admin/perfil_empresa)
    // marcamos "Visualizar" como activo por defecto
    if (pathname === "/admin/perfil_empresa" && href.includes("visualizar_empresa")) {
      return true;
    }

    return false;
  };

  return (
    <div className="w-full bg-white border-b border-neutral-100 px-8 py-3 flex items-center justify-between sticky top-0 z-10">
      <div className="flex items-center gap-2">
        {navItems.map((item) => {
          const active = isItemActive(item.href);
          
          return (
            <Button
              key={item.href}
              variant="ghost"
              size="sm"
              disabled={item.disabled}
              onClick={() => router.push(item.href)}
              className={cn(
                "gap-2 font-bold text-xs uppercase tracking-widest transition-all rounded-xl",
                active // Aquí usamos nuestra nueva lógica de validación
                  ? "bg-orange-50 text-orange-700 hover:bg-orange-100" 
                  : "text-neutral-400 hover:text-neutral-600",
                item.disabled && "opacity-50 cursor-not-allowed grayscale"
              )}
            >
              <item.icon className="w-4 h-4" />
              {item.name}
            </Button>
          );
        })}
      </div>
      
      <div className="flex items-center gap-3">
        <div className="text-[10px] font-black text-neutral-300 uppercase tracking-[0.3em]">
          Identidad Corporativa
        </div>
        <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center">
          <Building2 className="w-4 h-4 text-orange-700" />
        </div>
      </div>
    </div>
  );
}