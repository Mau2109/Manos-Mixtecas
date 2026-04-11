"use client"

import { useState, useEffect } from "react"
import { X, Upload, Lock, Star, ImagePlus } from "lucide-react"
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { obtenerCategorias } from "@/lib/services/productoService"
import { obtenerArtesanos } from "@/lib/services/artesanoService"
import { supabase } from "@/lib/supabaseClient"
import type { Producto } from "./inventario-list"

interface ImagenExistente {
  id_imagen: number
  url: string
  descripcion: string | null
  orden: number
  esPrincipal: boolean
}

interface ImagenNueva {
  file: File
  preview: string
  esPrincipal: boolean
}

interface EditarProductoModalProps {
  producto: Producto
  onClose: () => void
  onSave: (producto: Producto) => void
}

export function EditarProductoModal({ producto, onClose, onSave }: EditarProductoModalProps) {
  const [formData, setFormData] = useState({
    ...producto,
    precio: producto.precio.toString(),
    stock: producto.stock.toString(),
  })
  
  const [imagenesExistentes, setImagenesExistentes] = useState<ImagenExistente[]>([])
  const [imagenesNuevas, setImagenesNuevas] = useState<ImagenNueva[]>([])
  const [imagenesAEliminar, setImagenesAEliminar] = useState<number[]>([])
  const [categorias, setCategorias] = useState<any[]>([])
  const [artesanos, setArtesanos] = useState<any[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Cargar categorías y artesanos
  useEffect(() => {
    obtenerCategorias().then(setCategorias)
    obtenerArtesanos().then(setArtesanos)
  }, [])

  // Cargar imágenes existentes del producto
  useEffect(() => {
    const cargarImagenes = async () => {
      try {
        const { data, error } = await supabase
          .from("imagenes_producto")
          .select("*")
          .eq("id_producto", producto.id)
          .order("orden", { ascending: true })

        if (error) throw error

        if (data && data.length > 0) {
          setImagenesExistentes(data.map((img, index) => ({
            ...img,
            esPrincipal: img.orden === 0 || (index === 0 && img.url === producto.imagen)
          })))
        } else {
          // Si no hay imágenes en la tabla, usar la imagen principal del producto
          setImagenesExistentes([{
            id_imagen: 0,
            url: producto.imagen,
            descripcion: "Imagen principal",
            orden: 0,
            esPrincipal: true
          }])
        }
      } catch (error) {
        console.error("Error al cargar imágenes:", error)
        // Fallback: usar imagen del producto
        setImagenesExistentes([{
          id_imagen: 0,
          url: producto.imagen,
          descripcion: "Imagen principal",
          orden: 0,
          esPrincipal: true
        }])
      }
    }
    cargarImagenes()
  }, [producto])

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleNuevasImagenes = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (files.length === 0) return

    const nuevas: ImagenNueva[] = files.map((file) => ({
      file,
      preview: URL.createObjectURL(file),
      esPrincipal: false
    }))

    setImagenesNuevas((prev) => [...prev, ...nuevas])
  }

  const establecerPrincipalExistente = (index: number) => {
    setImagenesExistentes((prev) =>
      prev.map((img, i) => ({ ...img, esPrincipal: i === index }))
    )
    setImagenesNuevas((prev) =>
      prev.map((img) => ({ ...img, esPrincipal: false }))
    )
  }

  const establecerPrincipalNueva = (index: number) => {
    setImagenesExistentes((prev) =>
      prev.map((img) => ({ ...img, esPrincipal: false }))
    )
    setImagenesNuevas((prev) =>
      prev.map((img, i) => ({ ...img, esPrincipal: i === index }))
    )
  }

  const eliminarImagenExistente = (index: number) => {
    const imagen = imagenesExistentes[index]
    if (imagen.id_imagen > 0) {
      setImagenesAEliminar((prev) => [...prev, imagen.id_imagen])
    }
    
    setImagenesExistentes((prev) => {
      const nuevas = [...prev]
      nuevas.splice(index, 1)
      
      // Si se eliminó la principal, establecer la primera como principal
      if (imagen.esPrincipal && nuevas.length > 0) {
        nuevas[0].esPrincipal = true
      } else if (imagen.esPrincipal && nuevas.length === 0 && imagenesNuevas.length > 0) {
        setImagenesNuevas((prevNuevas) => {
          const updated = [...prevNuevas]
          updated[0].esPrincipal = true
          return updated
        })
      }
      
      return nuevas
    })
  }

  const eliminarImagenNueva = (index: number) => {
    setImagenesNuevas((prev) => {
      const nuevas = [...prev]
      URL.revokeObjectURL(nuevas[index].preview)
      const eliminada = nuevas.splice(index, 1)[0]
      
      // Si se eliminó la principal, establecer la primera disponible
      if (eliminada.esPrincipal) {
        if (imagenesExistentes.length > 0) {
          setImagenesExistentes((prevEx) => {
            const updated = [...prevEx]
            updated[0].esPrincipal = true
            return updated
          })
        } else if (nuevas.length > 0) {
          nuevas[0].esPrincipal = true
        }
      }
      
      return nuevas
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
    
    const todasImagenes = [...imagenesExistentes, ...imagenesNuevas]
    const tienePrincipal = todasImagenes.some(img => img.esPrincipal)
    
    if (!tienePrincipal && todasImagenes.length > 0) {
      alert("Debe haber una imagen principal")
      return
    }

    if (todasImagenes.length === 0) {
      alert("El producto debe tener al menos una imagen")
      return
    }

    setIsSubmitting(true)

    try {
      // 1. Eliminar imágenes marcadas para eliminar
      for (const idImagen of imagenesAEliminar) {
        await supabase
          .from("imagenes_producto")
          .delete()
          .eq("id_imagen", idImagen)
      }

      // 2. Subir imágenes nuevas
      let urlPrincipal = imagenesExistentes.find(img => img.esPrincipal)?.url || ""
      
      for (let i = 0; i < imagenesNuevas.length; i++) {
        const imgNueva = imagenesNuevas[i]
        const urlNueva = await subirImagenAStorage(imgNueva.file)
        
        if (imgNueva.esPrincipal) {
          urlPrincipal = urlNueva
        }
        
        await supabase
          .from("imagenes_producto")
          .insert({
            id_producto: producto.id,
            url: urlNueva,
            descripcion: `Imagen de ${formData.nombre}`,
            orden: imgNueva.esPrincipal ? 0 : imagenesExistentes.length + i + 1
          })
      }

      // 3. Actualizar orden de imágenes existentes si cambió la principal
      const principalExistente = imagenesExistentes.find(img => img.esPrincipal)
      if (principalExistente && principalExistente.id_imagen > 0) {
        urlPrincipal = principalExistente.url
        
        // Actualizar todas las imágenes existentes con nuevo orden
        for (let i = 0; i < imagenesExistentes.length; i++) {
          const img = imagenesExistentes[i]
          if (img.id_imagen > 0) {
            await supabase
              .from("imagenes_producto")
              .update({ orden: img.esPrincipal ? 0 : i + 1 })
              .eq("id_imagen", img.id_imagen)
          }
        }
      }

      // 4. Actualizar producto con la imagen principal
      const productoActualizado: Producto = {
        ...formData,
        precio: parseFloat(formData.precio),
        stock: parseInt(formData.stock),
        imagen: urlPrincipal
      }

      onSave(productoActualizado)

    } catch (error) {
      console.error("Error al actualizar producto:", error)
      alert("Error al actualizar el producto")
    } finally {
      setIsSubmitting(false)
    }
  }

  const todasLasImagenes = [
    ...imagenesExistentes.map((img, i) => ({ tipo: 'existente' as const, index: i, ...img })),
    ...imagenesNuevas.map((img, i) => ({ tipo: 'nueva' as const, index: i, url: img.preview, esPrincipal: img.esPrincipal }))
  ]

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">Editar Producto</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid gap-6 md:grid-cols-3">
            {/* Columna izquierda - Información básica */}
            <div className="md:col-span-2 space-y-4">
              <h3 className="font-semibold text-foreground border-b border-border pb-2">
                Información Básica
              </h3>
              
              <div className="grid gap-4 sm:grid-cols-2">
                {/* Campo Código - No editable */}
                <div className="space-y-2">
                  <Label htmlFor="codigo" className="flex items-center gap-2">
                    Código <Lock className="w-3 h-3 text-muted-foreground" />
                  </Label>
                  <div className="relative">
                    <Input
                      id="codigo"
                      name="codigo"
                      value={formData.codigo}
                      disabled
                      className="bg-muted/50 text-foreground font-bold cursor-not-allowed"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
                      No editable
                    </span>
                  </div>
                </div>
                
                {/* Campo Nombre - Editable */}
                <div className="space-y-2">
                  <Label htmlFor="nombre">
                    Nombre <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="nombre"
                    name="nombre"
                    value={formData.nombre}
                    onChange={handleInputChange}
                    required
                    className="bg-background text-foreground font-semibold"
                  />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                {/* Categoría */}
                <div className="space-y-2">
                  <Label htmlFor="categoria">
                    Categoría <span className="text-destructive">*</span>
                  </Label>
                  <Select
                    value={formData.categoria}
                    onValueChange={(value) => handleSelectChange("categoria", value)}
                    required
                  >
                    <SelectTrigger className="bg-background text-foreground font-semibold">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {categorias.map((cat: any) => (
                        <SelectItem key={cat.id_categoria} value={cat.id_categoria.toString()}>
                          {cat.nombre}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                {/* Precio */}
                <div className="space-y-2">
                  <Label htmlFor="precio">
                    Precio <span className="text-destructive">*</span>
                  </Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-semibold">
                      $
                    </span>
                    <Input
                      id="precio"
                      name="precio"
                      type="number"
                      step="0.01"
                      min="0"
                      value={formData.precio}
                      onChange={handleInputChange}
                      required
                      className="pl-7 bg-background text-foreground font-semibold"
                    />
                  </div>
                </div>
              </div>

              {/* Stock */}
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="stock">Stock</Label>
                  <Input
                    id="stock"
                    name="stock"
                    type="number"
                    min="0"
                    value={formData.stock}
                    onChange={handleInputChange}
                    className="bg-background text-foreground font-semibold"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="artesano">Artesano</Label>
                  <Select
                    value={formData.artesano}
                    onValueChange={(value) => handleSelectChange("artesano", value)}
                  >
                    <SelectTrigger className="bg-background text-foreground font-semibold">
                      <SelectValue placeholder="Seleccionar artesano" />
                    </SelectTrigger>
                    <SelectContent>
                      {artesanos.map((art: any) => (
                        <SelectItem key={art.id_artesano} value={art.id_artesano.toString()}>
                          {art.nombre} {art.apellido}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Descripción */}
              <div className="space-y-2">
                <Label htmlFor="descripcion">Descripción</Label>
                <Textarea
                  id="descripcion"
                  name="descripcion"
                  value={formData.descripcion}
                  onChange={handleInputChange}
                  rows={3}
                  className="bg-background text-foreground font-semibold resize-none"
                />
              </div>

              {/* Materiales y Técnica */}
              <h3 className="font-semibold text-foreground border-b border-border pb-2 pt-4">
                Detalles de Elaboración
              </h3>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="materiales">Materiales</Label>
                  <Input
                    id="materiales"
                    name="materiales"
                    value={formData.materiales}
                    onChange={handleInputChange}
                    className="bg-background text-foreground font-semibold"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="tecnica">Técnica</Label>
                  <Input
                    id="tecnica"
                    name="tecnica"
                    value={formData.tecnica}
                    onChange={handleInputChange}
                    className="bg-background text-foreground font-semibold"
                  />
                </div>
              </div>
            </div>

            {/* Columna derecha - Imágenes */}
            <div className="space-y-4">
              <h3 className="font-semibold text-foreground border-b border-border pb-2">
                Imágenes <span className="text-destructive">*</span>
              </h3>
              
              {/* Zona para agregar más imágenes */}
              <label
                htmlFor="nuevas-imagenes"
                className="flex flex-col items-center justify-center p-4 rounded-lg border-2 border-dashed border-border hover:border-primary/50 cursor-pointer transition-colors bg-muted/30"
              >
                <ImagePlus className="w-6 h-6 text-muted-foreground mb-1" />
                <span className="text-sm text-muted-foreground">Agregar imágenes</span>
                <input
                  id="nuevas-imagenes"
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleNuevasImagenes}
                  className="hidden"
                />
              </label>

              {/* Leyenda */}
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                <span>= Imagen principal</span>
              </div>

              {/* Grid de imágenes */}
              <div className="grid grid-cols-2 gap-2">
                {/* Imágenes existentes */}
                {imagenesExistentes.map((img, index) => (
                  <div
                    key={`existente-${index}`}
                    className={`relative aspect-square rounded-lg overflow-hidden border-2 ${
                      img.esPrincipal 
                        ? "border-amber-400 ring-2 ring-amber-400/30" 
                        : "border-border"
                    }`}
                  >
                    <img
                      src={img.url}
                      alt={`Imagen ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                    
                    {img.esPrincipal && (
                      <div className="absolute top-1 left-1 bg-amber-400 text-amber-900 text-[10px] px-1 py-0.5 rounded font-medium flex items-center gap-0.5">
                        <Star className="w-2.5 h-2.5 fill-current" />
                        Principal
                      </div>
                    )}

                    <div className="absolute top-1 right-1 flex gap-1">
                      {!img.esPrincipal && (
                        <button
                          type="button"
                          onClick={() => establecerPrincipalExistente(index)}
                          className="p-1 bg-background/80 rounded hover:bg-amber-100 transition-colors"
                          title="Establecer como principal"
                        >
                          <Star className="w-3 h-3 text-amber-600" />
                        </button>
                      )}
                      {imagenesExistentes.length + imagenesNuevas.length > 1 && (
                        <button
                          type="button"
                          onClick={() => eliminarImagenExistente(index)}
                          className="p-1 bg-background/80 rounded hover:bg-red-100 transition-colors"
                          title="Eliminar imagen"
                        >
                          <X className="w-3 h-3 text-red-600" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}

                {/* Imágenes nuevas */}
                {imagenesNuevas.map((img, index) => (
                  <div
                    key={`nueva-${index}`}
                    className={`relative aspect-square rounded-lg overflow-hidden border-2 ${
                      img.esPrincipal 
                        ? "border-amber-400 ring-2 ring-amber-400/30" 
                        : "border-border border-dashed"
                    }`}
                  >
                    <img
                      src={img.preview}
                      alt={`Nueva imagen ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                    
                    <div className="absolute bottom-1 left-1 bg-green-500 text-white text-[10px] px-1 py-0.5 rounded">
                      Nueva
                    </div>

                    {img.esPrincipal && (
                      <div className="absolute top-1 left-1 bg-amber-400 text-amber-900 text-[10px] px-1 py-0.5 rounded font-medium flex items-center gap-0.5">
                        <Star className="w-2.5 h-2.5 fill-current" />
                        Principal
                      </div>
                    )}

                    <div className="absolute top-1 right-1 flex gap-1">
                      {!img.esPrincipal && (
                        <button
                          type="button"
                          onClick={() => establecerPrincipalNueva(index)}
                          className="p-1 bg-background/80 rounded hover:bg-amber-100 transition-colors"
                          title="Establecer como principal"
                        >
                          <Star className="w-3 h-3 text-amber-600" />
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => eliminarImagenNueva(index)}
                        className="p-1 bg-background/80 rounded hover:bg-red-100 transition-colors"
                        title="Eliminar imagen"
                      >
                        <X className="w-3 h-3 text-red-600" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <p className="text-xs text-muted-foreground text-center">
                {imagenesExistentes.length + imagenesNuevas.length} imagen{(imagenesExistentes.length + imagenesNuevas.length) !== 1 ? "es" : ""}
              </p>
            </div>
          </div>

          {/* Botones de acción */}
          <div className="flex items-center justify-end gap-4 pt-6 border-t border-border">
            <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
              <X className="w-4 h-4 mr-2" />
              Cancelar
            </Button>
            <Button type="submit" className="bg-primary hover:bg-primary/90" disabled={isSubmitting}>
              {isSubmitting ? "Guardando..." : "Guardar Cambios"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
