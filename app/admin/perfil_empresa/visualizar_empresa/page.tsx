'use client';

import { useState, useEffect } from 'react';
import { AlertCircle, Loader2, Eye, Edit } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { obtenerEmpresa } from '@/lib/services/empresaService';
import { toast } from 'sonner';
import Link from 'next/link';

/* ===============================
   ADM18 - Visualizar Perfil de Empresa
   =============================== */

interface Empresa {
  id_empresa: number;
  nombre: string;
  rfc: string;
  logo_url?: string;
  direccion?: string;
  telefono?: string;
  email?: string;
}

export default function VisualizarEmpresaPage() {
  const [empresa, setEmpresa] = useState<Empresa | null>(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const cargarEmpresa = async () => {
      try {
        setCargando(true);
        const datos = await obtenerEmpresa();
        if (datos) {
          setEmpresa(datos);
        } else {
          setError('No se encontraron datos de la empresa');
        }
      } catch (err: any) {
        console.error('Error al cargar empresa:', err);
        setError('No se pudieron cargar los datos de la empresa');
        toast.error('Error al cargar los datos');
      } finally {
        setCargando(false);
      }
    };

    cargarEmpresa();
  }, []);

  if (cargando) {
    return (
      <div className="min-h-screen bg-gray-50 p-6 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-amber-700" />
          <p className="text-gray-600">Cargando datos de la empresa...</p>
        </div>
      </div>
    );
  }

  if (error || !empresa) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-3 rounded-lg bg-red-50 px-6 py-4 border border-red-200 mb-6">
            <AlertCircle className="h-5 w-5 flex-shrink-0 text-red-600" />
            <p className="text-sm font-medium text-red-700">
              {error || 'No se encontraron datos de la empresa'}
            </p>
          </div>
          <Link href="/admin/perfil_empresa/agregar_perfil_empresa">
            <Button className="bg-amber-700 hover:bg-amber-800 text-white">
              Agregar Perfil de Empresa
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Breadcrumb */}
        <div className="mb-6 text-sm text-gray-500">
          <span>AJUSTES / PERFIL DE EMPRESA / VISUALIZAR</span>
        </div>

        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Perfil de Empresa</h1>
            <p className="text-gray-600 mt-2">Información registrada del sistema</p>
          </div>
          <Link href="/admin/perfil_empresa/editar_perfil">
            <Button className="bg-amber-700 hover:bg-amber-800 text-white flex items-center gap-2">
              <Edit className="w-4 h-4" />
              Editar Perfil
            </Button>
          </Link>
        </div>

        {/* Contenido de la Empresa */}
        <div className="bg-white rounded-2xl p-8 border border-gray-200 shadow-sm space-y-8">
          {/* Sección: Información General */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Logo */}
            {empresa.logo_url && (
              <div className="md:col-span-1">
                <label className="block text-xs font-bold tracking-widest text-gray-500 mb-4 uppercase">
                  Logotipo Institucional
                </label>
                <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
                  <img
                    src={empresa.logo_url}
                    alt="Logo de empresa"
                    className="w-full h-40 object-contain"
                  />
                </div>
              </div>
            )}

            {/* Información General */}
            <div className={empresa.logo_url ? 'md:col-span-2' : 'md:col-span-3'}>
              <label className="block text-xs font-bold tracking-widest text-gray-500 mb-6 uppercase">
                Información General
              </label>
              <div className="space-y-4">
                <div>
                  <span className="text-xs font-semibold text-gray-500 uppercase">
                    Nombre de la Empresa
                  </span>
                  <p className="text-lg font-semibold text-gray-900 mt-1">
                    {empresa.nombre}
                  </p>
                </div>

                <div>
                  <span className="text-xs font-semibold text-gray-500 uppercase">
                    RFC
                  </span>
                  <p className="text-lg font-semibold text-gray-900 mt-1">
                    {empresa.rfc}
                  </p>
                </div>

                {empresa.direccion && (
                  <div>
                    <span className="text-xs font-semibold text-gray-500 uppercase">
                      Dirección Física
                    </span>
                    <p className="text-gray-700 mt-1">{empresa.direccion}</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sección: Datos de Contacto */}
          <div className="border-t border-gray-200 pt-8">
            <label className="block text-xs font-bold tracking-widest text-gray-500 mb-6 uppercase">
              Datos de Contacto
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {empresa.telefono && (
                <div>
                  <span className="text-xs font-semibold text-gray-500 uppercase">
                    Teléfono
                  </span>
                  <p className="text-gray-900 mt-1">{empresa.telefono}</p>
                </div>
              )}

              {empresa.email && (
                <div>
                  <span className="text-xs font-semibold text-gray-500 uppercase">
                    Correo de Contacto
                  </span>
                  <p className="text-gray-900 mt-1">{empresa.email}</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Botones de Acción */}
        <div className="mt-8 flex justify-center gap-4">
          <Link href="/admin/perfil_empresa/editar_perfil">
            <Button className="bg-amber-700 hover:bg-amber-800 text-white px-8 py-2 rounded-lg font-semibold flex items-center gap-2">
              <Edit className="w-4 h-4" />
              Editar Perfil
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
