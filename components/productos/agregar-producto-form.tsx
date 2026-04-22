"use client"

import { useEffect } from "react";
import { obtenerCategorias } from "@/lib/services/productoService";
import { obtenerArtesanos } from "@/lib/services/artesanoService";
import { crearProducto } from "@/lib/services/productoService"
import { supabase } from "@/lib/supabaseClient";
import { useState } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, Upload, X } from "lucide-react"
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

interface FormData {
  codigo: string
  nombre: string
  descripcion: string
  precio: string
  materiales: string
  tecnica: string
  categoria: string
  artesano: string
  imagen: File | null
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
    imagen: null,
  })
  const [categorias, setCategorias] = useState<any[]>([]);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [artesanos, setArtesanos] = useState<any[]>([]);

  useEffect(() => {
    obtenerArtesanos().then(setArtesanos);
  }, []);

  useEffect(() => {
    const cargarCategorias = async () => {
      try {
        const data = await obtenerCategorias();
        setCategorias(data);
      } catch (error) {
        console.error("Error cargando categorías:", error);
      }
    };

    cargarCategorias();
  }, []);

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
      setFormData((prev) => ({ ...prev, imagen: file }))
      const url = URL.createObjectURL(file)
      setPreviewUrl(url)
    }
  }

  const removeImage = () => {
    setFormData((prev) => ({ ...prev, imagen: null }))
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl)
      setPreviewUrl(null)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();

  try {

    let imageUrl = "";

    if (formData.imagen) {
      const fileName = Date.now() + "_" + formData.imagen.name;

      const { data, error } = await supabase.storage
        .from("productos") // bucket
        .upload(fileName, formData.imagen);

      if (error) throw error;

      const { data: publicUrl } = supabase.storage
        .from("productos")
        .getPublicUrl(fileName);

      imageUrl = publicUrl.publicUrl;
    }

    await crearProducto({
      nombre: formData.nombre,
      descripcion: formData.descripcion,
      precio: Number(formData.precio),
      stock: 0,
      id_categoria: Number(formData.categoria),
      id_artesano: Number(formData.artesano) || null,
      materiales: formData.materiales,
      tecnica: formData.tecnica,
      imagen: imageUrl
    });

    alert("Producto creado correctamente");

  } catch (error) {
    console.error(error);
  }
};

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
        <Button
          variant="outline"
          onClick={() => router.push("/inventario")}
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

          {/* Imagen del producto */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">
                Imagen <span className="text-destructive">*</span>
              </CardTitle>
              <CardDescription>Foto del producto artesanal</CardDescription>
            </CardHeader>
            <CardContent>
              {previewUrl ? (
                <div className="relative aspect-square rounded-lg overflow-hidden border border-border">
                  <img
                    src={previewUrl}
                    alt="Vista previa"
                    className="w-full h-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={removeImage}
                    className="absolute top-2 right-2 p-1.5 bg-background/80 rounded-full hover:bg-background transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <label
                  htmlFor="imagen"
                  className="flex flex-col items-center justify-center aspect-square rounded-lg border-2 border-dashed border-border hover:border-primary/50 cursor-pointer transition-colors bg-muted/30"
                >
                  <Upload className="w-10 h-10 text-muted-foreground mb-2" />
                  <span className="text-sm text-muted-foreground text-center px-4">
                    Clic para subir imagen (obligatorio)
                  </span>
                  <input
                    id="imagen"
                    name="imagen"
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                    required
                  />
                </label>
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
                <SelectContent>
                  {artesanos.map((art: any) => (
                    <SelectItem key={art.id_artesano} value={art.id_artesano.toString()}>
                      {art.nombre} {art.apellido}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </CardContent>
          </Card>
        </div>

        {/* Botones de acción */}
        <div className="flex items-center gap-4 mt-6 pt-6 border-t border-border">
          <Button type="submit" className="bg-primary hover:bg-primary/90">
            Guardar Producto
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push("/inventario")}
          >
            Cancelar
          </Button>
        </div>
      </form>
    </div>
  )
}
