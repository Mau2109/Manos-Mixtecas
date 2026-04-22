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

          // CORRECCIÓN: Si hay logo_url, lo ponemos en el preview directamente
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
    if (!formData.nombre.trim()) {
      errores.nombre = 'El nombre de la empresa es obligatorio';
    }
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
    setFormData((prev) => ({ ...prev, [name]: value }));
    setFormModificado(true);
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
      if (!file.type.startsWith('image/')) {
        setErroresValidacion((prev) => ({ ...prev, logo: 'Solo imágenes (JPG, PNG)' }));
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        setErroresValidacion((prev) => ({ ...prev, logo: 'Máximo 5MB' }));
        return;
      }

      // CORRECCIÓN: Generar preview local
      const previewUrl = URL.createObjectURL(file);
      setLogoPreview(previewUrl);
      setLogoFile(file);
      setFormModificado(true);

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
    // 1. Limpiar el nombre del archivo para evitar problemas de caracteres
    const fileExt = file.name.split('.').pop();
    const fileName = `logo-${Date.now()}.${fileExt}`;
    const filePath = `${fileName}`;

    // 2. Subir a Supabase
    const { error: uploadError } = await supabase.storage
      .from('logos') // Asegúrate de que el bucket se llame exactamente 'logos'
      .upload(filePath, file);

    if (uploadError) {
      throw new Error(`Error de subida: ${uploadError.message}`);
    }

    // 3. Obtener la URL pública
    const { data: publicUrlData } = supabase.storage
      .from('logos')
      .getPublicUrl(filePath);

    return publicUrlData.publicUrl;
  };

  const handleActualizar = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validarFormulario()) return;

    setLoading(true);
    setAlerta({ tipo: '', texto: '' });

    try {
      const datosActualizar: any = {
        nombre: formData.nombre.trim(),
        direccion: formData.direccion.trim() || undefined,
        telefono: formData.telefono.trim() || undefined,
        email: formData.email.trim() || undefined,
      };

      if (logoFile) {
        const logoUrlValida = await subirLogoAStorage(logoFile);
        datosActualizar.logo_url = logoUrlValida;
      }

      await actualizarEmpresa(formData.id_empresa, datosActualizar);

      setAlerta({ tipo: 'exito', texto: 'Datos actualizados correctamente' });
      toast.success('¡Perfil actualizado!');
      setFormModificado(false);

      // Esperar un poco para que el usuario vea el éxito antes de recargar
      setTimeout(() => {
        window.location.reload();
      }, 1500);

    } catch (error: any) {
      console.error('Error:', error);
      setAlerta({ tipo: 'error', texto: error.message || 'Error al guardar' });
    } finally {
      setLoading(false);
    }
  };

  const handleCancelar = () => {
    if (formModificado && !confirm('¿Descartar cambios?')) return;
    router.back();
  };

  if (cargandoDatos) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-amber-700" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-6 text-sm text-gray-500 uppercase tracking-widest">
          AJUSTES / PERFIL DE EMPRESA
        </div>

        {alerta.tipo === 'exito' && (
          <div className="mb-6 flex items-center gap-3 rounded-xl bg-green-50 border border-green-200 p-4 text-green-800">
            <CheckCircle2 className="h-5 w-5" />
            <p className="font-medium">{alerta.texto}</p>
          </div>
        )}

        {alerta.tipo === 'error' && (
          <div className="mb-6 flex items-center gap-3 rounded-xl bg-red-50 border border-red-200 p-4 text-red-800">
            <AlertCircle className="h-5 w-5" />
            <p className="font-medium">{alerta.texto}</p>
          </div>
        )}

        <h1 className="text-3xl font-bold text-gray-900 mb-8">Editar Perfil de Empresa</h1>

        <form onSubmit={handleActualizar} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-2xl p-8 border border-gray-200 shadow-sm space-y-6">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Información General</p>

              <div>
                <Label htmlFor="nombre">Nombre de la Empresa *</Label>
                <Input id="nombre" name="nombre" value={formData.nombre} onChange={handleInputChange} disabled={loading} />
                {erroresValidacion.nombre && <p className="text-xs text-red-500 mt-1">{erroresValidacion.nombre}</p>}
              </div>

              <div>
                <Label htmlFor="rfc">RFC (No Editable)</Label>
                <Input id="rfc" value={formData.rfc} disabled className="bg-gray-50" />
              </div>

              <div>
                <Label htmlFor="direccion">Dirección Física</Label>
                <Textarea id="direccion" name="direccion" value={formData.direccion} onChange={handleInputChange} disabled={loading} />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="telefono">Teléfono</Label>
                  <Input id="telefono" name="telefono" value={formData.telefono} onChange={handleInputChange} disabled={loading} />
                </div>
                <div>
                  <Label htmlFor="email">Correo de Contacto</Label>
                  <Input id="email" name="email" type="email" value={formData.email} onChange={handleInputChange} disabled={loading} />
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

              {/* Logo Preview - CORREGIDO */}
              <div className="mb-6 rounded-xl border border-gray-200 bg-gray-50 p-4 min-h-[160px] flex items-center justify-center">
                {/* Verificamos logoPreview. 
          Si existe y no es un string vacío, mostramos la imagen.
      */}
                {logoPreview && logoPreview.trim() !== "" ? (
                  <img
                    src={logoPreview}
                    alt="Logo preview"
                    key={logoPreview} // El key ayuda a React a refrescar la imagen si la URL cambia
                    className="w-full h-40 object-contain"
                    onError={() => {
                      console.error("Error cargando la imagen desde:", logoPreview);
                      setLogoPreview(null); // Si la URL falla, mostramos el estado vacío
                    }}
                  />
                ) : (
                  <div className="w-full h-40 flex flex-col items-center justify-center bg-gray-100 rounded-lg">
                    <ImagePlus className="w-8 h-8 text-gray-300 mb-2" />
                    <span className="text-xs text-gray-400">Sin logo disponible</span>
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
                {logoPreview ? 'Cambiar Logotipo' : 'Subir Logotipo'}
              </Button>

              {erroresValidacion.logo && (
                <p className="text-xs text-red-600 mb-4">{erroresValidacion.logo}</p>
              )}

              <p className="text-xs text-gray-400 italic text-center">
                Formatos: JPG o PNG (Máx. 5MB).
              </p>
            </div>
          </div>
        </form>

        <div className="mt-8 flex justify-center gap-4">
          <Button type="button" onClick={handleCancelar} variant="outline" className="px-8 border-amber-700 text-amber-700">
            Cancelar
          </Button>
          <Button onClick={handleActualizar} disabled={loading || !formModificado} className="bg-amber-700 hover:bg-amber-800 text-white px-8">
            {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
            Guardar Cambios
          </Button>
        </div>
      </div>
    </div>
  );
}