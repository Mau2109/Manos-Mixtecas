"use client"

import React, { useState, useEffect } from "react"
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

// Importación exclusiva del servicio como solicitaste
import { obtenerPerfilArtesano, actualizarArtesano } from "@/lib/services/artesanoService"

export default function EditarProveedor() {
    const params = useParams()
    const router = useRouter()
    const id = params?.id as string

    const [loading, setLoading] = useState(true)
    const [updating, setUpdating] = useState(false)
    const [alerta, setAlerta] = useState<{ tipo: "exito" | "error" | "", texto: string }>({ tipo: "", texto: "" })

    const [formData, setFormData] = useState({
        nombreCompleto: "",
        biografia: "",
        tipo: "",
        comunidad: "",
        telefono: "",
        email: "",
        estado: true,
        foto_perfil: ""
    })

    // Criterio 1: Cargar datos actuales al iniciar
    useEffect(() => {
        const cargarDatos = async () => {
            if (!id) return
            try {
                setLoading(true)
                const data = await obtenerPerfilArtesano(Number(id))
                if (data) {
                    setFormData({
                        nombreCompleto: `${data.nombre || ""} ${data.apellido || ""}`.trim(),
                        biografia: data.biografia || data.historia || "",
                        tipo: data.tipo || "",
                        comunidad: data.comunidad || data.ubicacion || "",
                        telefono: data.telefono || "",
                        email: data.email || "",
                        estado: data.estado ?? true,
                        foto_perfil: data.foto_perfil || ""
                    })
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

    // Criterio 2: Validación de teléfono (10 dígitos)
    const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const soloNumeros = e.target.value.replace(/\D/g, '').slice(0, 10)
        setFormData((prev) => ({ ...prev, telefono: soloNumeros }))
        if (alerta.tipo) setAlerta({ tipo: "", texto: "" })
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
            // Separar nombre y apellido para la base de datos
            const partes = formData.nombreCompleto.trim().split(" ")
            const nombre = partes[0] || ""
            const apellido = partes.slice(1).join(" ") || ""

            // Criterio 3: Actualizar sobrescribiendo en base de datos
            await actualizarArtesano(Number(id), {
                nombre,
                apellido,
                biografia: formData.biografia,
                tipo: formData.tipo,
                comunidad: formData.comunidad,
                telefono: formData.telefono,
                email: formData.email,
                estado: formData.estado,
                foto_perfil: formData.foto_perfil // Se mantiene la URL actual
            })

            // Criterio 4: Mensaje de éxito y refresco visual
            setAlerta({ tipo: "exito", texto: "Datos del proveedor actualizados" })

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

                {/* Alerta de Criterio 4 */}
                {alerta.tipo === "exito" && (
                    <div className="p-5 bg-emerald-50 border border-emerald-100 rounded-[2rem] flex items-center gap-3 text-emerald-800 animate-in fade-in slide-in-from-top-4">
                        <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                        <p className="font-bold text-sm tracking-wide">{alerta.texto}</p>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-10">

                    {/* COLUMNA IZQUIERDA: Multimedia y Estatus */}
                    <div className="lg:col-span-4 space-y-6">

                        <div className="bg-[#F8F7F4] rounded-[2.5rem] p-10 flex flex-col items-center border border-gray-100 shadow-sm text-center">
                            <span className="text-[10px] font-bold tracking-[0.2em] text-gray-400 mb-10 uppercase">Multimedia</span>

                            <div className="w-60 h-60 rounded-[2rem] bg-[#EAE8E4] overflow-hidden shadow-inner relative border border-gray-200/40">
                                {formData.foto_perfil ? (
                                    <img src={formData.foto_perfil} alt="Perfil" className="w-full h-full object-cover" />
                                ) : (
                                    <div className="flex flex-col items-center justify-center h-full text-gray-400">
                                        <Camera className="w-10 h-10 mb-2 opacity-30" />
                                        <span className="text-[9px] font-bold uppercase tracking-widest">Sin Imagen</span>
                                    </div>
                                )}
                                <div className="absolute inset-0 bg-black/5 flex items-center justify-center cursor-not-allowed">
                                    <div className="bg-white/90 p-3 rounded-full shadow-sm">
                                        <Camera className="w-5 h-5 text-[#825A42]" />
                                    </div>
                                </div>
                            </div>

                            <div className="mt-8 space-y-4 w-full">
                                <div className="space-y-1 text-left">
                                    <label className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Comunidad de origen</label>
                                    <div className="bg-white rounded-xl px-4 py-3 border border-gray-100 shadow-sm text-sm font-medium">
                                        {formData.comunidad}
                                    </div>
                                </div>

                                <div className="space-y-1 text-left">
                                    <label className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Especialidad Primaria</label>
                                    <div className="bg-white rounded-xl px-4 py-3 border border-gray-100 shadow-sm text-sm font-medium flex items-center justify-between">
                                        {formData.tipo}
                                        <ChevronDown className="w-4 h-4 text-gray-300" />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Caja de Estatus de Certificación (Estilo Captura) */}
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
                    <div className="lg:col-span-8 space-y-8 bg-[#F8F7F4] rounded-[3rem] p-1 md:p-14 border border-gray-100/50 shadow-sm">

                        <section className="space-y-8">
                            <h2 className="text-2xl font-bold tracking-tight">Información General</h2>

                            <div className="space-y-8">
                                <div className="space-y-2 group">
                                    <label className="text-[10px] font-bold tracking-[0.2em] text-gray-400 uppercase">Nombre Completo *</label>
                                    <Input
                                        name="nombreCompleto"
                                        value={formData.nombreCompleto}
                                        onChange={handleInputChange}
                                        className="h-14 rounded-xl border-0 bg-white shadow-sm text-xl font-bold px-0 focus-visible:ring-0 focus-visible:border-b-2 focus-visible:border-[#825A42] transition-all"
                                    />
                                    <div className="h-px w-full bg-gray-200 group-focus-within:bg-[#825A42] transition-colors"></div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                                    <div className="space-y-3">
                                        <label className="text-[10px] font-bold tracking-[0.2em] text-gray-400 uppercase">Teléfono de Contacto *</label>
                                        <div className="flex items-center gap-3 text-gray-600">
                                            <PhoneIcon className="w-4 h-4 text-[#825A42]" />
                                            <Input
                                                name="telefono"
                                                value={formData.telefono}
                                                onChange={handlePhoneChange}
                                                className="h-10 border-0 bg-transparent shadow-none p-0 text-base font-medium focus-visible:ring-0"
                                                placeholder="+52 000 000 0000"
                                            />
                                        </div>
                                        <div className="h-px w-full bg-gray-200"></div>
                                    </div>

                                    <div className="space-y-3">
                                        <label className="text-[10px] font-bold tracking-[0.2em] text-gray-400 uppercase">Correo Electrónico *</label>
                                        <div className="flex items-center gap-3 text-gray-600">
                                            <Mail className="w-4 h-4 text-[#825A42]" />
                                            <Input
                                                name="email"
                                                value={formData.email}
                                                onChange={handleInputChange}
                                                className="h-10 border-0 bg-transparent shadow-none p-0 text-base font-medium focus-visible:ring-0"
                                                placeholder="ejemplo@curador.art"
                                            />
                                        </div>
                                        <div className="h-px w-full bg-gray-200"></div>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <label className="text-[10px] font-bold tracking-[0.2em] text-gray-400 uppercase">Biografía Curatorial</label>
                                    <div className="bg-white rounded-[1.5rem] p-6 shadow-sm border border-gray-100/50">
                                        <textarea
                                            name="biografia"
                                            value={formData.biografia}
                                            onChange={handleInputChange}
                                            className="w-full min-h-[160px] border-0 bg-transparent text-base focus:outline-none resize-none italic text-gray-600 leading-relaxed"
                                            placeholder="Relate la técnica y herencia del maestro..."
                                        />
                                    </div>
                                </div>
                            </div>
                        </section>

                        {/* Acciones de Footer (Estilo Captura) */}
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