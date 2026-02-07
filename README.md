# 📦 Manos Mixtecas – Proyecto Next.js con Supabase y Pruebas

Este proyecto corresponde al sistema **Manos Mixtecas**, desarrollado con **Next.js**, **Supabase** y **Jest**, incluyendo pruebas unitarias y una prueba de integración real con la base de datos.

---

## 🧰 Requisitos previos

Antes de ejecutar el proyecto, asegúrate de tener instalado:

### 1️⃣ Node.js (obligatorio)

- **Versión recomendada:** LTS
- **Descargar desde:** [https://nodejs.org](https://nodejs.org)

**Verificar instalación:**

```bash
node -v
npm -v
```

### 2️⃣ Git (opcional pero recomendado)

- **Descargar desde:** [https://git-scm.com](https://git-scm.com)

**Verificar:**

```bash
git --version
```

---

## 🚀 Clonar el proyecto

```bash
git clone <URL_DEL_REPOSITORIO>
cd manos-mixtecas
```

---

## 📥 Instalar dependencias

Ejecutar **una sola vez**:

```bash
npm install
```

Esto instala:

- Next.js
- Supabase SDK
- Jest
- ts-jest
- Testing Library
- dotenv

---

## 🔐 Variables de entorno (Supabase)

Crear un archivo llamado `.env.local` en la raíz del proyecto:

```env
NEXT_PUBLIC_SUPABASE_URL=https://TU_PROYECTO.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=TU_CLAVE_PUBLICA
```

📌 **Estas variables son necesarias para:**

- Ejecutar la app
- Ejecutar la prueba de integración con Supabase

---

## 🛠️ Instalación de dependencias adicionales

### Instalar Supabase SDK

(Necesario para conexión real y pruebas de integración)

```bash
npm install @supabase/supabase-js
```

### Instalar Jest y soporte para TypeScript

(Pruebas unitarias)

```bash
npm install --save-dev jest ts-jest @types/jest
```

Esto permite:

- Ejecutar `test`, `expect`
- Probar archivos `.ts`

### Instalar entorno jsdom para Jest

(Necesario desde Jest 28)

```bash
npm install --save-dev jest-environment-jsdom
```

---

## ▶️ Ejecutar pruebas

### Pruebas unitarias

```bash
npx jest
```

### Ejecutar todas las pruebas

```bash
npm test
```

### Ejecutar pruebas en modo watch

```bash
npm test -- --watch
```

---

## 🏃 Ejecutar el proyecto en desarrollo

```bash
npm run dev
```

El proyecto estará disponible en: [http://localhost:3000](http://localhost:3000)


---

## 🤝 Contribuir

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/nueva-funcionalidad`)
3. Commit tus cambios (`git commit -m 'Agregar nueva funcionalidad'`)
4. Push a la rama (`git push origin feature/nueva-funcionalidad`)
5. Abre un Pull Request

---

## 📄 Licencia

Este proyecto está bajo la Licencia MIT.

---

## 📧 Contacto

Para cualquier duda o sugerencia, contacta al equipo de desarrollo.