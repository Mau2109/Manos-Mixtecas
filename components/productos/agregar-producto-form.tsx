"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, Upload, X, Star, ImagePlus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { obtenerCategorias, crearCategoria, crearProducto } from "@/lib/services/productoService"
import { obtenerArtesanos } from "@/lib/services/artesanoService"
import { supabase } from "@/lib/supabaseClient"

interface ImagenProducto {
  file: File
  preview: string
  esPrincipal: boolean
}

interface FormData {
  codigo: string
  nombre: string
  descripcion: string
  precio: string
  materiales: string
  tecnica: string
  categoria: string
  artesano: string
}

export function AgregarProductoForm() {
  const router = useRouter()
  const [formData, setFormData] = useState<FormData>({
    codigo: "",
    nombre: "",
    descripcion: "",
    precio: "",
    materiales: "",
    tecnica: "",
    categoria: "",
    artesano: "",
  })
  
  const [imagenes, setImagenes] = useState<ImagenProducto[]>([])
  const [categorias, setCategorias] = useState<any[]>([])
  const [artesanos, setArtesanos] = useState<any[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [mostrarModalCategoria, setMostrarModalCategoria] = useState(false)
  const [nuevaCategoria, setNuevaCategoria] = useState({
    nombre: "",
    descripcion: ""
  })

  useEffect(() => {
    obtenerArtesanos().then(setArtesanos)
  }, [])

  useEffect(() => {
    const cargarCategorias = async () => {
      try {
        const data = await obtenerCategorias()
        setCategorias(data)
      } catch (error) {
        console.error("Error cargando categorías:", error)
      }
    }
    cargarCategorias()
  }, [])

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleImagenesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (files.length === 0) return

    const nuevasImagenes: ImagenProducto[] = files.map((file, index) => ({
      file,
      preview: URL.createObjectURL(file),
      esPrincipal: imagenes.length === 0 && index === 0
    }))

    setImagenes((prev) => [...prev, ...nuevasImagenes])
  }

  const establecerComoPrincipal = (index: number) => {
    setImagenes((prev) =>
      prev.map((img, i) => ({
        ...img,
        esPrincipal: i === index
      }))
    )
  }

  const eliminarImagen = (index: number) => {
    setImagenes((prev) => {
      const nuevasImagenes = [...prev]
      URL.revokeObjectURL(nuevasImagenes[index].preview)
      nuevasImagenes.splice(index, 1)
      
      // Si eliminamos la principal y quedan imágenes, la primera se vuelve principal
      if (nuevasImagenes.length > 0 && !nuevasImagenes.some(img => img.esPrincipal)) {
        nuevasImagenes[0].esPrincipal = true
      }
      
      return nuevasImagenes
    })
  }

  const subirImagenAStorage = async (file: File): Promise<string> => {
    const fileName = `${Date.now()}_${file.name.replace(/\s+/g, '_')}`
    
    const { error } = await supabase.storage
      .from("productos")
      .upload(fileName, file)

    if (error) throw error

    const { data: publicUrl } = supabase.storage
      .from("productos")
      .getPublicUrl(fileName)

    return publicUrl.publicUrl
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validar que hay al menos una imagen principal
    const imagenPrincipal = imagenes.find(img => img.esPrincipal)
    if (!imagenPrincipal) {
      alert("Debe agregar al menos una imagen principal")
      return
    }

    setIsSubmitting(true)

    try {
      // 1. Subir imagen principal
      const urlImagenPrincipal = await subirImagenAStorage(imagenPrincipal.file)

      // 2. Crear el producto con la imagen principal
      const nuevoProducto = await crearProducto({
        nombre: formData.nombre,
        descripcion: formData.descripcion,
        precio: Number(formData.precio),
        stock: 0,
        id_categoria: Number(formData.categoria),
        id_artesano: formData.artesano ? Number(formData.artesano) : null,
        materiales: formData.materiales,
        tecnica: formData.tecnica,
        imagen: urlImagenPrincipal
      })

      // 3. Subir imágenes adicionales a la tabla imagenes_producto
      const imagenesAdicionales = imagenes.filter(img => !img.esPrincipal)
      
      for (let i = 0; i < imagenesAdicionales.length; i++) {
        const imgAdicional = imagenesAdicionales[i]
        const urlAdicional = await subirImagenAStorage(imgAdicional.file)
        
        await supabase
          .from("imagenes_producto")
          .insert({
            id_producto: nuevoProducto.id_producto,
            url: urlAdicional,
            descripcion: `Imagen ${i + 2} de ${formData.nombre}`,
            orden: i + 1
          })
      }

      // También guardar la imagen principal en imagenes_producto con orden 0
      await supabase
        .from("imagenes_producto")
        .insert({
          id_producto: nuevoProducto.id_producto,
          url: urlImagenPrincipal,
          descripcion: `Imagen principal de ${formData.nombre}`,
          orden: 0
        })

      alert("Producto creado correctamente")
      router.push("/inventario")

    } catch (error) {
      console.error("Error al crear producto:", error)
      alert("Error al crear el producto")
    } finally {
      setIsSubmitting(false)
    }
  }

  const tienePrincipal = imagenes.some(img => img.esPrincipal)

  return (
    <>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-foreground">Agregar Producto</h1>
            <p className="text-muted-foreground mt-1">
              Completa la información del nuevo producto artesanal
            </p>
          </div>
          <Button
            variant="outline"
            onClick={() => router.push("/admin/inventario")}
            className="gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Volver a Inventario
          </Button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="grid gap-6 lg:grid-cols-3">
            {/* Información Básica */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="text-lg">Información Básica</CardTitle>
                <CardDescription>Datos principales del producto</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="codigo">
                      Código <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="codigo"
                      name="codigo"
                      placeholder="Código único (obligatorio)"
                      value={formData.codigo}
                      onChange={handleInputChange}
                      required
                      className="bg-background"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="nombre">
                      Nombre <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="nombre"
                      name="nombre"
                      placeholder="Nombre del producto (obligatorio)"
                      value={formData.nombre}
                      onChange={handleInputChange}
                      required
                      className="bg-background"
                    />
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="categoria">
                      Categoría <span className="text-destructive">*</span>
                    </Label>
                    <Select
                      value={formData.categoria}
                      onValueChange={(value) => handleSelectChange("categoria", value)}
                      required
                    >
                      <SelectTrigger className="bg-background">
                        <SelectValue placeholder="Seleccionar categoría (obligatorio)" />
                      </SelectTrigger>
                      <SelectContent>
                        {categorias.map((cat: any) => (
                          <SelectItem
                            key={cat.id_categoria}
                            value={cat.id_categoria.toString()}
                          >
                            {cat.nombre}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <button
                      type="button"
                      className="text-sm text-primary hover:underline mt-1"
                      onClick={() => setMostrarModalCategoria(true)}
                    >
                      + Nueva categoría
                    </button>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="precio">
                      Precio <span className="text-destructive">*</span>
                    </Label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                        $
                      </span>
                      <Input
                        id="precio"
                        name="precio"
                        type="number"
                        step="0.01"
                        min="0"
                        placeholder="0.00 (obligatorio)"
                        value={formData.precio}
                        onChange={handleInputChange}
                        required
                        className="pl-7 bg-background"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="descripcion">Descripción</Label>
                  <Textarea
                    id="descripcion"
                    name="descripcion"
                    placeholder="Descripción detallada del producto (opcional)"
                    value={formData.descripcion}
                    onChange={handleInputChange}
                    rows={4}
                    className="bg-background resize-none"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Imágenes del producto */}
            <Card className="lg:row-span-2">
              <CardHeader>
                <CardTitle className="text-lg">
                  Imágenes <span className="text-destructive">*</span>
                </CardTitle>
                <CardDescription>
                  Sube una o más fotos. La primera será la imagen principal.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Zona de subida */}
                <label
                  htmlFor="imagenes"
                  className="flex flex-col items-center justify-center p-6 rounded-lg border-2 border-dashed border-border hover:border-primary/50 cursor-pointer transition-colors bg-muted/30"
                >
                  <ImagePlus className="w-8 h-8 text-muted-foreground mb-2" />
                  <span className="text-sm text-muted-foreground text-center">
                    {imagenes.length === 0 
                      ? "Clic para subir imágenes (obligatorio)" 
                      : "Agregar más imágenes"}
                  </span>
                  <span className="text-xs text-muted-foreground mt-1">
                    PNG, JPG hasta 5MB
                  </span>
                  <input
                    id="imagenes"
                    name="imagenes"
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleImagenesChange}
                    className="hidden"
                  />
                </label>

                {/* Leyenda */}
                {imagenes.length > 0 && (
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                    <span>= Imagen principal (se muestra en inventario)</span>
                  </div>
                )}

                {/* Grid de imágenes */}
                {imagenes.length > 0 && (
                  <div className="grid grid-cols-2 gap-3">
                    {imagenes.map((img, index) => (
                      <div
                        key={index}
                        className={`relative aspect-square rounded-lg overflow-hidden border-2 ${
                          img.esPrincipal 
                            ? "border-amber-400 ring-2 ring-amber-400/30" 
                            : "border-border"
                        }`}
                      >
                        <img
                          src={img.preview}
                          alt={`Imagen ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                        
                        {/* Badge de principal */}
                        {img.esPrincipal && (
                          <div className="absolute top-1 left-1 bg-amber-400 text-amber-900 text-xs px-1.5 py-0.5 rounded font-medium flex items-center gap-1">
                            <Star className="w-3 h-3 fill-current" />
                            Principal
                          </div>
                        )}

                        {/* Botones de acción */}
                        <div className="absolute top-1 right-1 flex gap-1">
                          {!img.esPrincipal && (
                            <button
                              type="button"
                              onClick={() => establecerComoPrincipal(index)}
                              className="p-1 bg-background/80 rounded hover:bg-amber-100 transition-colors"
                              title="Establecer como principal"
                            >
                              <Star className="w-3.5 h-3.5 text-amber-600" />
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => eliminarImagen(index)}
                            className="p-1 bg-background/80 rounded hover:bg-red-100 transition-colors"
                            title="Eliminar imagen"
                          >
                            <X className="w-3.5 h-3.5 text-red-600" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Contador */}
                {imagenes.length > 0 && (
                  <p className="text-xs text-muted-foreground text-center">
                    {imagenes.length} imagen{imagenes.length !== 1 ? "es" : ""} seleccionada{imagenes.length !== 1 ? "s" : ""}
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Detalles adicionales */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="text-lg">Detalles de Elaboración</CardTitle>
                <CardDescription>Información sobre materiales y técnica</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="materiales">Materiales</Label>
                    <Input
                      id="materiales"
                      name="materiales"
                      placeholder="Ej: Barro, pintura natural (opcional)"
                      value={formData.materiales}
                      onChange={handleInputChange}
                      className="bg-background"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="tecnica">Técnica</Label>
                    <Input
                      id="tecnica"
                      name="tecnica"
                      placeholder="Ej: Moldeado a mano (opcional)"
                      value={formData.tecnica}
                      onChange={handleInputChange}
                      className="bg-background"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Artesano */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Artesano</CardTitle>
                <CardDescription>Creador de la pieza</CardDescription>
              </CardHeader>
              <CardContent>
                <Select
                  value={formData.artesano}
                  onValueChange={(value) => handleSelectChange("artesano", value)}
                >
                  <SelectTrigger className="bg-background">
                    <SelectValue placeholder="Seleccionar artesano (opcional)" />
                  </SelectTrigger>
                  <SelectContent>
                    {artesanos.map((art: any) => (
                      <SelectItem
                        key={art.id_artesano}
                        value={art.id_artesano.toString()}
                      >
                        {art.nombre} {art.apellido}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button
                  type="button"
                  variant="outline"
                  className="mt-3 w-full"
                  onClick={() => router.push("/proveedores/agregar")}
                >
                  + Nuevo artesano
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Botones de acción */}
          <div className="flex items-center gap-4 mt-6 pt-6 border-t border-border">
            <Button 
              type="submit" 
              className="bg-primary hover:bg-primary/90"
              disabled={isSubmitting || !tienePrincipal}
            >
              {isSubmitting ? "Guardando..." : "Guardar Producto"}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push("/admin/inventario")}
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
          </div>
        </form>
      </div>

      {/* Modal Nueva Categoría */}
      {mostrarModalCategoria && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-card p-6 rounded-lg w-96 shadow-xl">
            <h2 className="text-lg font-bold mb-4 text-foreground">Nueva categoría</h2>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="nuevaCatNombre">Nombre</Label>
                <Input
                  id="nuevaCatNombre"
                  placeholder="Nombre de la categoría"
                  value={nuevaCategoria.nombre}
                  onChange={(e) =>
                    setNuevaCategoria({ ...nuevaCategoria, nombre: e.target.value })
                  }
                  className="bg-background"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="nuevaCatDesc">Descripción (opcional)</Label>
                <Textarea
                  id="nuevaCatDesc"
                  placeholder="Descripción de la categoría"
                  value={nuevaCategoria.descripcion}
                  onChange={(e) =>
                    setNuevaCategoria({ ...nuevaCategoria, descripcion: e.target.value })
                  }
                  className="bg-background resize-none"
                  rows={3}
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <Button
                type="button"
                variant="outline"
                onClick={() => setMostrarModalCategoria(false)}
              >
                Cancelar
              </Button>
              <Button
                type="button"
                onClick={async () => {
                  try {
                    const nueva = await crearCategoria({
                      nombre: nuevaCategoria.nombre,
                      descripcion: nuevaCategoria.descripcion
                    })

                    setCategorias([...categorias, nueva])
                    setFormData({
                      ...formData,
                      categoria: nueva.id_categoria.toString(),
                    })

                    setNuevaCategoria({ nombre: "", descripcion: "" })
                    setMostrarModalCategoria(false)
                  } catch (error: any) {
                    alert(error.message)
                  }
                }}
                className="bg-primary hover:bg-primary/90"
              >
                Guardar
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
