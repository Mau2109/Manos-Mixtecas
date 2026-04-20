'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { AlertCircle, CheckCircle2, ImagePlus, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { supabase } from '@/lib/supabaseClient';
import { obtenerEmpresa, actualizarEmpresa } from '@/lib/services/empresaService';
import { toast } from 'sonner';

/* ===============================
   ADM17 - Editar Perfil de Empresa
   Criterios de Aceptación:
   1. Campos precargados con información actual
   2. RFC no editable (protegido por seguridad)
   3. Permitir reemplazar logotipo
   4. Validar campos obligatorios al actualizar
   5. Mostrar mensaje de confirmación
   =============================== */

interface AlertType {
  tipo: 'exito' | 'error' | '';
  texto: string;
}

interface Empresa {
  id_empresa: number;
  nombre: string;
  rfc: string;
  logo_url?: string;
  direccion?: string;
  telefono?: string;
  email?: string;
}

export default function EditarPerfilPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Estados del formulario
  const [formData, setFormData] = useState<Empresa>({
    id_empresa: 0,
    nombre: '',
    rfc: '',
    direccion: '',
    telefono: '',
    email: '',
    logo_url: '',
  });

  // Estados para la imagen
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [logoFile, setLogoFile] = useState<File | null>(null);

  // Estados de UI
  const [alerta, setAlerta] = useState<AlertType>({ tipo: '', texto: '' });
  const [loading, setLoading] = useState(false);
  const [cargandoDatos, setCargandoDatos] = useState(true);
  const [erroresValidacion, setErroresValidacion] = useState<Record<string, string>>({});
  const [formModificado, setFormModificado] = useState(false);

  // Cargar datos de la empresa al montar el componente
  useEffect(() => {
    const cargarEmpresa = async () => {
      try {
        setCargandoDatos(true);
        const empresa = await obtenerEmpresa();
        if (empresa) {
          setFormData({
            id_empresa: empresa.id_empresa,
            nombre: empresa.nombre || '',
            rfc: empresa.rfc || '',
            direccion: empresa.direccion || '',
            telefono: empresa.telefono || '',
            email: empresa.email || '',
            logo_url: empresa.logo_url || '',
          });
          // Cargar preview del logo
          if (empresa.logo_url) {
            setLogoPreview(empresa.logo_url);
          }
        }
      } catch (error: any) {
        console.error('Error al cargar empresa:', error);
        setAlerta({
          tipo: 'error',
          texto: 'No se pudo cargar los datos de la empresa',
        });
        toast.error('Error al cargar los datos');
      } finally {
        setCargandoDatos(false);
      }
    };

    cargarEmpresa();
  }, []);

  const validarFormulario = (): boolean => {
    const errores: Record<string, string> = {};

    // Nombre obligatorio
    if (!formData.nombre.trim()) {
      errores.nombre = 'El nombre de la empresa es obligatorio';
    }

    // Email (validación básica si se proporciona)
    if (formData.email && !formData.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      errores.email = 'El correo no es válido';
    }

    setErroresValidacion(errores);
    return Object.keys(errores).length === 0;
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    setFormModificado(true);

    // Limpiar error del campo al escribir
    if (erroresValidacion[name]) {
      setErroresValidacion((prev) => {
        const nuevo = { ...prev };
        delete nuevo[name];
        return nuevo;
      });
    }
  };

  const handleLogoClick = () => {
    fileInputRef.current?.click();
  };

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validar tipo de archivo
      if (!file.type.startsWith('image/')) {
        setErroresValidacion((prev) => ({
          ...prev,
          logo: 'Solo se permiten imágenes (JPG, PNG)',
        }));
        return;
      }

      // Validar tamaño (máx 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setErroresValidacion((prev) => ({
          ...prev,
          logo: 'El archivo no debe superar 5MB',
        }));
        return;
      }

      // Crear preview
      const previewUrl = URL.createObjectURL(file);
      setLogoPreview(previewUrl);
      setLogoFile(file);
      setFormModificado(true);

      // Limpiar error del logo
      if (erroresValidacion.logo) {
        setErroresValidacion((prev) => {
          const nuevo = { ...prev };
          delete nuevo.logo;
          return nuevo;
        });
      }
    }
  };

  const subirLogoAStorage = async (file: File): Promise<string> => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from('logos')
      .upload(fileName, file);

    if (uploadError) {
      throw new Error('No se pudo subir el logo al servidor. Verifica que el bucket "logos" exista en Supabase Storage.');
    }

    const { data: publicUrlData } = supabase.storage
      .from('logos')
      .getPublicUrl(fileName);

    return publicUrlData.publicUrl;
  };

  const handleActualizar = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validar antes de enviar
    if (!validarFormulario()) {
      setAlerta({
        tipo: 'error',
        texto: 'Por favor corrija los errores en el formulario',
      });
      return;
    }

    setLoading(true);
    setAlerta({ tipo: '', texto: '' });

    try {
      // Preparar datos a actualizar
      const datosActualizar: any = {
        nombre: formData.nombre.trim(),
        direccion: formData.direccion.trim() || undefined,
        telefono: formData.telefono.trim() || undefined,
        email: formData.email.trim() || undefined,
      };

      // Si hay nuevo logo, subirlo
      if (logoFile) {
        const logoUrl = await subirLogoAStorage(logoFile);
        datosActualizar.logo_url = logoUrl;
      }

      // Actualizar en la base de datos
      await actualizarEmpresa(formData.id_empresa, datosActualizar);

      // Mostrar éxito
      setAlerta({
        tipo: 'exito',
        texto: 'Datos actualizados correctamente',
      });
      toast.success('Datos actualizados correctamente');
      setFormModificado(false);

      // Recargar datos después de 2 segundos
      setTimeout(() => {
        window.location.reload();
      }, 2000);
    } catch (error: any) {
      console.error('Error al actualizar empresa:', error);
      const mensajeError =
        error?.message || 'No se pudo actualizar el perfil de la empresa';
      setAlerta({
        tipo: 'error',
        texto: mensajeError,
      });
      toast.error(mensajeError);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelar = () => {
    if (formModificado) {
      const confirmacion = confirm(
        '¿Descartar cambios? Los datos modificados no se guardarán.'
      );
      if (confirmacion) {
        router.back();
      }
    } else {
      router.back();
    }
  };

  if (cargandoDatos) {
    return (
      <div className="min-h-screen bg-gray-50 p-6 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-amber-700" />
          <p className="text-gray-600">Cargando datos de la empresa...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Breadcrumb */}
        <div className="mb-6 text-sm text-gray-500">
          <span>AJUSTES / PERFIL DE EMPRESA</span>
        </div>

        {/* Alert de éxito */}
        {alerta.tipo === 'exito' && (
          <div className="mb-6 flex items-center gap-3 rounded-full bg-amber-100 px-6 py-3 text-amber-800">
            <CheckCircle2 className="h-5 w-5 flex-shrink-0" />
            <p className="text-sm font-medium">{alerta.texto}</p>
          </div>
        )}

        {/* Alert de error */}
        {alerta.tipo === 'error' && (
          <div className="mb-6 flex items-center gap-3 rounded-lg bg-red-50 px-6 py-3 border border-red-200">
            <AlertCircle className="h-5 w-5 flex-shrink-0 text-red-600" />
            <p className="text-sm font-medium text-red-700">{alerta.texto}</p>
          </div>
        )}

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Editar Perfil de Empresa
          </h1>
        </div>

        {/* Formulario */}
        <form onSubmit={handleActualizar} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Columna Izquierda: Información General */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl p-8 border border-gray-200 shadow-sm space-y-6">
              <div>
                <label className="block text-xs font-bold tracking-widest text-gray-500 mb-6 uppercase">
                  Información General
                </label>
              </div>

              {/* Nombre de la Empresa */}
              <div>
                <Label htmlFor="nombre" className="font-semibold text-gray-700 mb-2 block">
                  Nombre de la Empresa <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="nombre"
                  name="nombre"
                  type="text"
                  value={formData.nombre}
                  onChange={handleInputChange}
                  className={`rounded-lg ${
                    erroresValidacion.nombre ? 'border-red-500' : ''
                  }`}
                  disabled={loading}
                />
                {erroresValidacion.nombre && (
                  <p className="text-xs text-red-600 mt-1">
                    {erroresValidacion.nombre}
                  </p>
                )}
              </div>

              {/* RFC (No Editable) */}
              <div>
                <Label htmlFor="rfc" className="font-semibold text-gray-700 mb-2 block">
                  RFC (No Editable)
                </Label>
                <Input
                  id="rfc"
                  name="rfc"
                  type="text"
                  value={formData.rfc}
                  disabled={true}
                  className="bg-gray-100 cursor-not-allowed"
                />
                <p className="text-xs text-gray-400 mt-1">
                  Este campo no puede ser modificado por razones de seguridad contable
                </p>
              </div>

              {/* Dirección Física */}
              <div>
                <Label htmlFor="direccion" className="font-semibold text-gray-700 mb-2 block">
                  Dirección Física
                </Label>
                <Textarea
                  id="direccion"
                  name="direccion"
                  value={formData.direccion}
                  onChange={handleInputChange}
                  placeholder="Calle, Número, Colonia, CP, Estado"
                  className="rounded-lg min-h-20"
                  disabled={loading}
                />
              </div>

              {/* Teléfono y Email */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="telefono" className="font-semibold text-gray-700 mb-2 block">
                    Teléfono
                  </Label>
                  <Input
                    id="telefono"
                    name="telefono"
                    type="tel"
                    value={formData.telefono}
                    onChange={handleInputChange}
                    className="rounded-lg"
                    disabled={loading}
                  />
                </div>

                <div>
                  <Label htmlFor="email" className="font-semibold text-gray-700 mb-2 block">
                    Correo de Contacto
                  </Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className={`rounded-lg ${
                      erroresValidacion.email ? 'border-red-500' : ''
                    }`}
                    disabled={loading}
                  />
                  {erroresValidacion.email && (
                    <p className="text-xs text-red-600 mt-1">
                      {erroresValidacion.email}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Columna Derecha: Logo */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl p-8 border border-gray-200 shadow-sm">
              <label className="block text-xs font-bold tracking-widest text-gray-500 mb-6 uppercase">
                Logotipo Institucional
              </label>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleLogoChange}
              />

              {/* Logo Preview */}
              <div className="mb-6 rounded-xl border border-gray-200 bg-gray-50 p-4">
                {logoPreview ? (
                  <img
                    src={logoPreview}
                    alt="Logo preview"
                    className="w-full h-40 object-contain"
                  />
                ) : (
                  <div className="w-full h-40 flex items-center justify-center bg-gray-100 rounded-lg">
                    <span className="text-xs text-gray-400">Sin logo</span>
                  </div>
                )}
              </div>

              {/* Botón Actualizar Logo */}
              <Button
                type="button"
                onClick={handleLogoClick}
                variant="outline"
                className="w-full mb-4 border-amber-700 text-amber-700 hover:bg-amber-50"
                disabled={loading}
              >
                <ImagePlus className="w-4 h-4 mr-2" />
                Actualizar Logotipo
              </Button>

              {erroresValidacion.logo && (
                <p className="text-xs text-red-600 mb-4">{erroresValidacion.logo}</p>
              )}

              <p className="text-xs text-gray-400 italic">
                Formatos: JPG o PNG (Máx. 5MB). Utilice una imagen cuadrada para mejor visualización.
              </p>

              {/* Info adicional */}
              <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
                <p className="text-xs text-gray-600 mb-2">
                  <span className="font-semibold">⚠️ Permisos necesarios:</span> Solo administradores
                </p>
                <p className="text-xs text-gray-500">
                  Última actualización: 24 OCT 2023
                </p>
              </div>
            </div>
          </div>
        </form>

        {/* Botones de Acción */}
        <div className="mt-8 flex justify-center gap-4">
          <Button
            type="button"
            onClick={handleCancelar}
            variant="outline"
            className="px-8 py-2 border-amber-700 text-amber-700 hover:bg-amber-50"
            disabled={loading}
          >
            Cancelar Cambios
          </Button>
          <Button
            onClick={handleActualizar}
            disabled={loading || !formModificado}
            className="bg-amber-700 hover:bg-amber-800 text-white px-8 py-2 rounded-lg font-semibold"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Actualizando...
              </>
            ) : (
              'Actualizar Datos'
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}

