'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { AlertCircle, CheckCircle2, ImagePlus, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { supabase } from '@/lib/supabaseClient';
import { crearEmpresa } from '@/lib/services/empresaService';
import { toast } from 'sonner';

/* ===============================
   ADM16 - Agregar Perfil de Empresa
   Criterios de Aceptación:
   1. Válida que el nombre sea obligatorio
   2. Válida RFC: 12-15 caracteres (flexible para diferentes formatos)
   3. Logo corporativo es obligatorio (JPG o PNG, máx 5MB)
   4. Campos opcionales: Dirección, Teléfono, Correo
   5. Mostrar mensaje de éxito al guardar
   6. Conectar al backend (Supabase)
   =============================== */

interface AlertType {
  tipo: 'exito' | 'error' | '';
  texto: string;
}

const validarRFC = (rfc: string): boolean => {
  // RFC mexicano: Acepta tanto persona física como moral
  // Formato: 3-4 letras + 6 dígitos + 3-4 caracteres alfanuméricos
  // Ejemplo: MMX123456ABC1 (13 caracteres) o ABC123456XYZ789 (15 caracteres)
  const rfcUpperCase = rfc.toUpperCase().trim();
  
  // Aceptar RFC de 12 a 15 caracteres
  if (rfcUpperCase.length < 12 || rfcUpperCase.length > 15) {
    return false;
  }
  
  // Patrón: letras al inicio, dígitos en medio, caracteres alfanuméricos al final
  const rfcRegex = /^[A-ZÑ&]{3,4}\d{6}[A-Z0-9]{3,}$/;
  return rfcRegex.test(rfcUpperCase);
};

export default function AgregarPerfilEmpresaPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Estados del formulario
  const [formData, setFormData] = useState({
    nombre: '',
    rfc: '',
    direccion: '',
    telefono: '',
    email: '',
  });

  // Estados para la imagen
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [logoFile, setLogoFile] = useState<File | null>(null);

  // Estados de UI
  const [alerta, setAlerta] = useState<AlertType>({ tipo: '', texto: '' });
  const [loading, setLoading] = useState(false);
  const [erroresValidacion, setErroresValidacion] = useState<Record<string, string>>({});

  // Validadores
  const validarFormulario = (): boolean => {
    const errores: Record<string, string> = {};

    // Nombre obligatorio
    if (!formData.nombre.trim()) {
      errores.nombre = 'El nombre de la empresa es obligatorio';
    }

    // RFC obligatorio y validación
    if (!formData.rfc.trim()) {
      errores.rfc = 'El RFC es obligatorio';
    } else if (!validarRFC(formData.rfc)) {
      errores.rfc = 'RFC inválido. Debe tener 12-15 caracteres (Ej: MMX123456ABC1 o ABC123456XYZ789)';
    }

    // Logo obligatorio
    if (!logoFile) {
      errores.logo = 'El logo corporativo es obligatorio';
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

  const handleSubmit = async (e: React.FormEvent) => {
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
      // Subir logo a Supabase Storage
      let logoUrl = '';
      if (logoFile) {
        logoUrl = await subirLogoAStorage(logoFile);
      }

      // Crear empresa en la base de datos
      await crearEmpresa({
        nombre: formData.nombre.trim(),
        rfc: formData.rfc.trim().toUpperCase(),
        logo_url: logoUrl,
        direccion: formData.direccion.trim() || undefined,
        telefono: formData.telefono.trim() || undefined,
        email: formData.email.trim() || undefined,
      });

      // Mostrar éxito
      toast.success('Perfil de empresa registrado exitosamente');

      // Limpiar formulario
      setFormData({
        nombre: '',
        rfc: '',
        direccion: '',
        telefono: '',
        email: '',
      });
      setLogoPreview(null);
      setLogoFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }

      // Redirigir después de 2 segundos
      setTimeout(() => {
        router.push('/admin/perfil_empresa/visualizar_empresa');
      }, 2000);
    } catch (error: any) {
      console.error('Error al crear empresa:', error);
      const mensajeError =
        error?.message || 'No se pudo guardar el perfil de la empresa';
      setAlerta({
        tipo: 'error',
        texto: mensajeError,
      });
      toast.error(mensajeError);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
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
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Agregar Perfil de Empresa
          </h1>
          <p className="text-gray-600">
            Establezca la identidad de la marca dentro del ecosistema artesanal
            de Manos Mixtecas.
          </p>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Columna Izquierda: Logo */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl p-8 border border-gray-200 shadow-sm">
              <label className="block text-xs font-bold tracking-widest text-gray-500 mb-6 uppercase">
                Logo Corporativo
              </label>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleLogoChange}
              />

              <button
                type="button"
                onClick={handleLogoClick}
                className="w-full mb-6 aspect-square rounded-2xl border-2 border-dashed border-gray-300 bg-gray-50 hover:bg-gray-100 transition-colors flex flex-col items-center justify-center gap-3 relative group overflow-hidden"
              >
                {logoPreview ? (
                  <>
                    <img
                      src={logoPreview}
                      alt="Logo preview"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <ImagePlus className="w-8 h-8 text-white mb-2" />
                      <span className="text-xs font-semibold text-white text-center px-2">
                        Cambiar Logo
                      </span>
                    </div>
                  </>
                ) : (
                  <>
                    <ImagePlus className="w-8 h-8 text-gray-400" />
                    <span className="text-sm text-gray-500 text-center">
                      Haz clic o arrastra aquí
                    </span>
                  </>
                )}
              </button>

              {erroresValidacion.logo && (
                <p className="text-xs text-red-600 mt-2">{erroresValidacion.logo}</p>
              )}

              <p className="text-xs text-gray-400 italic">
                JPG o PNG (Máx. 5MB)
              </p>
            </div>
          </div>

          {/* Columna Derecha: Campos del Formulario */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl p-8 border border-gray-200 shadow-sm space-y-6">
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
                  placeholder="Ej. Manos Mixtecas S.A."
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

              {/* RFC */}
              <div>
                <Label htmlFor="rfc" className="font-semibold text-gray-700 mb-2 block">
                  RFC <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="rfc"
                  name="rfc"
                  type="text"
                  value={formData.rfc}
                  onChange={handleInputChange}
                  placeholder="Ej. MMX123456ABC1 o ABC123456XYZ789"
                  maxLength={15}
                  className={`rounded-lg uppercase ${
                    erroresValidacion.rfc ? 'border-red-500' : ''
                  }`}
                  disabled={loading}
                />
                {erroresValidacion.rfc && (
                  <p className="text-xs text-red-600 mt-1">
                    {erroresValidacion.rfc}
                  </p>
                )}
                {!erroresValidacion.rfc && (
                  <p className="text-xs text-gray-400 mt-1">
                    RFC válido: 12-15 caracteres (Ej: MMX123456ABC1)
                  </p>
                )}
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
                  className="rounded-lg min-h-24"
                  disabled={loading}
                />
              </div>

              {/* Teléfono y Email en row */}
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
                    placeholder="+52 (000) 000 0000"
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
                    placeholder="contacto@manosmxtecas.com"
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

              {/* Botón Guardar */}
              <div className="flex justify-start pt-4">
                <Button
                  type="submit"
                  disabled={loading}
                  className="bg-amber-700 hover:bg-amber-800 text-white px-8 py-2 rounded-lg font-semibold"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Guardando...
                    </>
                  ) : (
                    'Guardar Perfil'
                  )}
                </Button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
