"use client"

import React, { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { obtenerArtesanoPorId, eliminarArtesano } from "@/lib/services/artesanoService"
import {
  ArrowLeft,
  MapPin,
  Phone,
  Mail,
  User,
  Quote,
  Pencil,
  Trash2,
  CheckCircle2,
  XCircle
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import Link from "next/link"

export default function DetalleArtesano() {
  const params = useParams()
  const router = useRouter()
  const id = params.id as string

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [artesano, setArtesano] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [isDeleting, setIsDeleting] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [alerta, setAlerta] = useState<{ tipo: "exito" | "error" | "", texto: string }>({ tipo: "", texto: "" })

  useEffect(() => {
    const cargarArtesano = async () => {
      try {
        setLoading(true)
        const data = await obtenerArtesanoPorId(Number(id))
        setArtesano(data)
      } catch (error) {
        console.error("Error al cargar el detalle del artesano:", error)
      } finally {
        setLoading(false)
      }
    }

    if (id) {
      cargarArtesano()
    }
  }, [id])

  const handleEliminarConfirmado = async () => {
    try {
      setIsDeleting(true)
      await eliminarArtesano(Number(id))
      setShowDeleteModal(false) // Cerramos el modal
      setAlerta({ tipo: "exito", texto: "Proveedor eliminado exitosamente" })

      // Esperamos 1.5 segundos para que veas el mensaje antes de volver a la lista
      setTimeout(() => {
        router.push('/admin/proveedores')
      }, 1500)
    } catch (error) {
      console.error("Error al eliminar:", error)
      setShowDeleteModal(false)
      setAlerta({ tipo: "error", texto: "Hubo un error al intentar eliminar al artesano." })
    } finally {
      setIsDeleting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FDFBF7] p-8 flex items-center justify-center">
        <div className="animate-pulse flex flex-col items-center">
          <div className="w-12 h-12 border-4 border-[#825A42] border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-gray-500 font-medium tracking-widest text-sm uppercase">Cargando maestro...</p>
        </div>
      </div>
    )
  }

  if (!artesano) {
    return (
      <div className="min-h-screen bg-[#FDFBF7] p-8 flex flex-col items-center justify-center text-center">
        <User className="w-16 h-16 text-gray-300 mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Artesano no encontrado</h2>
        <p className="text-gray-500 mb-6">No pudimos localizar la información de este proveedor.</p>
        <Button onClick={() => router.back()} className="bg-[#825A42] hover:bg-[#6b4936] text-white rounded-full px-8">
          Volver a la lista
        </Button>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#FDFBF7] p-6 md:p-12 font-sans text-gray-900">
      <div className="max-w-6xl mx-auto space-y-10">

        {/* Navegación Superior */}
        <button
          onClick={() => router.back()}
          className="flex items-center text-[10px] font-bold tracking-[0.2em] text-gray-500 hover:text-gray-900 transition-colors uppercase"
        >
          <ArrowLeft className="w-3.5 h-3.5 mr-2" />
          Volver a la lista
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">

          {/* COLUMNA IZQUIERDA: Foto y Nombre (5 columnas) */}
          <div className="lg:col-span-5 flex flex-col">

            {/* Contenedor de Imagen con Overlay de Estado */}
            <div className="relative w-full aspect-4/5 rounded-[2.5rem] overflow-hidden bg-gray-200 shadow-sm border border-gray-100/50">
              {artesano.foto_perfil ? (
                <img
                  src={artesano.foto_perfil}
                  alt={artesano.nombre}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center bg-[#F2E8DC] text-[#825A42]">
                  <User className="w-20 h-20 mb-4 opacity-50" />
                  <span className="text-6xl font-bold opacity-20">{artesano.nombre.charAt(0)}</span>
                </div>
              )}

              {/* Badge de Estado sobre la imagen */}
              <div className="absolute top-6 right-6 bg-white/95 backdrop-blur-sm rounded-full px-4 py-1.5 flex items-center gap-2 shadow-sm">
                <div className={`w-2 h-2 rounded-full ${artesano.estado ? 'bg-emerald-500' : 'bg-red-500'}`}></div>
                <span className="text-[10px] font-bold tracking-widest text-gray-700 uppercase">
                  Estado: {artesano.estado ? 'Activo' : 'Inactivo'}
                </span>
              </div>
            </div>

            {/* Título e Info Básica */}
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-gray-900 mt-8 mb-4">
              {artesano.nombre} {artesano.apellido}
            </h1>

            {/* Alertas del sistema */}
            {alerta.tipo === "exito" && (
              <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-3 text-emerald-800">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                <p className="font-medium text-sm">{alerta.texto}</p>
              </div>
            )}

            {alerta.tipo === "error" && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3 text-red-800">
                <XCircle className="w-5 h-5 text-red-600" />
                <p className="font-medium text-sm">{alerta.texto}</p>
              </div>
            )}

            <div className="flex flex-wrap items-center gap-4">
              <Badge variant="outline" className="bg-[#F2E8DC] text-[#A67C52] border-0 rounded-full px-4 py-1.5 text-xs font-bold tracking-wider uppercase">
                {artesano.tipo || artesano.categorias?.nombre || "Maestro Artesano"}
              </Badge>
              <div className="flex items-center text-sm font-medium text-gray-600">
                <MapPin className="w-4 h-4 mr-1.5 text-gray-400" />
                {artesano.comunidad || artesano.ubicacion || "Ubicación no registrada"}
              </div>
            </div>
          </div>

          {/* COLUMNA DERECHA: Biografía y Contacto (7 columnas) */}
          <div className="lg:col-span-7 flex flex-col justify-between h-full space-y-8">

            <div className="space-y-6">
              {/* Tarjeta de Biografía */}
              <Card className="border-0 shadow-sm rounded-4xl bg-[#F8F7F4] relative overflow-hidden">
                {/* Ícono de Comillas de fondo */}
                <Quote className="absolute top-8 right-8 w-24 h-24 text-gray-200/50 rotate-180 -scale-x-100" />

                <CardContent className="p-8 md:p-10 relative z-10">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="h-px w-8 bg-[#D4C5B9]"></div>
                    <span className="text-[10px] font-bold tracking-[0.2em] text-[#A67C52] uppercase">
                      Biografía
                    </span>
                  </div>

                  <div className="prose prose-gray max-w-none">
                    <p className="text-gray-700 text-lg md:text-xl leading-relaxed italic mb-6">
                      "{artesano.historia || artesano.biografia || "El maestro artesano aún no ha compartido su historia, pero cada una de sus piezas habla del legado y la tradición de su comunidad."}"
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Tarjetas de Contacto Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">

                {/* Tarjeta Teléfono */}
                <Card className="border-0 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] rounded-4xl bg-white">
                  <CardContent className="p-6 md:p-8 flex flex-col justify-center min-h-35">
                    <div className="w-10 h-10 rounded-full bg-[#F2E8DC] flex items-center justify-center mb-4">
                      <Phone className="w-4 h-4 text-[#825A42]" />
                    </div>
                    <span className="text-[10px] font-bold tracking-[0.2em] text-gray-400 uppercase mb-2">
                      Teléfono
                    </span>
                    <span className="text-lg font-mono tracking-tight text-gray-900">
                      {artesano.telefono ? (
                        artesano.telefono.length === 10
                          ? `+52 ${artesano.telefono.slice(0, 3)} ${artesano.telefono.slice(3, 6)} ${artesano.telefono.slice(6)}`
                          : artesano.telefono
                      ) : (
                        "No registrado"
                      )}
                    </span>
                  </CardContent>
                </Card>

                {/* Tarjeta Correo */}
                <Card className="border-0 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] rounded-4xl bg-white">
                  <CardContent className="p-6 md:p-8 flex flex-col justify-center min-h-35">
                    <div className="w-10 h-10 rounded-full bg-[#F2E8DC] flex items-center justify-center mb-4">
                      <Mail className="w-4 h-4 text-[#825A42]" />
                    </div>
                    <span className="text-[10px] font-bold tracking-[0.2em] text-gray-400 uppercase mb-2">
                      Correo Electrónico
                    </span>
                    <span className="text-base font-mono tracking-tight text-gray-900 truncate" title={artesano.email}>
                      {artesano.email || "No registrado"}
                    </span>
                  </CardContent>
                </Card>

              </div>
            </div>

            {/* Fila de Botones de Acción */}
            <div className="flex flex-col sm:flex-row items-center gap-4 pt-4">
              <Button
                onClick={() => setShowDeleteModal(true)}
                disabled={isDeleting || alerta.tipo === "exito"}
                className="w-full sm:w-auto bg-red-600 hover:bg-red-700 text-white rounded-full px-8 h-14 text-sm font-semibold transition-colors shadow-sm disabled:opacity-50"
              >
                {isDeleting ? 'Eliminando...' : 'Eliminar Artesano'}
                <Trash2 className="w-4 h-4 ml-2" />
              </Button>

              <Link href={`/admin/proveedores/${id}/editar`} className="w-full sm:w-auto">
                <Button variant="outline" className="w-full sm:w-auto bg-transparent border border-gray-200 text-gray-600 hover:bg-white hover:text-gray-900 rounded-full px-8 h-14 text-xs font-bold tracking-widest uppercase transition-colors shadow-sm">
                  <Pencil className="w-3.5 h-3.5 mr-2" />
                  Editar Perfil
                </Button>
              </Link>
            </div>

          </div>
        </div>
      </div>

      {/* Modal de Confirmación de Eliminación con su propio estilo */}
      <AlertDialog open={showDeleteModal} onOpenChange={setShowDeleteModal}>
        <AlertDialogContent className="rounded-4xl border-0 shadow-xl bg-white p-6 md:p-8">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-2xl font-bold text-gray-900">
              Eliminar Artesano
            </AlertDialogTitle>
            <AlertDialogDescription className="text-gray-600 text-base mt-2">
              ¿Estás seguro de que deseas dar de baja a este artesano?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-8 gap-3 sm:gap-0">
            <AlertDialogCancel
              disabled={isDeleting}
              className="rounded-full px-8 h-12 text-gray-600 border-gray-200 hover:bg-gray-50 font-medium"
            >
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault() // Evita que se cierre de golpe antes de ejecutar nuestra función
                handleEliminarConfirmado()
              }}
              disabled={isDeleting}
              className="rounded-full px-8 h-12 bg-red-600 hover:bg-red-700 text-white font-medium border-0"
            >
              {isDeleting ? 'Eliminando...' : 'Sí, eliminar'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

    </div>
  )
}