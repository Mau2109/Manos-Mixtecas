"use client"

import React, { useState, useEffect, useRef } from "react"
import { useParams, useRouter } from "next/navigation"
import {
    Camera,
    Archive,
    AlertCircle,
    CheckCircle2,
    Mail,
    Phone as PhoneIcon,
    MapPin,
    Trash2,
    Loader2,
    ChevronDown
} from "lucide-react"

// Componentes Radix / shadcn
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"

// Importación de Supabase para la subida de imágenes
import { supabase } from "@/lib/supabaseClient"

// Importación de servicios (Añadimos obtenerArtesanoPorId y listarCategorias)
import { 
    obtenerArtesanoPorId, 
    actualizarArtesano, 
    listarCategorias 
} from "@/lib/services/artesanoService"

export interface Categoria {
  id_categoria: number
  nombre: string
}

export default function EditarProveedor() {
    const params = useParams()
    const router = useRouter()
    const id = params?.id as string

    const [loading, setLoading] = useState(true)
    const [updating, setUpdating] = useState(false)
    const [alerta, setAlerta] = useState<{ tipo: "exito" | "error" | "", texto: string }>({ tipo: "", texto: "" })
    const [categorias, setCategorias] = useState<Categoria[]>([])

    // Referencias y estados para la nueva imagen
    const fileInputRef = useRef<HTMLInputElement>(null)
    const [imagePreview, setImagePreview] = useState<string | null>(null)
    const [selectedFile, setSelectedFile] = useState<File | null>(null)

    const [formData, setFormData] = useState({
        nombreCompleto: "",
        biografia: "",
        tipo: "", // Aquí guardaremos el ID de la categoría en formato texto para el Select
        comunidad: "",
        telefono: "",
        email: "",
        estado: true,
        foto_perfil: ""
    })

    // Cargar datos actuales y categorías al iniciar
    useEffect(() => {
        const cargarDatos = async () => {
            if (!id) return
            try {
                setLoading(true)
                
                // Cargamos tanto las categorías como la info del artesano en paralelo
                const [datosCategorias, data] = await Promise.all([
                    listarCategorias(),
                    obtenerArtesanoPorId(Number(id)) // Usamos la nueva función para que cargue inactivos
                ])
                
                if (datosCategorias) {
                    setCategorias(datosCategorias)
                }

                if (data) {
                    setFormData({
                        nombreCompleto: `${data.nombre || ""} ${data.apellido || ""}`.trim(),
                        biografia: data.biografia || data.historia || "",
                        tipo: data.id_categoria ? data.id_categoria.toString() : "", 
                        comunidad: data.comunidad || data.ubicacion || "",
                        telefono: data.telefono || "",
                        email: data.email || "",
                        estado: data.estado ?? true,
                        foto_perfil: data.foto_perfil || ""
                    })
                    setImagePreview(data.foto_perfil || null)
                }
            } catch (error) {
                console.error("Error cargando artesano:", error)
                setAlerta({ tipo: "error", texto: "No se pudo recuperar la información del artesano." })
            } finally {
                setLoading(false)
            }
        }

        cargarDatos()
    }, [id])

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target
        setFormData((prev) => ({ ...prev, [name]: value }))
        if (alerta.tipo) setAlerta({ tipo: "", texto: "" })
    }

    const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const soloNumeros = e.target.value.replace(/\D/g, '').slice(0, 10)
        setFormData((prev) => ({ ...prev, telefono: soloNumeros }))
        if (alerta.tipo) setAlerta({ tipo: "", texto: "" })
    }

    // Funciones para manejar el clic y cambio de la imagen
    const handleImageClick = () => {
        fileInputRef.current?.click()
    }

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) {
            const previewUrl = URL.createObjectURL(file)
            setImagePreview(previewUrl)
            setSelectedFile(file)
            if (alerta.tipo) setAlerta({ tipo: "", texto: "" })
        }
    }

    // Validación de campos obligatorios
    const isFormValid =
        formData.nombreCompleto.trim() !== "" &&
        formData.comunidad.trim() !== "" &&
        formData.email.trim() !== "" &&
        formData.telefono.length === 10

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!isFormValid) return

        setUpdating(true)
        setAlerta({ tipo: "", texto: "" })

        try {
            let foto_perfil_url = formData.foto_perfil

            // Si hay un archivo nuevo, lo subimos a Supabase
            if (selectedFile) {
                const fileExt = selectedFile.name.split('.').pop()
                const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`
                
                const { error: uploadError } = await supabase.storage
                    .from('Artesano')
                    .upload(fileName, selectedFile)

                if (uploadError) throw uploadError

                const { data: publicUrlData } = supabase.storage
                    .from('Artesano')
                    .getPublicUrl(fileName)

                foto_perfil_url = publicUrlData.publicUrl
            }

            // Separar nombre y apellido
            const partes = formData.nombreCompleto.trim().split(" ")
            const nombre = partes[0] || ""
            const apellido = partes.slice(1).join(" ") || ""

            // Encontrar el nombre de la categoría para el campo 'tipo' si es que lo usas en BD
            const nombreCategoria = categorias.find(c => c.id_categoria.toString() === formData.tipo)?.nombre || ""

            // Actualizar en base de datos
            await actualizarArtesano(Number(id), {
                nombre,
                apellido,
                biografia: formData.biografia,
                tipo: nombreCategoria,
                id_categoria: formData.tipo ? parseInt(formData.tipo) : undefined,
                comunidad: formData.comunidad,
                telefono: formData.telefono,
                email: formData.email,
                estado: formData.estado,
                foto_perfil: foto_perfil_url
            })

            setAlerta({ tipo: "exito", texto: "Datos del proveedor actualizados" })

            // Regresamos a la vista de detalles tras 1.5s
            setTimeout(() => {
                router.push(`/admin/proveedores/${id}`)
                router.refresh()
            }, 1500)

        } catch (error) {
            console.error("Error al actualizar:", error)
            setAlerta({ tipo: "error", texto: "Hubo un error al guardar los cambios." })
        } finally {
            setUpdating(false)
        }
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-[#FDFBF7] flex flex-col items-center justify-center">
                <Loader2 className="h-10 w-10 animate-spin text-[#825A42] mb-4" />
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest italic">Sincronizando información...</p>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-[#FDFBF7] p-6 md:p-12 font-sans text-[#1A1A1A]">
            <div className="max-w-6xl mx-auto space-y-8">

                {/* Breadcrumb / Status Bar */}
                <div className="flex items-center gap-2 text-[10px] font-bold tracking-[0.2em] text-gray-400 uppercase">
                    <button onClick={() => router.back()} className="hover:text-gray-900 transition-colors">REGISTRO</button>
                    <span>{'>'}</span>
                    <span className="text-[#A67C52]">ID: ART-{id}</span>
                </div>

                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-4">
                    <h1 className="text-5xl font-extrabold tracking-tight">
                        Editar Registro de Artesano
                    </h1>
                    <div className="w-5 h-5 bg-[#F2D7B6] rounded-full opacity-70"></div>
                </div>

                {/* Alerta */}
                {alerta.tipo === "exito" && (
                    <div className="p-5 bg-emerald-50 border border-emerald-100 rounded-4xl flex items-center gap-3 text-emerald-800 animate-in fade-in slide-in-from-top-4">
                        <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                        <p className="font-bold text-sm tracking-wide">{alerta.texto}</p>
                    </div>
                )}
                {alerta.tipo === "error" && (
                    <div className="p-5 bg-red-50 border border-red-100 rounded-4xl flex items-center gap-3 text-red-800 animate-in fade-in slide-in-from-top-4">
                        <AlertCircle className="w-5 h-5 text-red-500" />
                        <p className="font-bold text-sm tracking-wide">{alerta.texto}</p>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-10">

                    {/* COLUMNA IZQUIERDA: Multimedia y Estatus */}
                    <div className="lg:col-span-4 space-y-6">

                        <div className="bg-[#F8F7F4] rounded-[2.5rem] p-10 flex flex-col items-center border border-gray-100 shadow-sm text-center">
                            <span className="text-[10px] font-bold tracking-[0.2em] text-gray-400 mb-10 uppercase">Multimedia</span>

                            {/* Input oculto para la imagen */}
                            <input 
                                type="file"
                                accept="image/*"
                                ref={fileInputRef}
                                onChange={handleImageChange}
                                className="hidden"
                            />

                            {/* Botón interactivo de la imagen */}
                            <button 
                                type="button"
                                onClick={handleImageClick}
                                className="w-60 h-60 rounded-4xl bg-[#EAE8E4] overflow-hidden shadow-inner relative border border-gray-200/40 group hover:border-[#825A42]/50 transition-colors"
                            >
                                {imagePreview ? (
                                    <>
                                        <img src={imagePreview} alt="Perfil" className="w-full h-full object-cover" />
                                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                            <div className="bg-white/90 p-3 rounded-full shadow-sm flex flex-col items-center">
                                                <Camera className="w-5 h-5 text-[#825A42]" />
                                            </div>
                                        </div>
                                    </>
                                ) : (
                                    <div className="flex flex-col items-center justify-center h-full text-gray-400 group-hover:text-[#825A42] transition-colors">
                                        <Camera className="w-10 h-10 mb-2 opacity-50" />
                                        <span className="text-[9px] font-bold uppercase tracking-widest">Subir Imagen</span>
                                    </div>
                                )}
                            </button>

                            <div className="mt-8 space-y-4 w-full">
                                {/* Ahora la Comunidad de Origen es un Input Editable */}
                                <div className="space-y-1 text-left">
                                    <label className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Comunidad de origen <span className="text-red-500">*</span></label>
                                    <Input
                                        name="comunidad"
                                        value={formData.comunidad}
                                        onChange={handleInputChange}
                                        placeholder="Ej. Santa María del Río"
                                        className="h-11 bg-white rounded-xl px-4 border border-gray-200 focus-visible:ring-[#825A42]/20 focus-visible:border-[#825A42] shadow-sm text-sm font-medium"
                                    />
                                </div>

                                {/* Ahora la Especialidad es un Select Editable con las categorías de BD */}
                                <div className="space-y-1 text-left">
                                    <label className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Especialidad Primaria</label>
                                    <Select value={formData.tipo} onValueChange={(val) => setFormData(prev => ({...prev, tipo: val}))}>
                                        <SelectTrigger className="w-full h-11 bg-white rounded-xl px-4 border border-gray-200 focus:ring-[#825A42]/20 focus:border-[#825A42] shadow-sm text-sm font-medium">
                                            <SelectValue placeholder="Selecciona..." />
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
                        </div>

                        {/* Caja de Estatus de Certificación */}
                        <div className="bg-[#EAE8E4] rounded-[2.2rem] p-7 space-y-4 border border-gray-200/50 shadow-sm">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-[#DED9D1] rounded-lg">
                                    <Archive className="w-3.5 h-3.5 text-[#825A42]" />
                                </div>
                                <span className="text-[9px] font-bold tracking-[0.15em] text-[#825A42] uppercase">Estatus de Certificación</span>
                            </div>
                            <p className="text-[10px] text-gray-500 leading-relaxed italic">
                                Este artesano cuenta con la certificación de "Maestro del Patrimonio Vivo" otorgada por la curaduría oficial.
                            </p>
                        </div>
                    </div>

                    {/* COLUMNA DERECHA: Información General */}
                    <div className="lg:col-span-8 space-y-8 bg-[#F8F7F4] rounded-[3rem] p-6 md:p-14 border border-gray-100/50 shadow-sm">

                        <section className="space-y-8">
                            <h2 className="text-2xl font-bold tracking-tight">Información General</h2>

                            <div className="space-y-8">
                                <div className="space-y-2 group">
                                    <label className="text-[10px] font-bold tracking-[0.2em] text-gray-400 uppercase">Nombre Completo *</label>
                                    <Input
                                        name="nombreCompleto"
                                        value={formData.nombreCompleto}
                                        onChange={handleInputChange}
                                        className="h-14 rounded-xl border-0 bg-white shadow-sm text-xl font-bold px-4 focus-visible:ring-0 focus-visible:border-b-2 focus-visible:border-[#825A42] transition-all"
                                    />
                                    <div className="h-px w-full bg-gray-200 group-focus-within:bg-[#825A42] transition-colors"></div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                                    <div className="space-y-3">
                                        <label className="text-[10px] font-bold tracking-[0.2em] text-gray-400 uppercase">Teléfono de Contacto *</label>
                                        <div className="flex items-center gap-3 text-gray-600 bg-white rounded-xl px-4 shadow-sm border border-transparent focus-within:border-[#825A42] transition-all">
                                            <PhoneIcon className="w-4 h-4 text-[#825A42]" />
                                            <Input
                                                name="telefono"
                                                value={formData.telefono}
                                                onChange={handlePhoneChange}
                                                className="h-12 border-0 bg-transparent shadow-none p-0 text-base font-medium focus-visible:ring-0"
                                                placeholder="5500000000"
                                            />
                                        </div>
                                        {formData.telefono.length > 0 && formData.telefono.length !== 10 && (
                                            <span className="text-[10px] text-red-500 font-bold tracking-wider uppercase">Faltan dígitos</span>
                                        )}
                                    </div>

                                    <div className="space-y-3">
                                        <label className="text-[10px] font-bold tracking-[0.2em] text-gray-400 uppercase">Correo Electrónico *</label>
                                        <div className="flex items-center gap-3 text-gray-600 bg-white rounded-xl px-4 shadow-sm border border-transparent focus-within:border-[#825A42] transition-all">
                                            <Mail className="w-4 h-4 text-[#825A42]" />
                                            <Input
                                                name="email"
                                                value={formData.email}
                                                onChange={handleInputChange}
                                                className="h-12 border-0 bg-transparent shadow-none p-0 text-base font-medium focus-visible:ring-0"
                                                placeholder="ejemplo@curador.art"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <label className="text-[10px] font-bold tracking-[0.2em] text-gray-400 uppercase">Biografía Curatorial</label>
                                    <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100/50 focus-within:border-[#825A42] transition-all">
                                        <textarea
                                            name="biografia"
                                            value={formData.biografia}
                                            onChange={handleInputChange}
                                            className="w-full min-h-40 border-0 bg-transparent text-base focus:outline-none resize-none italic text-gray-600 leading-relaxed"
                                            placeholder="Relate la técnica y herencia del maestro..."
                                        />
                                    </div>
                                </div>
                            </div>
                        </section>

                        {/* Acciones de Footer */}
                        <div className="pt-10 flex flex-col md:flex-row items-center justify-between gap-6">
                            <button
                                type="button"
                                className="flex items-center gap-2 text-[10px] font-bold text-gray-400 hover:text-red-500 transition-colors uppercase tracking-[0.15em]"
                            >
                                <div className="p-1.5 bg-gray-200 rounded-sm">
                                    <Trash2 className="w-3 h-3" />
                                </div>
                                Eliminar Registro
                            </button>

                            <div className="flex items-center gap-4 w-full md:w-auto">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => router.back()}
                                    className="rounded-full px-12 h-14 text-[10px] font-bold tracking-[0.2em] uppercase text-gray-500 border-gray-200 hover:bg-white transition-all shadow-sm"
                                >
                                    Descartar
                                </Button>
                                <Button
                                    type="submit"
                                    disabled={!isFormValid || updating}
                                    className="w-full md:w-auto bg-[#825A42] hover:bg-[#6b4936] text-white rounded-full px-14 h-14 font-bold shadow-lg shadow-brown-200/30 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                                >
                                    {updating ? (
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                    ) : (
                                        "ACTUALIZAR ARTESANO"
                                    )}
                                </Button>
                            </div>
                        </div>

                    </div>
                </form>
            </div>
        </div>
    )
}