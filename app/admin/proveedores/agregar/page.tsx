"use client"

import React, { useState, useRef, useEffect } from "react"
import { ArrowLeft, Camera, Archive, AlertCircle, CheckCircle2 } from "lucide-react"
import { useRouter } from "next/navigation"

// Importaciones de los componentes Radix / shadcn que usas en tu proyecto
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

// Importación del cliente de Supabase para subir la imagen al bucket
import { supabase } from "@/lib/supabaseClient"

// Importaciones de tus servicios
import { crearArtesano, obtenerArtesanos, listarCategorias } from "@/lib/services/artesanoService"

export interface Categoria {
  id_categoria: number
  nombre: string
}

export default function AgregarProveedor() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [categorias, setCategorias] = useState<Categoria[]>([])
  
  // Ref para el input de archivo oculto
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  // Estados para la imagen
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null) // Guardará el archivo físico a subir

  // Estado para las alertas del sistema
  const [alerta, setAlerta] = useState<{ tipo: "exito" | "error" | "", texto: string }>({ tipo: "", texto: "" })

  const estadoInicial = {
    nombreCompleto: "",
    biografia: "",
    tipo: "",
    comunidad: "", 
    telefono: "",
    email: "",
    estado: true,
  }

  useEffect(() => {
    const cargarCategorias = async () => {
      try {
        setLoading(true)
        const data = await listarCategorias()
        setCategorias(data || [])
      } catch (error) {
        console.error("Error al cargar categorías:", error);
      } finally {
        setLoading(false);
      }
    }

    cargarCategorias()
  }, []) 

  const [formData, setFormData] = useState(estadoInicial)

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    if (alerta.tipo) setAlerta({ tipo: "", texto: "" })
  }

  // Criterio 2: El teléfono solo acepta números y máximo 10 dígitos
  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const soloNumeros = e.target.value.replace(/\D/g, '').slice(0, 10)
    setFormData((prev) => ({ ...prev, telefono: soloNumeros }))
    if (alerta.tipo) setAlerta({ tipo: "", texto: "" })
  }

  const handleSelectChange = (value: string) => {
    setFormData((prev) => ({ ...prev, tipo: value }))
  }

  const handleToggleEstado = () => {
    setFormData((prev) => ({ ...prev, estado: !prev.estado }))
  }

  // Manejador para abrir el selector de archivos
  const handleImageClick = () => {
    fileInputRef.current?.click()
  }

  // Manejador para procesar la imagen seleccionada
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // Crear una URL temporal para la vista previa
      const previewUrl = URL.createObjectURL(file)
      setImagePreview(previewUrl)
      
      // Guardar el archivo en el estado para subirlo al bucket después
      setSelectedFile(file)
    }
  }

  // Criterio 1: Validación para habilitar el botón de Guardar
  const isFormValid = 
    formData.nombreCompleto.trim() !== "" &&
    formData.comunidad.trim() !== "" &&
    formData.email.trim() !== "" &&
    formData.telefono.length === 10

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setAlerta({ tipo: "", texto: "" })

    try {
      // Criterio 3: Verificar duplicados (Email o Teléfono)
      const proveedoresActuales = await obtenerArtesanos()
      const existeDuplicado = proveedoresActuales.some(
        (prov: any) => 
          (prov.email && prov.email.toLowerCase() === formData.email.toLowerCase()) || 
          (prov.telefono && prov.telefono === formData.telefono)
      )

      if (existeDuplicado) {
        setAlerta({ tipo: "error", texto: "Este proveedor ya se encuentra registrado." })
        setLoading(false)
        return
      }

      let foto_perfil_url = ""

      // --- LÓGICA DE SUBIDA A SUPABASE STORAGE ---
      if (selectedFile) {
        // Generamos un nombre único para evitar sobreescribir imágenes
        const fileExt = selectedFile.name.split('.').pop()
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`
        
        // Subimos el archivo al bucket "Artesano"
        const { error: uploadError } = await supabase.storage
          .from('Artesano') // Nombre exacto del bucket según tu captura
          .upload(fileName, selectedFile)

        if (uploadError) {
          console.error("Error subiendo imagen al bucket:", uploadError)
          setAlerta({ tipo: "error", texto: "No se pudo subir la imagen del artesano." })
          setLoading(false)
          return
        }

        // Si se sube bien, obtenemos la URL pública
        const { data: publicUrlData } = supabase.storage
          .from('Artesano')
          .getPublicUrl(fileName)

        foto_perfil_url = publicUrlData.publicUrl
      }

      // Preparar el payload separando nombre y apellido
      const partesNombre = formData.nombreCompleto.trim().split(" ")
      const nombre = partesNombre[0] || ""
      const apellido = partesNombre.slice(1).join(" ") || ""

      const payload = {
        nombre: nombre,
        apellido: apellido,
        biografia: formData.biografia,
        tipo: categorias.find(c => c.id_categoria.toString() === formData.tipo)?.nombre || "",
        comunidad: formData.comunidad,
        telefono: formData.telefono,
        email: formData.email,
        estado: formData.estado,
        foto_perfil: foto_perfil_url,
        id_categoria: parseInt(formData.tipo)
      }

      // Guardar en Base de Datos (esto insertará en public.artesanos)
      await crearArtesano(payload)

      // Criterio 4: Limpiar formulario, vista previa y mostrar éxito
      setFormData(estadoInicial)
      setImagePreview(null)
      setSelectedFile(null)
      if (fileInputRef.current) fileInputRef.current.value = "" 
      
      setAlerta({ tipo: "exito", texto: "Proveedor guardado correctamente." })

    } catch (error) {
      console.error("Error al registrar el artesano:", error)
      setAlerta({ tipo: "error", texto: "Ocurrió un error al intentar guardar el proveedor." })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#FDFCFB] p-6 md:p-12 font-sans text-gray-900">
      <div className="max-w-5xl mx-auto">
        
        {/* Header de Navegación */}
        <button 
          onClick={() => router.back()}
          className="flex items-center text-[10px] font-bold tracking-[0.2em] text-gray-500 mb-6 hover:text-gray-900 transition-colors uppercase"
        >
          <ArrowLeft className="w-3.5 h-3.5 mr-2" />
          Volver al panel
        </button>

        <div className="flex items-center justify-between mb-8">
          <h1 className="text-4xl font-extrabold tracking-tight text-gray-900">
            Nuevo Registro de Artesano
          </h1>
          <div className="w-4 h-4 bg-[#F2D7B6] rounded-full"></div>
        </div>

        {/* Alertas del sistema */}
        {alerta.tipo === "exito" && (
          <div className="mb-8 p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-3 text-emerald-800">
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            <p className="font-medium text-sm">{alerta.texto}</p>
          </div>
        )}

        {alerta.tipo === "error" && (
          <div className="mb-8 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3 text-red-800">
            <AlertCircle className="w-5 h-5 text-red-600" />
            <p className="font-medium text-sm">{alerta.texto}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* COLUMNA IZQUIERDA: Multimedia y Configuración */}
          <div className="lg:col-span-4 space-y-6">
            
            {/* Card Multimedia */}
            <div className="bg-[#F8F7F4] rounded-4xl p-8 flex flex-col items-center justify-center text-center border border-gray-100 shadow-sm">
              <span className="text-[10px] font-bold tracking-[0.2em] text-gray-500 mb-8 uppercase">
                Multimedia
              </span>
              
              {/* Input de archivo oculto */}
              <input 
                type="file"
                accept="image/*"
                ref={fileInputRef}
                onChange={handleImageChange}
                className="hidden"
              />

              <button 
                type="button" 
                onClick={handleImageClick}
                className="w-48 h-48 rounded-full border-2 border-dashed border-gray-300 bg-white hover:bg-gray-50 transition-colors flex flex-col items-center justify-center gap-2 relative group overflow-hidden"
              >
                {imagePreview ? (
                  <>
                    <img 
                      src={imagePreview} 
                      alt="Vista previa" 
                      className="w-full h-full object-cover"
                    />
                    {/* Overlay al hacer hover sobre la imagen ya cargada */}
                    <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <Camera className="w-8 h-8 text-white mb-2" />
                      <span className="text-xs font-semibold text-white">Cambiar Foto</span>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="absolute inset-0 bg-black/5 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <Camera className="w-8 h-8 text-gray-600 mb-2" />
                      <span className="text-xs font-semibold text-gray-700">Subir Foto</span>
                    </div>
                    <div className="w-full h-full rounded-full bg-gray-200 flex items-center justify-center text-gray-400">
                      <Camera className="w-8 h-8 opacity-50" />
                    </div>
                  </>
                )}
              </button>

              <p className="text-[11px] text-gray-400 mt-8 italic px-4 leading-relaxed">
                Utilice una imagen frontal en alta resolución con fondo neutro para mantener la estética del catálogo.
              </p>
            </div>

            {/* Card Configuración */}
            <div className="bg-[#F8F7F4] rounded-4xl p-6 flex items-center justify-between border border-gray-100 shadow-sm">
              <div className="flex flex-col">
                <span className="text-[10px] font-bold tracking-[0.2em] text-gray-500 uppercase mb-1">
                  Configuración
                </span>
                <span className="text-sm font-medium text-gray-700">
                  Visibilidad en el catálogo
                </span>
              </div>
              
              <button
                type="button"
                onClick={handleToggleEstado}
                className="flex items-center gap-3"
              >
                <div className={`w-12 h-6 rounded-full p-1 transition-colors duration-200 ease-in-out ${formData.estado ? 'bg-[#825A42]' : 'bg-gray-300'}`}>
                  <div className={`w-4 h-4 rounded-full bg-white shadow transform transition-transform duration-200 ease-in-out ${formData.estado ? 'translate-x-6' : 'translate-x-0'}`} />
                </div>
                <span className={`text-xs font-bold tracking-widest uppercase ${formData.estado ? 'text-[#825A42]' : 'text-gray-400'}`}>
                  {formData.estado ? 'Activo' : 'Inactivo'}
                </span>
              </button>
            </div>
          </div>

          {/* COLUMNA DERECHA: Formulario de Datos */}
          <div className="lg:col-span-8 space-y-12">
            
            {/* Sección 01: Información Personal */}
            <section className="space-y-6">
              <div className="flex items-center gap-4">
                <span className="bg-[#F2E8DC] text-[#A67C52] text-xs font-bold px-2.5 py-1 rounded-md">
                  01
                </span>
                <h2 className="text-xl font-bold text-gray-900">Información Personal</h2>
              </div>

              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold tracking-[0.2em] text-gray-500 uppercase flex items-center gap-1">
                    Nombre Completo <span className="text-red-500">*</span>
                  </label>
                  <Input
                    name="nombreCompleto"
                    value={formData.nombreCompleto}
                    onChange={handleInputChange}
                    placeholder="Ej. Mateo Tlacopán"
                    className="h-12 rounded-xl border-gray-200 focus-visible:ring-[#825A42]/20 focus-visible:border-[#825A42] bg-white shadow-sm"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold tracking-[0.2em] text-gray-500 uppercase">
                    Biografía del Maestro
                  </label>
                  <textarea
                    name="biografia"
                    value={formData.biografia}
                    onChange={handleInputChange}
                    placeholder="Relate la trayectoria, técnicas dominadas y el legado del artesano..."
                    className="flex min-h-30 w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm shadow-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#825A42]/20 focus:border-[#825A42] disabled:cursor-not-allowed disabled:opacity-50 resize-none transition-all"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold tracking-[0.2em] text-gray-500 uppercase">
                    Especialidad / Tipo de Artesano
                  </label>
                  <Select value={formData.tipo} onValueChange={handleSelectChange}>
                    <SelectTrigger className="w-full h-12 rounded-xl border-gray-200 bg-white focus:ring-[#825A42]/20 focus:border-[#825A42] shadow-sm text-gray-900">
                      <SelectValue placeholder="Selecciona una especialidad" />
                    </SelectTrigger>
                    <SelectContent>
                      {categorias.map((categoria) => (
                        <SelectItem key={categoria.id_categoria} value={categoria.id_categoria.toString()}>
                          {categoria.nombre}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </section>

            <hr className="border-gray-100" />

            {/* Sección 02: Origen y Contacto */}
            <section className="space-y-6">
              <div className="flex items-center gap-4">
                <span className="bg-[#F2E8DC] text-[#A67C52] text-xs font-bold px-2.5 py-1 rounded-md">
                  02
                </span>
                <h2 className="text-xl font-bold text-gray-900">Origen y Contacto</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2 space-y-2">
                  <label className="text-[10px] font-bold tracking-[0.2em] text-gray-500 uppercase flex items-center gap-1">
                    Comunidad de Origen / Dirección <span className="text-red-500">*</span>
                  </label>
                  <Input
                    name="comunidad"
                    value={formData.comunidad}
                    onChange={handleInputChange}
                    placeholder="Ej. Santa María del Río, San Luis Potosí"
                    className="h-12 rounded-xl border-gray-200 focus-visible:ring-[#825A42]/20 focus-visible:border-[#825A42] bg-white shadow-sm"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold tracking-[0.2em] text-gray-500 uppercase flex items-center gap-1">
                    Teléfono de Contacto <span className="text-red-500">*</span>
                  </label>
                  <Input
                    type="tel"
                    name="telefono"
                    value={formData.telefono}
                    onChange={handlePhoneChange}
                    placeholder="5500000000"
                    className={`h-12 rounded-xl bg-white shadow-sm focus-visible:ring-[#825A42]/20 ${formData.telefono.length > 0 && formData.telefono.length !== 10 ? 'border-red-400 focus-visible:border-red-500 focus-visible:ring-red-200' : 'border-gray-200 focus-visible:border-[#825A42]'}`}
                  />
                  {/* Criterio 2: Alerta visual del teléfono */}
                  {formData.telefono.length > 0 && formData.telefono.length !== 10 && (
                    <span className="text-xs text-red-500 flex items-center mt-1">
                      <AlertCircle className="w-3 h-3 mr-1" />
                      Debe contener exactamente 10 dígitos numéricos.
                    </span>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold tracking-[0.2em] text-gray-500 uppercase flex items-center gap-1">
                    Correo Electrónico <span className="text-red-500">*</span>
                  </label>
                  <Input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="maestro@curador.com"
                    className="h-12 rounded-xl border-gray-200 focus-visible:ring-[#825A42]/20 focus-visible:border-[#825A42] bg-white shadow-sm"
                  />
                </div>
              </div>
            </section>

            {/* Acciones */}
            <div className="flex items-center justify-between pt-6 border-t border-gray-100 mt-12">
              <div className="flex items-center gap-4">
                <Button
                  type="submit"
                  disabled={!isFormValid || loading} // Criterio 1: Deshabilitado si no cumple condiciones
                  className="bg-[#825A42] hover:bg-[#6e4b37] text-white font-medium px-8 h-12 rounded-full transition-colors shadow-sm disabled:opacity-50 disabled:bg-[#825A42]"
                >
                  {loading ? 'Guardando...' : 'Guardar Proveedor'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.back()}
                  className="bg-white border-gray-200 text-gray-700 hover:bg-gray-50 font-medium px-8 h-12 rounded-full transition-colors shadow-sm"
                >
                  Cancelar
                </Button>
              </div>
              <Archive className="w-6 h-6 text-[#E5D5C5]" />
            </div>

          </div>
        </form>
      </div>
    </div>
  )
}