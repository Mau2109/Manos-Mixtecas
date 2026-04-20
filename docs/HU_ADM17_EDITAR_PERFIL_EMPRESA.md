# HU ADM17 - Editar Perfil de Empresa

## Descripción
Como administrador del sistema, quiero modificar datos de empresa para mantener actualizada la información institucional del sistema.

## Criterios de Aceptación

### CA1: Campos Precargados
- **Dado**: Un administrador accede a la página de editar perfil de empresa
- **Cuando**: Se carga la página
- **Entonces**: 
  - Todos los campos se cargan automáticamente con la información actual de la base de datos
  - La vista previa del logo muestra la imagen actual
  - Los campos con valores se muestran completos
- **Status**: ✅ PASADO

### CA2: RFC No Editable
- **Dado**: Un formulario de edición de perfil empresa
- **Cuando**: Se intenta modificar el campo RFC
- **Entonces**:
  - El campo RFC está deshabilitado (no editable)
  - Aparece un mensaje: "Este campo no puede ser modificado por razones de seguridad contable"
  - El RFC se mantiene sin cambios aunque se modifiquen otros campos
- **Justificación**: Seguridad contable y compliance fiscal
- **Status**: ✅ PASADO

### CA3: Reemplazo de Logotipo
- **Dado**: Un formulario de edición con logotipo actual
- **Cuando**: Se hace clic en "Actualizar Logotipo" y se selecciona una imagen nueva
- **Entonces**:
  - Se carga la imagen nueva en el preview
  - Se sube la nueva imagen a Supabase Storage (bucket: empresa)
  - Se actualiza la URL del logo en la base de datos
- **Formatos Permitidos**: JPG, PNG
- **Tamaño Máximo**: 5MB
- **Status**: ✅ PASADO

### CA4: Validación de Campos Obligatorios
- **Dado**: Un formulario con cambios
- **Cuando**: Se hace clic en "Actualizar Datos"
- **Entonces**:
  - Sistema valida que el nombre no esté vacío
  - Si hay errores, muestra mensajes específicos
  - Si es válido, procede a actualizar
- **Campos Obligatorios**: Nombre de Empresa
- **Status**: ✅ PASADO

### CA5: Mensaje de Confirmación
- **Dado**: Un formulario válido con cambios
- **Cuando**: Se hace clic en "Actualizar Datos" y se guarda exitosamente
- **Entonces**:
  - Se muestra alert de éxito: "Datos actualizados correctamente"
  - Toast de notificación confirma la acción
  - Los datos se refrescan en la página
- **Status**: ✅ PASADO

## Ubicación del Código

### Página Frontend
- **Ruta**: `/app/admin/perfil_empresa/editar_perfil/page.tsx`
- **Componente**: Formulario React con precarga de datos

### Servicios
- **Service**: `/lib/services/empresaService.ts` 
  - Función: `actualizarEmpresa(idEmpresa, empresa)`
  
- **Repository**: `/lib/persistence/repositories/empresaRepository.ts`
  - Función: `actualizarEmpresaDb(idEmpresa, empresa)`

### Tests
- **Ubicación**: `/__tests__/empresa.test.ts`
- **Suite**: ADM17 - Editar perfil empresa
- **Total de Tests**: 7 (Todos pasando ✅)

## Diseño UX/UI

### Layout
```
┌─────────────────────────────────────────────────┐
│ Breadcrumb: AJUSTES / PERFIL DE EMPRESA        │
├─────────────────────────────────────────────────┤
│ Titulo: "Editar Perfil de Empresa"             │
├─────────────────────────────────────────────────┤
│ INFORMACIÓN GENERAL   │  LOGOTIPO INSTITUCIONAL│
│ - Nombre (edit)       │  [Imagen Preview]      │
│ - RFC (no editable)   │  [Actualizar Button]   │
│ - Dirección (edit)    │  Info additional       │
│ - Teléfono (edit)     │                        │
│ - Email (edit)        │                        │
├─────────────────────────────────────────────────┤
│ [Cancelar Cambios]  [Actualizar Datos]        │
└─────────────────────────────────────────────────┘
```

### Colores (Referencia del Diseño)
- Botón Actualizar: Marrón/Amber-700
- Botón Cancelar: Outline
- Background: Gris claro
- RFC Input: Gris deshabilitado

### Estados del Botón Actualizar
- **Deshabilitado**: Si no hay cambios en el formulario
- **Habilitado**: Si hay cambios válidos
- **Loading**: Mientras se guarda (muestra spinner)

## Flujo de Datos

```
1. Usuario entra en /admin/perfil_empresa/editar_perfil
   ↓
2. useEffect dispara obtenerEmpresa()
   ↓
3. Service llama a obtenerEmpresaDb() 
   ↓
4. Datos se cargan en los inputs
   ↓
5. Usuario modifica campos (excepto RFC)
   ↓
6. setFormModificado(true) - habilita botón
   ↓
7. Usuario hace clic en "Actualizar Datos"
   ↓
8. handleActualizar() valida formulario
   ↓
9. Si hay nuevo logo:
   - subirLogoAStorage() → Supabase Storage
   - Obtiene URL pública
   ↓
10. actualizarEmpresa(idEmpresa, datos)
    ↓
11. Service valida ID
    ↓
12. Repository actualiza en BD
    ↓
13. Muestra toast de éxito
    ↓
14. Recarga la página después de 2 segundos
```

## Validaciones Aplicadas

### Frontend (React)
- Nombre: No vacío (cuando se intenta guardar)
- Email: Validación de formato (opcional)
- RFC: Campo deshabilitado completamente
- Logo: Tipo (imagen), Tamaño (máx 5MB)

### Backend (Service)
- ID: Validación de que exista
- Datos: Se acepta actualización parcial

## Campos Modificables

| Campo | Tipo | Obligatorio | Editable |
|-------|------|------------|----------|
| Nombre | Text | ✅ | ✅ |
| RFC | Text | ✅ | ❌ |
| Dirección | Textarea | ❌ | ✅ |
| Teléfono | Tel | ❌ | ✅ |
| Email | Email | ❌ | ✅ |
| Logo | File | ❌ | ✅ |

## Comportamientos Especiales

### Cancelar Cambios
- Si hay cambios sin guardar: Pide confirmación
- Si no hay cambios: Regresa directamente

### Actualizar Logo
- Abre file picker al hacer clic en botón
- Solo acepta imágenes
- Muestra preview inmediatamente tras seleccionar
- Se sube a Storage cuando se guarda

### Recarga Post-Actualización
- Después de 2 segundos de éxito, recarga la página
- Esto asegura que los datos mostrados sean frescos

## Testing

### Ejecución de Tests
```bash
npm test -- __tests__/empresa.test.ts --testNamePattern="ADM17"
```

### Resultados
```
✓ CA1: Campos precargados con información actual
✓ CA2: RFC no es editable (protegido)
✓ CA3: Permite reemplazar logotipo
✓ CA4: Valida ID de empresa antes de actualizar
✓ CA4: Permite actualizar campos válidos
✓ CA5: Muestra mensaje de confirmación
✓ CA1-5: Flujo completo (cargar, modificar, guardar)
```

## Integración con ADM16 y ADM18

- **ADM16**: Agregar nuevo perfil
- **ADM17**: Editar perfil existente (ESTA HU)
- **ADM18**: Visualizar perfil

Las tres HUs forman el CRUD completo de Perfil de Empresa con navegación entre ellas mediante topbar.

## Campos de la Tabla `empresa` (Relevantes)

```sql
id_empresa        | SERIAL PRIMARY KEY
nombre            | VARCHAR(255) NOT NULL
rfc               | VARCHAR(13) NOT NULL (sin cambios)
logo_url          | VARCHAR(500)
direccion         | TEXT
telefono          | VARCHAR(20)
email             | VARCHAR(255)
updated_at        | TIMESTAMP DEFAULT NOW()
```

## APIs Externas Usadas
- **Supabase**: 
  - Base de datos (tabla empresa - UPDATE)
  - Storage (bucket empresa - UPDATE archivo)

## Dependencias
- `react`: Hooks (useState, useEffect)
- `next/navigation`: useRouter, Link
- `lucide-react`: Iconos
- `sonner`: Toast notifications
- Componentes shadcn/ui: Button, Input, Textarea, Label

## Notas Importantes

1. **RFC Protegido**: No se puede editar por razones de compliance fiscal
2. **Logo Opcional**: Se puede dejar sin logo o actualizarlo
3. **Actualización Parcial**: No necesita llenar todos los campos
4. **Confirmación**: Hay confirmación visual y toast
5. **Recarga**: Página se recarga for asegurar datos frescos

---

**Última actualización**: 18 de abril de 2026  
**Estado**: ✅ IMPLEMENTADO Y APROBADO  
**Versión**: 1.0
