"use client"

import React, { useEffect, useState } from "react"
import { obtenerArtesanos } from "@/lib/services/artesanoService"
import { 
  UserPlus, 
  Eye, 
  CheckCircle2, 
  XCircle, 
  Phone, 
  Mail,
  MapPin,
  X,
  Search
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import Link from "next/link"

export interface Artesano {
  id_artesano: number
  nombre: string
  apellido?: string
  telefono?: string
  email?: string
  comunidad?: string
  estado: boolean
  categorias?: { nombre: string }
  tipo?: string 
  foto_perfil?: string
}

export default function ProveedoresList() {
  const [proveedores, setProveedores] = useState<Artesano[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<string>("all")

  useEffect(() => {
    const cargarProveedores = async () => {
      try {
        setLoading(true)
        const data = await obtenerArtesanos() 
        setProveedores(data || [])
      } catch (error) {
        console.error("Error cargando proveedores:", error)
      } finally {
        setLoading(false)
      }
    }

    cargarProveedores()
  }, [])

  // Obtener categorías únicas
  const obtenerCategorias = () => {
    const categorias = new Set<string>()
    proveedores.forEach((proveedor) => {
      const cat = proveedor.categorias?.nombre || proveedor.tipo
      if (cat) categorias.add(cat)
    })
    return Array.from(categorias).sort()
  }

  // Filtrar proveedores
  const proveedoresFiltrados = proveedores.filter((proveedor) => {
    const nombreCompleto = `${proveedor.nombre} ${proveedor.apellido || ""}`.toLowerCase()
    const categoria = proveedor.categorias?.nombre || proveedor.tipo || ""
    const cumpleBusqueda = nombreCompleto.includes(searchTerm.toLowerCase()) || 
                          categoria.toLowerCase().includes(searchTerm.toLowerCase())
    const cumpleCategoria = selectedCategory === "all" || categoria === selectedCategory
    return cumpleBusqueda && cumpleCategoria
  })

  const getCategoryColor = (categoria: string) => {
    const cat = categoria?.toLowerCase() || ""
    if (cat.includes("barro")) return "bg-orange-100 text-orange-800 border-orange-200"
    if (cat.includes("textil")) return "bg-amber-100 text-amber-800 border-amber-200"
    if (cat.includes("madera")) return "bg-emerald-100 text-emerald-800 border-emerald-200"
    return "bg-gray-100 text-gray-800 border-gray-200"
  }

  return (
    <div className="space-y-8 p-6 md:p-8 bg-[#FAFAFA] min-h-screen">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-4xl font-bold tracking-tight text-gray-900">Artesanos</h1>
          <p className="text-sm text-gray-500 mt-1">Admin Control</p>
        </div>
        <Link href="/admin/proveedores/agregar">
            <Button variant="outline" className="gap-2 rounded-full bg-primary hover:bg-primary/90 text-white shadow-sm">
                <UserPlus className="w-4 h-4 mr-2" />
                Añadir Artesano
            </Button>
        </Link>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Buscar por nombre o categoría..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 rounded-lg border-gray-200 focus:border-orange-500"
          />
        </div>
        <div className="flex gap-2 flex-wrap sm:flex-nowrap">
          <Button
            variant={selectedCategory === "all" ? "default" : "outline"}
            onClick={() => setSelectedCategory("all")}
            className={`rounded-full ${selectedCategory === "all" ? "bg-orange-500 hover:bg-orange-600" : "border-gray-200"}`}
          >
            Todas
          </Button>
          {obtenerCategorias().map((categoria) => (
            <Button
              key={categoria}
              variant={selectedCategory === categoria ? "default" : "outline"}
              onClick={() => setSelectedCategory(categoria)}
              className={`rounded-full whitespace-nowrap ${selectedCategory === categoria ? "bg-orange-500 hover:bg-orange-600" : "border-gray-200"}`}
            >
              {categoria}
            </Button>
          ))}
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <div className="flex items-center gap-2 pb-4 border-b-2 border-orange-500 w-fit px-1">
          <span className="font-semibold text-orange-600">Artesanos</span>
          <Badge variant="secondary" className="bg-orange-100 text-orange-700 hover:bg-orange-100 rounded-full px-2">
            {proveedoresFiltrados.length}
          </Badge>
        </div>
      </div>
      

      {/* Main Table Card (Todos los proveedores) */}
      <Card className="border-0 shadow-sm bg-white rounded-2xl overflow-hidden">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50/50 border-b-gray-100">
                <TableHead className="font-semibold text-xs tracking-wider text-gray-500 uppercase py-4 pl-6">Nombre Proveedor</TableHead>
                <TableHead className="font-semibold text-xs tracking-wider text-gray-500 uppercase py-4">Categoría</TableHead>
                <TableHead className="font-semibold text-xs tracking-wider text-gray-500 uppercase py-4">Contacto</TableHead>
                <TableHead className="font-semibold text-xs tracking-wider text-gray-500 uppercase py-4">Estatus</TableHead>
                <TableHead className="font-semibold text-xs tracking-wider text-gray-500 uppercase py-4 text-right pr-6">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-gray-500">Cargando proveedores...</TableCell>
                </TableRow>
              ) : proveedoresFiltrados.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                    {proveedores.length === 0 ? "No hay proveedores registrados." : "No se encontraron resultados."}
                  </TableCell>
                </TableRow>
              ) : (
                proveedoresFiltrados.map((proveedor) => (
                  <TableRow key={proveedor.id_artesano} className="hover:bg-gray-50/50 transition-colors">
                    <TableCell className="pl-6 py-4">
                      <div className="flex items-center gap-3">
                        {/* AQUI SE MUESTRA LA FOTO EN LA TABLA */}
                        <div className="w-10 h-10 rounded-full bg-gray-200 overflow-hidden shrink-0 border border-gray-100">
                          {proveedor.foto_perfil ? (
                            <img src={proveedor.foto_perfil} alt={proveedor.nombre} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-orange-100 text-orange-700 font-bold">
                              {proveedor.nombre.charAt(0)}
                            </div>
                          )}
                        </div>
                        <span className="font-medium text-gray-900">
                          {proveedor.nombre} {proveedor.apellido}
                        </span>
                      </div>
                    </TableCell>
                    
                    <TableCell className="py-4">
                      <Badge variant="outline" className={`${getCategoryColor(proveedor.categorias?.nombre || proveedor.tipo || "")} rounded-md font-medium border-0`}>
                        {proveedor.categorias?.nombre || proveedor.tipo || "Sin categoría"}
                      </Badge>
                    </TableCell>
                    
                    <TableCell className="py-4">
                      <div className="flex items-center gap-1.5 text-gray-500 text-sm">
                        <Mail className="w-3.5 h-3.5" />
                        <span>{proveedor.email || proveedor.telefono || "No registrado"}</span>
                      </div>
                    </TableCell>
                    
                    <TableCell className="py-4">
                      {proveedor.estado ? (
                        <div className="flex items-center gap-1.5 text-emerald-600 text-sm font-medium">
                          <CheckCircle2 className="w-4 h-4 fill-emerald-100 text-emerald-600" />
                          Verified
                        </div>
                      ) : (
                        <div className="flex items-center gap-1.5 text-gray-400 text-sm font-medium">
                          <XCircle className="w-4 h-4" />
                          Inactive
                        </div>
                      )}
                    </TableCell>
                    
                    <TableCell className="text-right pr-6 py-4">
                      <Link href={`/admin/proveedores/${proveedor.id_artesano}`}>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="rounded-full text-gray-600 border-gray-200 hover:bg-gray-100 hover:text-gray-900"
                        >
                          <Eye className="w-4 h-4 mr-1.5 text-gray-400" />
                          View Details
                        </Button>
                      </Link>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

    </div>
  )
}