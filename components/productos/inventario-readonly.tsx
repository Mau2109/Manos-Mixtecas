"use client"

import { consultarProductos } from "@/lib/services/productoService"
import { useEffect, useState } from "react"
import {
  Package,
  AlertTriangle,
  DollarSign,
  Tags,
  Search,
  Eye,
  Filter,
  RefreshCw,
  X,
  ShieldAlert,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"

// Tipo para producto completo
export interface Producto {
  id: string
  codigo: string
  imagen: string
  nombre: string
  descripcion: string
  precio: number
  stock: number
  materiales: string
  tecnica: string
  categoria: string
  artesano: string
}

const categorias = [
  "Todas las categorías",
  "Textiles",
  "Cerámica",
  "Madera",
  "Joyería",
  "Barro Negro",
]

// Función para obtener el color del stock según las reglas
function getStockColor(stock: number): string {
  if (stock > 20) {
    return "bg-green-100 text-green-700 border-green-200"
  } else if (stock >= 5 && stock <= 20) {
    return "bg-yellow-100 text-yellow-700 border-yellow-200"
  } else {
    return "bg-red-100 text-red-700 border-red-200"
  }
}

export function InventarioReadonly() {
  const [productos, setProductos] = useState<Producto[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const cargarProductos = async () => {
      try {
        setLoading(true)
        const data = await consultarProductos()

        // MAPEO de backend → UI
        const productosMapeados = data.map((p: any) => ({
          id: p.id_producto.toString(),
          codigo: "ART" + p.id_producto,
          imagen: p.imagen || "/placeholder.jpg",
          nombre: p.nombre,
          descripcion: p.descripcion || "",
          precio: p.precio,
          stock: p.stock,
          materiales: p.materiales || "",
          tecnica: p.tecnica || "",
          categoria: p.categorias?.nombre || "Sin categoría",
          artesano: p.artesanos
            ? `${p.artesanos.nombre} ${p.artesanos.apellido}`
            : "N/A",
        }))

        setProductos(productosMapeados)
      } catch (error) {
        console.error("Error cargando productos:", error)
      } finally {
        setLoading(false)
      }
    }

    cargarProductos()
  }, [])

  const [busqueda, setBusqueda] = useState("")
  const [categoriaFiltro, setCategoriaFiltro] = useState("Todas las categorías")
  const [stockFiltro, setStockFiltro] = useState("Todo el stock")
  const [productoConsulta, setProductoConsulta] = useState<Producto | null>(null)

  // Estadísticas
  const totalProductos = productos.length
  const stockBajo = productos.filter((p) => p.stock <= 5).length
  const valorInventario = productos.reduce((acc, p) => acc + p.precio * p.stock, 0)
  const totalCategorias = new Set(categorias.filter((c) => c !== "Todas las categorías")).size

  // Filtrar productos
  const productosFiltrados = productos.filter((producto) => {
    const coincideBusqueda =
      producto.codigo.toLowerCase().includes(busqueda.toLowerCase()) ||
      producto.nombre.toLowerCase().includes(busqueda.toLowerCase())
    
    const coincideCategoria = 
      categoriaFiltro === "Todas las categorías" || producto.categoria === categoriaFiltro
    
    let coincideStock = true
    if (stockFiltro === "Stock bajo") {
      coincideStock = producto.stock <= 5
    } else if (stockFiltro === "Stock medio") {
      coincideStock = producto.stock > 5 && producto.stock <= 20
    } else if (stockFiltro === "Stock alto") {
      coincideStock = producto.stock > 20
    }
    
    return coincideBusqueda && coincideCategoria && coincideStock
  })

  const limpiarFiltros = () => {
    setBusqueda("")
    setCategoriaFiltro("Todas las categorías")
    setStockFiltro("Todo el stock")
  }

  const handleRefresh = async () => {
    setLoading(true)
    try {
      const data = await consultarProductos()
      const productosMapeados = data.map((p: any) => ({
        id: p.id_producto.toString(),
        codigo: "ART" + p.id_producto,
        imagen: p.imagen || "/placeholder.jpg",
        nombre: p.nombre,
        descripcion: p.descripcion || "",
        precio: p.precio,
        stock: p.stock,
        materiales: p.materiales || "",
        tecnica: p.tecnica || "",
        categoria: p.categorias?.nombre || "Sin categoría",
        artesano: p.artesanos
          ? `${p.artesanos.nombre} ${p.artesanos.apellido}`
          : "N/A",
      }))
      setProductos(productosMapeados)
    } catch (error) {
      console.error("Error cargando productos:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <p className="text-sm text-muted-foreground">Páginas / Inventario</p>
          <h1 className="text-2xl font-semibold text-foreground">Inventario de Artesanías</h1>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="flex items-center gap-1">
            <ShieldAlert className="w-3 h-3" />
            Solo lectura
          </Badge>
        </div>
      </div>

      {/* Aviso de acceso restringido */}
      <Card className="border-amber-200 bg-amber-50">
        <CardContent className="flex items-center gap-3 p-4">
          <ShieldAlert className="w-5 h-5 text-amber-600" />
          <div>
            <p className="text-sm font-medium text-amber-800">Acceso de solo lectura</p>
            <p className="text-xs text-amber-600">
              Como vendedor, puedes consultar el inventario pero no tienes permisos para agregar, editar o eliminar productos.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Stats Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="flex items-center justify-between p-6">
            <div>
              <p className="text-sm text-muted-foreground">Total Productos</p>
              <p className="text-2xl font-bold text-foreground">{totalProductos}</p>
            </div>
            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary/10">
              <Package className="w-6 h-6 text-primary" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center justify-between p-6">
            <div>
              <p className="text-sm text-muted-foreground">Stock Bajo</p>
              <p className="text-2xl font-bold text-foreground">{stockBajo}</p>
              <p className="text-xs text-destructive">5 unidades o menos</p>
            </div>
            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-destructive/10">
              <AlertTriangle className="w-6 h-6 text-destructive" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center justify-between p-6">
            <div>
              <p className="text-sm text-muted-foreground">Valor Inventario</p>
              <p className="text-2xl font-bold text-foreground">
                ${valorInventario.toLocaleString()}
              </p>
            </div>
            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-accent/30">
              <DollarSign className="w-6 h-6 text-primary" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center justify-between p-6">
            <div>
              <p className="text-sm text-muted-foreground">Categorías</p>
              <p className="text-2xl font-bold text-foreground">{totalCategorias}</p>
            </div>
            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-accent/30">
              <Tags className="w-6 h-6 text-primary" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Lista de Productos */}
      <Card>
        <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <CardTitle>Lista de Productos</CardTitle>
            <CardDescription>
              Consulta el inventario de artesanías
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" onClick={handleRefresh} disabled={loading}>
              <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {/* Filtros */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <Select value={categoriaFiltro} onValueChange={setCategoriaFiltro}>
              <SelectTrigger className="w-full sm:w-48 bg-background">
                <SelectValue placeholder="Todas las categorías" />
              </SelectTrigger>
              <SelectContent>
                {categorias.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={stockFiltro} onValueChange={setStockFiltro}>
              <SelectTrigger className="w-full sm:w-48 bg-background">
                <SelectValue placeholder="Todo el stock" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Todo el stock">Todo el stock</SelectItem>
                <SelectItem value="Stock bajo">Stock bajo (5 o menos)</SelectItem>
                <SelectItem value="Stock medio">Stock medio (6-20)</SelectItem>
                <SelectItem value="Stock alto">Stock alto (más de 20)</SelectItem>
              </SelectContent>
            </Select>
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por código o nombre..."
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                className="pl-9 bg-background"
              />
            </div>
            <Button variant="outline" onClick={limpiarFiltros}>
              <Filter className="w-4 h-4 mr-2" />
              Limpiar filtros
            </Button>
          </div>

          {/* Leyenda de colores */}
          <div className="flex flex-wrap gap-4 mb-4 p-3 bg-muted/30 rounded-lg">
            <span className="text-sm text-muted-foreground font-medium">Indicadores de stock:</span>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700 border border-green-200">
                +20
              </span>
              <span className="text-sm text-muted-foreground">Alto</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-700 border border-yellow-200">
                5-20
              </span>
              <span className="text-sm text-muted-foreground">Medio</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-700 border border-red-200">
                5 o menos
              </span>
              <span className="text-sm text-muted-foreground">Bajo</span>
            </div>
          </div>

          {/* Tabla */}
          <div className="rounded-lg border border-border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead className="font-semibold">Código</TableHead>
                  <TableHead className="font-semibold">Imagen</TableHead>
                  <TableHead className="font-semibold">Nombre</TableHead>
                  <TableHead className="font-semibold text-right">Precio</TableHead>
                  <TableHead className="font-semibold text-center">Stock</TableHead>
                  <TableHead className="font-semibold text-center">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8">
                      <RefreshCw className="w-6 h-6 animate-spin mx-auto text-muted-foreground" />
                      <p className="text-muted-foreground mt-2">Cargando productos...</p>
                    </TableCell>
                  </TableRow>
                ) : productosFiltrados.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                      No se encontraron productos
                    </TableCell>
                  </TableRow>
                ) : (
                  productosFiltrados.map((producto) => (
                    <TableRow key={producto.id} className="hover:bg-muted/30">
                      <TableCell className="font-medium text-foreground">
                        {producto.codigo}
                      </TableCell>
                      <TableCell>
                        <div className="w-12 h-12 rounded-lg overflow-hidden border border-border bg-muted">
                          <img
                            src={producto.imagen}
                            alt={producto.nombre}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      </TableCell>
                      <TableCell className="text-foreground">{producto.nombre}</TableCell>
                      <TableCell className="text-right font-medium text-foreground">
                        ${producto.precio.toLocaleString()}
                      </TableCell>
                      <TableCell className="text-center">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStockColor(producto.stock)}`}
                        >
                          {producto.stock}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center justify-center">
                          {/* Solo botón de consultar */}
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-blue-600 border-blue-300 hover:bg-blue-50"
                            onClick={() => setProductoConsulta(producto)}
                          >
                            <Eye className="w-4 h-4 mr-1" />
                            Consultar
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Modal de consulta */}
      <Dialog open={!!productoConsulta} onOpenChange={() => setProductoConsulta(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Eye className="w-5 h-5" />
              Detalle del Producto
            </DialogTitle>
          </DialogHeader>
          {productoConsulta && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="aspect-square rounded-lg overflow-hidden border border-border bg-muted">
                  <img
                    src={productoConsulta.imagen}
                    alt={productoConsulta.nombre}
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <span className="text-sm text-muted-foreground">Código</span>
                  <p className="font-medium">{productoConsulta.codigo}</p>
                </div>
                <div>
                  <span className="text-sm text-muted-foreground">Nombre</span>
                  <p className="font-medium">{productoConsulta.nombre}</p>
                </div>
                <div>
                  <span className="text-sm text-muted-foreground">Descripción</span>
                  <p className="text-sm">{productoConsulta.descripcion || "Sin descripción"}</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-sm text-muted-foreground">Precio</span>
                    <p className="font-bold text-lg">${productoConsulta.precio.toLocaleString()}</p>
                  </div>
                  <div>
                    <span className="text-sm text-muted-foreground">Stock</span>
                    <p>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-medium border ${getStockColor(productoConsulta.stock)}`}>
                        {productoConsulta.stock} unidades
                      </span>
                    </p>
                  </div>
                </div>
                <div>
                  <span className="text-sm text-muted-foreground">Categoría</span>
                  <p className="font-medium">{productoConsulta.categoria}</p>
                </div>
                <div>
                  <span className="text-sm text-muted-foreground">Artesano</span>
                  <p className="font-medium">{productoConsulta.artesano}</p>
                </div>
                <div>
                  <span className="text-sm text-muted-foreground">Materiales</span>
                  <p className="text-sm">{productoConsulta.materiales || "No especificado"}</p>
                </div>
                <div>
                  <span className="text-sm text-muted-foreground">Técnica</span>
                  <p className="text-sm">{productoConsulta.tecnica || "No especificada"}</p>
                </div>
              </div>
            </div>
          )}
          <div className="flex justify-end mt-4">
            <Button variant="outline" onClick={() => setProductoConsulta(null)}>
              <X className="w-4 h-4 mr-2" />
              Cerrar
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
