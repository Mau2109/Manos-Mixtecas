📦 Manos Mixtecas – Proyecto Next.js con Supabase y Pruebas

Este proyecto corresponde al sistema Manos Mixtecas, desarrollado con Next.js, Supabase y Jest, incluyendo pruebas unitarias y una prueba de integración real con la base de datos.

🧰 Requisitos previos

Antes de ejecutar el proyecto, asegúrate de tener instalado:

1️⃣ Node.js (obligatorio)

Versión recomendada: LTS

Descargar desde: https://nodejs.org

Verificar instalación:

node -v
npm -v

2️⃣ Git (opcional pero recomendado)

Descargar desde: https://git-scm.com

Verificar:

git --version

🚀 Clonar el proyecto
git clone <URL_DEL_REPOSITORIO>
cd manos-mixtecas

📥 Instalar dependencias

Ejecutar una sola vez:

npm install


Esto instala:

Next.js

Supabase SDK

Jest

ts-jest

Testing Library

dotenv

🔐 Variables de entorno (Supabase)

Crear un archivo llamado .env.local en la raíz del proyecto:

NEXT_PUBLIC_SUPABASE_URL=https://TU_PROYECTO.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=TU_CLAVE_PUBLICA


📌 Estas variables son necesarias para:

Ejecutar la app

Ejecutar la prueba de integración con Supabase
Instalar Supabase SDK

(Necesario para conexión real y pruebas de integración)

npm install @supabase/supabase-js

3️⃣ Instalar Jest y soporte para TypeScript

(Pruebas unitarias)

npm install --save-dev jest ts-jest @types/jest


Esto permite:

Ejecutar test, expect

Probar archivos .ts

4️⃣ Instalar entorno jsdom para Jest

(Necesario desde Jest 28)

npm install --save-dev jest-environment-jsdom

▶️ Ejecutar pruebas
Pruebas unitarias
npx jest