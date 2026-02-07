📦 Manos Mixtecas – Proyecto Next.js con Supabase y Pruebas
Este proyecto corresponde al sistema Manos Mixtecas, desarrollado con Next.js, Supabase y Jest, incluyendo pruebas unitarias y una prueba de integración real con la base de datos.

🧰 Requisitos previos
Antes de ejecutar el proyecto, asegúrate de tener instalado:
1️⃣ Node.js (obligatorio)

Versión recomendada: LTS
Descargar desde: https://nodejs.org

Verificar instalación:
bashnode -v
npm -v
2️⃣ Git (opcional pero recomendado)

Descargar desde: https://git-scm.com

Verificar:
bashgit --version

🚀 Clonar el proyecto
bashgit clone <URL_DEL_REPOSITORIO>
cd manos-mixtecas

📥 Instalar dependencias
Ejecutar una sola vez:
bashnpm install
Esto instala:

Next.js
Supabase SDK
Jest
ts-jest
Testing Library
dotenv


🔐 Variables de entorno (Supabase)
Crear un archivo llamado .env.local en la raíz del proyecto:
envNEXT_PUBLIC_SUPABASE_URL=https://TU_PROYECTO.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=TU_CLAVE_PUBLICA
📌 Estas variables son necesarias para:

Ejecutar la app
Ejecutar la prueba de integración con Supabase


🛠️ Instalación de dependencias adicionales
Instalar Supabase SDK
(Necesario para conexión real y pruebas de integración)
bashnpm install @supabase/supabase-js
Instalar Jest y soporte para TypeScript
(Pruebas unitarias)
bashnpm install --save-dev jest ts-jest @types/jest
Esto permite:

Ejecutar test, expect
Probar archivos .ts

Instalar entorno jsdom para Jest
(Necesario desde Jest 28)
bashnpm install --save-dev jest-environment-jsdom

▶️ Ejecutar pruebas
Pruebas unitarias
bashnpx jest
Ejecutar todas las pruebas
bashnpm test
Ejecutar pruebas en modo watch
bashnpm test -- --watch

🏃 Ejecutar el proyecto en desarrollo
bashnpm run dev
```

El proyecto estará disponible en: [http://localhost:3000](http://localhost:3000)

---

## 📂 Estructura del proyecto
```
manos-mixtecas/
├── __tests__/          # Pruebas unitarias e integración
├── components/         # Componentes de React
├── pages/             # Páginas de Next.js
├── lib/               # Utilidades y configuraciones
├── public/            # Archivos estáticos
├── .env.local         # Variables de entorno (no subir a Git)
├── jest.config.js     # Configuración de Jest
├── package.json       # Dependencias del proyecto
└── README.md          # Este archivo

🤝 Contribuir

Fork el proyecto
Crea una rama para tu feature (git checkout -b feature/nueva-funcionalidad)
Commit tus cambios (git commit -m 'Agregar nueva funcionalidad')
Push a la rama (git push origin feature/nueva-funcionalidad)
Abre un Pull Request


📄 Licencia
Este proyecto está bajo la Licencia MIT.

📧 Contacto
Para cualquier duda o sugerencia, contacta al equipo de desarrollo.