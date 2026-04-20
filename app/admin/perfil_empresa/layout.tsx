'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';

interface PerfilEmpresaLayoutProps {
  children: React.ReactNode;
}

export default function PerfilEmpresaLayout({
  children,
}: PerfilEmpresaLayoutProps) {
  const pathname = usePathname();

  const tabs = [
    {
      label: 'Agregar Perfil',
      href: '/admin/perfil_empresa/agregar_perfil_empresa',
    },
    {
      label: 'Editar Perfil',
      href: '/admin/perfil_empresa/editar_perfil',
    },
    {
      label: 'Visualizar Empresa',
      href: '/admin/perfil_empresa/visualizar_empresa',
    },
  ];

  return (
    <div className="flex flex-col gap-4">
      {/* Topbar */}
      <div className="border-b border-border bg-background p-4">
        <div className="flex gap-2">
          {tabs.map((tab) => {
            const isActive = pathname === tab.href;
            return (
              <Link key={tab.href} href={tab.href}>
                <Button
                  variant={isActive ? 'default' : 'outline'}
                  className="whitespace-nowrap"
                >
                  {tab.label}
                </Button>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1">{children}</div>
    </div>
  );
}
