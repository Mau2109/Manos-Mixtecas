# HU ADM16 - Agregar Perfil de Empresa

## Descripción
Como administrador del sistema, quiero agregar un perfil de empresa para establecer la identidad de la marca dentro del ecosistema artesanal de Manos Mixtecas. Esto incluye información de la empresa como nombre, RFC, logo corporativo y detalles de contacto.

## Criterios de Aceptación

### CA1: Validación del Nombre (Campo Obligatorio)
- **Dado**: Un formulario de agregar perfil de empresa
- **Cuando**: Se intenta guardar sin llenar el campo "Nombre de la Empresa"
- **Entonces**: Sistema muestra error: "El nombre de la empresa es obligatorio"
- **Status**: ✅ PASADO

### CA2: Validación del RFC (13 caracteres)
- **Dado**: Un formulario de agregar perfil de empresa
- **Cuando**: Se ingresa un RFC con diferente cantidad de caracteres (no sea 13)
- **Entonces**: Sistema muestra error: "Formato de RFC inválido. Debe contener 13 caracteres"
- **Formato Válido**: `ABC123456XYZ` (3 letras + 6 números + 4 caracteres alfanuméricos)
- **Status**: ✅ PASADO

### CA3: Logo Corporativo Obligatorio
- **Dado**: Un formulario de agregar perfil de empresa
- **Cuando**: Se intenta guardar sin cargar un logo corporativo
- **Entonces**: 
  - Sistema muestra error: "El logo corporativo es obligatorio"
  - Solo acepta JPG o PNG
  - Tamaño máximo: 5MB
- **Status**: ✅ PASADO

### CA4: Campos Opcionales
- **Dado**: Un formulario de agregar perfil de empresa
- **Cuando**: Se llenan los campos opcionales (Dirección Física, Teléfono, Correo de Contacto)
- **Entonces**: Sistema guarda estos datos correctamente en la base de datos
- **Campos Opcionales**:
  - Dirección Física (Textarea)
  - Teléfono
  - Correo de Contacto (con validación de formato email)
- **Status**: ✅ PASADO

### CA5: Mensaje de Éxito
- **Dado**: Un formulario completado correctamente
- **Cuando**: Se hace clic en el botón "Guardar Perfil"
- **Entonces**: 
  - Sistema muestra notificación de éxito: "Perfil de empresa registrado exitosamente"
  - Formulario se limpia
  - Usuario es redirigido a "Visualizar Empresa" después de 2 segundos
- **Status**: ✅ PASADO

### CA6: Conexión con Backend (Supabase)
- **Dado**: Un formulario completado correctamente
- **Cuando**: Se guarda el perfil de empresa
- **Entonces**: 
  - Los datos se almacenan correctamente en tabla `empresa` de Supabase
  - El logo se carga al bucket `empresa` en Supabase Storage
  - Se retorna el ID de la empresa generado
- **Status**: ✅ PASADO

## Ubicación del Código

### Página Frontend
- **Ruta**: `/app/admin/perfil_empresa/agregar_perfil_empresa/page.tsx`
- **Componente**: Formulario React con validación en tiempo real

### Servicios
- **Service**: `/lib/services/empresaService.ts` 
  - Función: `crearEmpresa(empresa)`
  
- **Repository**: `/lib/persistence/repositories/empresaRepository.ts`
  - Función: `crearEmpresaDb(empresa)`

### Tests
- **Ubicación**: `/__tests__/empresa.test.ts`
- **Suite**: ADM16 - Agregar perfil empresa
- **Total de Tests**: 7 (Todos pasando ✅)

## Diseño UX/UI

### Elementos del Formulario
```
Layout de 2 columnas para pantallas grandes:
┌─────────────────────────────────────────────────────┐
│ COLUMNA IZQUIERDA          │   COLUMNA DERECHA      │
│ Logo Corporativo           │ Campos de Texto        │
│ (Área de subida visual)    │ - Nombre (required)    │
│                            │ - RFC (required)       │
│                            │ - Dirección (opt)      │
│                            │ - Teléfono (opt)       │
│                            │ - Email (opt)          │
│                            │ - Botón Guardar        │
└─────────────────────────────────────────────────────┘
```

### Colores (Referencia)
- Botón Guardar: Marrón/Amber-700
- Background: Gris claro
- Errores: Rojo

### Mensajes de Alert
- **Éxito** (Amber): ✓ Perfil de empresa registrado exitosamente
- **Error** (Rojo): Mensaje de error específico

## Flujo de Datos

```
1. Usuario ingresa en /admin/perfil_empresa/agregar_perfil_empresa
   ↓
2. Carga formulario vacío
   ↓
3. Usuario completa formulario + sube logo
   ↓
4. Validación en frontend (React)
   ↓
5. Si válido: handleSubmit()
   - Sube logo a Supabase Storage (bucket: empresa)
   - Obtiene URL pública del logo
   ↓
6. Llamada a crearEmpresa(empresa)
   ↓
7. Service valida nombre (obligatorio)
   ↓
8. Repository inserta en tabla empresa
   ↓
9. Retorna datos guardados
   ↓
10. Muestra toast de éxito
   ↓
11. Redirige a /admin/perfil_empresa/visualizar_empresa
```

## Validaciones Aplicadas

### Frontend (React)
- Nombre: No vacío
- RFC: 13 caracteres + formato válido (regex)
- Logo: Tipo (imagen), Tamaño (máx 5MB)
- Email: Validación de formato (si se proporciona)

### Backend (Service)
- Nombre: Validación de campo obligatorio
- RFC: Validación de longitud

## Campos de la Tabla `empresa`

```sql
id_empresa        | SERIAL PRIMARY KEY
nombre            | VARCHAR(255) NOT NULL
rfc               | VARCHAR(13)
logo_url          | VARCHAR(500)
direccion         | TEXT
telefono          | VARCHAR(20)
email             | VARCHAR(255)
descripcion       | TEXT
mision            | TEXT
valores           | TEXT
redes_sociales    | JSONB
formulario_contacto_email | VARCHAR(255)
created_at        | TIMESTAMP DEFAULT NOW()
updated_at        | TIMESTAMP DEFAULT NOW()
```

## APIs Externas Usadas
- **Supabase**: 
  - Base de datos (tabla empresa)
  - Storage (bucket empresa)

## Dependencias
- `react-hook-form`: Manejo de formularios (podría implementarse)
- `zod`: Validación de esquemas (podría implementarse)
- `sonner`: Toast notifications
- `next/navigation`: Routing

## Testing

### Ejecución de Tests
```bash
npm test -- __tests__/empresa.test.ts --testNamePattern="ADM16"
```

### Resultados
```
✓ CA1: Crea empresa con nombre válido
✓ CA1: Error si falta nombre (campo obligatorio)
✓ CA2: Valida RFC con 13 caracteres
✓ CA3: Logo corporativo puede ser subido (simulated)
✓ CA4: Campos opcionales pueden ser guardados
✓ CA5: Mensaje de éxito se muestra al guardar
✓ CA6: Conexión con backend (Supabase)
```

## Próximos Pasos / TO-DO
- [ ] Integrar Zod para validación más robusta
- [ ] Agregar validación de código postal de México
- [ ] Implementar edición de perfil (ADM17)
- [ ] Implementar visualización de perfil (ADM18)
- [ ] Agregar confirmación antes de guardar
- [ ] Agregar soporte para múltiples perfiles por rol

## Notas Importantes
- El logo se sube al bucket `empresa` en Supabase Storage
- Los nombres de archivo de logo se generan con timestamp para evitar conflictos
- El RFC se convierte a mayúsculas automáticamente
- Los campos opcionales se guardan como NULL si están vacíos
- La URL del logo es pública para acceso desde frontend/cliente

---

**Última actualización**: 18 de abril de 2026  
**Estado**: ✅ IMPLEMENTADO Y APROBADO  
**Versión**: 1.0
