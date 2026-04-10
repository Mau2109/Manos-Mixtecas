"use client"

import { useState } from "react"
import { X, Upload, Lock } from "lucide-react"
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
import type { Producto } from "./inventario-list"

const categorias = [
  "Textiles",
  "Cerámica",
  "Madera",
  "Joyería",
  "Barro Negro",
  "Vidrio Soplado",
  "Bordados",
  "Talabartería",
]

const artesanos = [
  "María García",
  "Juan Pérez",
  "Elena Cruz",
  "Mateo Rodríguez",
  "Ana López",
]

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
  const [previewUrl, setPreviewUrl] = useState<string>(producto.imagen)

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const url = URL.createObjectURL(file)
      setPreviewUrl(url)
      setFormData((prev) => ({ ...prev, imagen: url }))
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave({
      ...formData,
      precio: parseFloat(formData.precio),
      stock: parseInt(formData.stock),
    })
  }

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
                      {categorias.map((cat) => (
                        <SelectItem key={cat} value={cat}>
                          {cat}
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
                      {artesanos.map((art) => (
                        <SelectItem key={art} value={art}>
                          {art}
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

            {/* Columna derecha - Imagen */}
            <div className="space-y-4">
              <h3 className="font-semibold text-foreground border-b border-border pb-2">
                Imagen <span className="text-destructive">*</span>
              </h3>
              
              <div className="relative aspect-square rounded-lg overflow-hidden border border-border bg-muted">
                <img
                  src={previewUrl}
                  alt={formData.nombre}
                  className="w-full h-full object-cover"
                />
                <label
                  htmlFor="imagen-edit"
                  className="absolute inset-0 flex flex-col items-center justify-center bg-black/50 opacity-0 hover:opacity-100 transition-opacity cursor-pointer"
                >
                  <Upload className="w-8 h-8 text-white mb-2" />
                  <span className="text-white text-sm font-medium">Cambiar imagen</span>
                  <input
                    id="imagen-edit"
                    name="imagen"
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                </label>
              </div>
              <p className="text-xs text-muted-foreground text-center">
                Haz clic en la imagen para cambiarla
              </p>
            </div>
          </div>

          {/* Botones de acción */}
          <div className="flex items-center justify-end gap-4 pt-6 border-t border-border">
            <Button type="button" variant="outline" onClick={onClose}>
              <X className="w-4 h-4 mr-2" />
              Cancelar
            </Button>
            <Button type="submit" className="bg-primary hover:bg-primary/90">
              Guardar Cambios
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
