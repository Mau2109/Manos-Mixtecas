"use client"

import React, { useEffect, useState } from "react"
import { 
  listarUsuarios, 
  crearUsuario, 
  eliminarUsuario 
} from "../../../lib/services/usuarioService"
import { RouteGuard } from "@/components/auth/route-guard"
import { 
  UserPlus, 
  Trash2, 
  Mail,
  ShieldAlert,
  Store,
  X,
  Save,
  AlertCircle,
  CheckCircle2
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
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

export interface Usuario {
  nombre: string
  email: string
  rol?: string
  id_rol?: number
}

function UsuariosPageContent() {
  const [usuarios, setUsuarios] = useState<Usuario[]>([])
  const [loading, setLoading] = useState(true)
  const [filtroRol, setFiltroRol] = useState<string>("Todos")

  // Estados para el Modal de Añadir Usuario
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [newNombre, setNewNombre] = useState("")
  const [newEmail, setNewEmail] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [newIdRol, setNewIdRol] = useState<number>(0)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorBackend, setErrorBackend] = useState<string | null>(null)
  
  // Estados para Eliminar Usuario
  const [usuarioAEliminar, setUsuarioAEliminar] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  
  // Notificaciones globales (simulando Toasts)
  const [mensajeExito, setMensajeExito] = useState<string | null>(null)

  // Cargar usuarios al montar el componente
  const cargarUsuarios = async () => {
    try {
      setLoading(true)
      const data = await listarUsuarios()
      setUsuarios(data || [])
    } catch (error) {
      console.error("Error cargando usuarios:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    cargarUsuarios()
  }, [])

  // Limpiar mensaje de éxito después de 3 segundos
  useEffect(() => {
    if (mensajeExito) {
      const timer = setTimeout(() => setMensajeExito(null), 3000)
      return () => clearTimeout(timer)
    }
  }, [mensajeExito])

  // Lógica de Filtrado por Rol
  const usuariosFiltrados = usuarios.filter((user) => {
    if (filtroRol === "Todos") return true
    
    // Normalizamos el texto del rol para comparar
    const rolUsuario = (user.rol || "").toLowerCase()
    return rolUsuario.includes(filtroRol.toLowerCase())
  })

  // Validaciones del Formulario de Registro (Criterios ADM20)
  const isEmailValid = newEmail.includes("@") && newEmail.includes(".")
  const isPasswordValid = newPassword.length >= 8
  const isFormValid = newNombre.trim() !== "" && isEmailValid && isPasswordValid && newIdRol !== 0

  const resetForm = () => {
    setNewNombre("")
    setNewEmail("")
    setNewPassword("")
    setNewIdRol(0)
    setErrorBackend(null)
  }

  const handleCrearUsuario = async () => {
    if (!isFormValid) return

    try {
      setIsSubmitting(true)
      setErrorBackend(null)

      await crearUsuario({
        nombre: newNombre,
        email: newEmail,
        password: newPassword,
        id_rol: newIdRol
      })

      setMensajeExito("Usuario guardado en BD exitosamente.")
      resetForm()
      setIsAddModalOpen(false)
      cargarUsuarios() // Refrescar la lista
    } catch (error: any) {
      console.error("Error al registrar usuario:", error)
      // Criterio: Mostrar mensaje si hay duplicados
      setErrorBackend(error.message || "Este usuario o correo ya se encuentra registrado.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleEliminarUsuario = async () => {
    if (!usuarioAEliminar) return
    
    try {
      setIsDeleting(true)
      await eliminarUsuario(usuarioAEliminar)
      
      setMensajeExito(`Usuario ${usuarioAEliminar} eliminado exitosamente.`)
      setUsuarioAEliminar(null)
      cargarUsuarios() // Refrescar la lista para que desaparezca
    } catch (error: any) {
      console.error("Error al eliminar usuario:", error)
      alert("Hubo un error al eliminar el usuario.")
    } finally {
      setIsDeleting(false)
    }
  }

  // Helper para renderizar los badges de rol con colores bonitos
  const renderRolBadge = (rolRaw?: string, idRolRaw?: number) => {
    const rol = (rolRaw || "").toLowerCase()
    
    // Si sabemos que es admin (por string o id)
    if (rol.includes("admin") || idRolRaw === 1) {
      return (
        <Badge variant="outline" className="bg-purple-100 text-purple-800 border-purple-200 gap-1.5 px-2.5 py-1">
          <ShieldAlert className="w-3.5 h-3.5" />
          Administrador
        </Badge>
      )
    }
    
    // Si sabemos que es vendedor (por string o id)
    if (rol.includes("vende") || idRolRaw === 2) {
      return (
        <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-200 gap-1.5 px-2.5 py-1">
          <Store className="w-3.5 h-3.5" />
          Vendedor
        </Badge>
      )
    }

    // Default
    return <Badge variant="outline">{rolRaw || "Desconocido"}</Badge>
  }

  return (
    <div className="space-y-8 p-6 md:p-8 bg-[#FAFAFA] min-h-screen">
      
      {/* Alerta global de éxito */}
      {mensajeExito && (
        <div className="flex items-center gap-2 p-4 mb-4 text-emerald-800 bg-emerald-50 border border-emerald-200 rounded-xl shadow-sm transition-all animate-in fade-in slide-in-from-top-4">
          <CheckCircle2 className="w-5 h-5" />
          <p className="font-medium">{mensajeExito}</p>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-4xl font-bold tracking-tight text-gray-900">Usuarios</h1>
          <p className="text-sm text-gray-500 mt-1">Control de accesos y roles del sistema</p>
        </div>
        <Button 
          onClick={() => setIsAddModalOpen(true)}
          className="gap-2 rounded-full bg-primary hover:bg-primary/90 text-white shadow-sm"
        >
          <UserPlus className="w-4 h-4" />
          Añadir Usuario
        </Button>
      </div>

      {/* Tabs / Filtros por Rol */}
      <div className="border-b border-gray-200 flex gap-6">
        <button
          onClick={() => setFiltroRol("Todos")}
          className={`pb-4 px-1 text-sm font-semibold transition-colors border-b-2 ${
            filtroRol === "Todos" ? "border-orange-500 text-orange-600" : "border-transparent text-gray-500 hover:text-gray-700"
          }`}
        >
          Todos los perfiles
        </button>
        <button
          onClick={() => setFiltroRol("Administrador")}
          className={`pb-4 px-1 text-sm font-semibold transition-colors border-b-2 ${
            filtroRol === "Administrador" ? "border-purple-500 text-purple-700" : "border-transparent text-gray-500 hover:text-gray-700"
          }`}
        >
          Administradores
        </button>
        <button
          onClick={() => setFiltroRol("Vendedor")}
          className={`pb-4 px-1 text-sm font-semibold transition-colors border-b-2 ${
            filtroRol === "Vendedor" ? "border-blue-500 text-blue-700" : "border-transparent text-gray-500 hover:text-gray-700"
          }`}
        >
          Vendedores
        </button>
      </div>

      {/* Main Table Card */}
      <Card className="border-0 shadow-sm bg-white rounded-2xl overflow-hidden">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50/50 border-b-gray-100">
                <TableHead className="font-semibold text-xs tracking-wider text-gray-500 uppercase py-4 pl-6">Nombre del Usuario</TableHead>
                <TableHead className="font-semibold text-xs tracking-wider text-gray-500 uppercase py-4">Correo Electrónico</TableHead>
                <TableHead className="font-semibold text-xs tracking-wider text-gray-500 uppercase py-4">Rol Asignado</TableHead>
                <TableHead className="font-semibold text-xs tracking-wider text-gray-500 uppercase py-4 text-right pr-6">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-10 text-gray-500">Cargando usuarios...</TableCell>
                </TableRow>
              ) : usuariosFiltrados.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-10 text-gray-500">
                    Aún no hay usuarios registrados en este filtro.
                  </TableCell>
                </TableRow>
              ) : (
                usuariosFiltrados.map((user, idx) => (
                  <TableRow key={idx} className="hover:bg-gray-50/50 transition-colors">
                    {/* Nombre y Avatar Mínimo */}
                    <TableCell className="pl-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center border border-gray-200 shrink-0">
                          <span className="font-bold text-gray-600">{user.nombre.charAt(0).toUpperCase()}</span>
                        </div>
                        <span className="font-medium text-gray-900">{user.nombre}</span>
                      </div>
                    </TableCell>
                    
                    {/* Email */}
                    <TableCell className="py-4">
                      <div className="flex items-center gap-1.5 text-gray-600 text-sm">
                        <Mail className="w-3.5 h-3.5 text-gray-400" />
                        <span>{user.email}</span>
                      </div>
                    </TableCell>

                    {/* Rol */}
                    <TableCell className="py-4">
                      {renderRolBadge(user.rol, user.id_rol)}
                    </TableCell>
                    
                    {/* Acciones: Botón Eliminar */}
                    <TableCell className="text-right pr-6 py-4">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="rounded-full text-red-600 hover:bg-red-50 hover:text-red-700"
                        onClick={() => setUsuarioAEliminar(user.nombre)}
                      >
                        <Trash2 className="w-4 h-4 mr-1.5" />
                        Eliminar
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* =========================================================
          MODAL: AÑADIR USUARIO (Criterios ADM20)
          ========================================================= */}
      <Dialog open={isAddModalOpen} onOpenChange={(open) => {
        if (!open) resetForm()
        setIsAddModalOpen(open)
      }}>
        <DialogContent className="sm:max-w-112.5 bg-white rounded-2xl">
          <DialogHeader className="pb-4 border-b border-gray-100">
            <DialogTitle className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center">
                <UserPlus className="w-4 h-4 text-orange-600" />
              </div>
              Añadir Nuevo Usuario
            </DialogTitle>
          </DialogHeader>

          <div className="grid gap-5 py-4">
            
            {/* Mensaje de Error (Ej: Email único/Duplicado) */}
            {errorBackend && (
              <div className="flex items-center gap-2 p-3 text-sm text-red-600 bg-red-50 rounded-lg border border-red-100">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <p>{errorBackend}</p>
              </div>
            )}

            {/* Campo: Nombre */}
            <div className="space-y-2">
              <Label htmlFor="nombre" className="text-sm font-medium text-gray-700">Nombre completo <span className="text-red-500">*</span></Label>
              <Input
                id="nombre"
                placeholder="Ej. Juan Pérez"
                value={newNombre}
                onChange={(e) => setNewNombre(e.target.value)}
                className="rounded-xl border-gray-200 focus-visible:ring-orange-500"
              />
            </div>

            {/* Campo: Email */}
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium text-gray-700">Email <span className="text-red-500">*</span></Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  id="email"
                  type="email"
                  placeholder="usuario@ejemplo.com"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  className={`pl-9 rounded-xl border-gray-200 focus-visible:ring-orange-500 ${newEmail.length > 0 && !isEmailValid ? 'border-red-300 focus-visible:ring-red-500' : ''}`}
                />
              </div>
              {newEmail.length > 0 && !isEmailValid && (
                <p className="text-xs text-red-500 mt-1">Ingresa un formato de correo válido.</p>
              )}
            </div>

            {/* Campo: Password */}
            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium text-gray-700">Contraseña <span className="text-red-500">*</span></Label>
              <Input
                id="password"
                type="password"
                placeholder="Mínimo 8 caracteres"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className={`rounded-xl border-gray-200 focus-visible:ring-orange-500 ${newPassword.length > 0 && !isPasswordValid ? 'border-red-300 focus-visible:ring-red-500' : ''}`}
              />
              {newPassword.length > 0 && !isPasswordValid && (
                <p className="text-xs text-red-500 mt-1">La contraseña debe tener al menos 8 caracteres.</p>
              )}
            </div>

            {/* Campo: Selección de Rol (Obligatoria) */}
            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-700">Asignar Rol <span className="text-red-500">*</span></Label>
              <div className="grid grid-cols-2 gap-3">
                <div 
                  onClick={() => setNewIdRol(1)}
                  className={`border rounded-xl p-3 cursor-pointer transition-all flex flex-col items-center gap-2 ${newIdRol === 1 ? 'border-purple-500 bg-purple-50' : 'border-gray-200 hover:bg-gray-50'}`}
                >
                  <ShieldAlert className={`w-5 h-5 ${newIdRol === 1 ? 'text-purple-600' : 'text-gray-400'}`} />
                  <span className={`text-sm font-medium ${newIdRol === 1 ? 'text-purple-700' : 'text-gray-600'}`}>Administrador</span>
                </div>
                <div 
                  onClick={() => setNewIdRol(2)}
                  className={`border rounded-xl p-3 cursor-pointer transition-all flex flex-col items-center gap-2 ${newIdRol === 2 ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:bg-gray-50'}`}
                >
                  <Store className={`w-5 h-5 ${newIdRol === 2 ? 'text-blue-600' : 'text-gray-400'}`} />
                  <span className={`text-sm font-medium ${newIdRol === 2 ? 'text-blue-700' : 'text-gray-600'}`}>Vendedor</span>
                </div>
              </div>
            </div>

          </div>

          <DialogFooter className="pt-4 border-t border-gray-100 flex gap-2 sm:justify-end">
            <Button 
              variant="outline" 
              onClick={() => setIsAddModalOpen(false)}
              disabled={isSubmitting}
              className="rounded-full text-gray-600 border-gray-200 hover:bg-gray-100"
            >
              <X className="w-4 h-4 mr-2" />
              Cancelar
            </Button>
            <Button 
              onClick={handleCrearUsuario}
              disabled={!isFormValid || isSubmitting}
              className="rounded-full bg-orange-600 hover:bg-orange-700 text-white shadow-sm"
            >
              <Save className="w-4 h-4 mr-2" />
              {isSubmitting ? "Guardando..." : "Guardar Usuario"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>


      {/* =========================================================
          MODAL: ELIMINAR USUARIO (Criterios ADM22)
          ========================================================= */}
      <AlertDialog open={!!usuarioAEliminar} onOpenChange={(open) => !open && setUsuarioAEliminar(null)}>
        <AlertDialogContent className="rounded-2xl bg-white">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-xl font-bold text-gray-900">Eliminar usuario</AlertDialogTitle>
            <AlertDialogDescription className="text-gray-600">
              ¿Estás seguro de que deseas eliminar al usuario <span className="font-bold text-gray-900">{usuarioAEliminar}</span> del sistema? Esta acción lo dará de baja de la base de datos y no se podrá deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-4">
            <AlertDialogCancel className="rounded-full border-gray-200 text-gray-600 hover:bg-gray-100">
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={(e) => {
                e.preventDefault(); // Evitar que cierre instantáneamente para mostrar loading
                handleEliminarUsuario();
              }}
              disabled={isDeleting}
              className="rounded-full bg-red-600 text-white hover:bg-red-700"
            >
              {isDeleting ? "Eliminando..." : "Sí, eliminar usuario"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

    </div>
  )
}

export default function UsuariosPage() {
  return (
    <RouteGuard permiso="usuarios">
      <UsuariosPageContent />
    </RouteGuard>
  )
}
