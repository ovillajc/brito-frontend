# Transportes Brito - Web Platform (Brito Webapp)

Plataforma web integral para la gestión operativa y administrativa de **Transportes Brito**, construida con tecnologías modernas y orientada al rendimiento, escalabilidad y soporte offline (PWA).

## 🚀 Tecnologías y Stack Principal

- **Framework**: [Next.js](https://nextjs.org) (App Router, React 19)
- **Estilos e UI**: [Tailwind CSS v4](https://tailwindcss.com), [Radix UI](https://www.radix-ui.com) (componentes accesibles), [Framer Motion](https://www.framer.com/motion/) (animaciones).
- **Backend & Autenticación**: [Supabase](https://supabase.com) (PostgreSQL, Auth, Storage).
- **Gestión de Estado y Datos**: [React Query](https://tanstack.com/query/latest) para sincronización con servidor, [Zustand](https://zustand-demo.pmnd.rs/) para estado local.
- **Formularios**: [React Hook Form](https://react-hook-form.com/) + [Zod](https://zod.dev/) para validación.
- **Offline & Local Storage**: [Dexie.js](https://dexie.org/) (IndexedDB wrapper) y soporte PWA (`next-pwa`).
- **Otras integraciones**: `@google/genai` (Inteligencia Artificial con Gemini), Recharts (Gráficos), y S3 (AWS SDK).

## 📂 Arquitectura del Proyecto

El proyecto sigue un enfoque modular basado en **Clean Architecture** organizado por funcionalidades (Feature-Sliced Design simplificado), ubicado principalmente dentro del directorio `src/`.

### Estructura de `src/`

- **`core/`**: Infraestructura base, capa de dominio global, componentes compartidos de presentación y utilidades comunes (`lib/`).
- **`features/`**: Contiene la lógica de negocio aislada por dominio. Cada carpeta incluye su propia presentación, infraestructura y dominio.
  - `auth`: Autenticación y gestión de sesiones.
  - `bi`: Inteligencia de negocio y reportes (Dashboards/Recharts).
  - `company-profile`: Perfil de la empresa y configuración.
  - `dashboard`: Panel principal de resumen.
  - `expenses`: Control y registro de viáticos/gastos.
  - `fleet`: Gestión de unidades y flotilla.
  - `fuel`: Administración de cargas y consumos de combustible.
  - `hr`: Recursos Humanos y operadores.
  - `maintenance`: Mantenimientos preventivos/correctivos e inspecciones.
  - `trips`: Control de viajes, asignaciones y liquidaciones.
  - `users`: Administración del sistema y permisos.
- **`types/`**: Definiciones de tipos globales de TypeScript.

## 🛠 Instalación y Uso Local

Asegúrate de tener instalado [Node.js](https://nodejs.org/) (versión 20+) y `pnpm` o `npm`.

1. **Instalar dependencias**:
   ```bash
   pnpm install
   ```

2. **Configuración de Variables de Entorno**:
   Crea un archivo `.env.local` en la raíz (puedes basarte en las variables de tu proyecto de Supabase):
   ```env
   NEXT_PUBLIC_SUPABASE_URL=tu_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_supabase_anon_key
   ```

3. **Ejecutar el servidor de desarrollo**:
   ```bash
   pnpm dev
   ```

4. **Acceder a la app**:
   Abre [http://localhost:3000](http://localhost:3000) en tu navegador.

## 🧪 Pruebas y Linting

El proyecto cuenta con configuración de pruebas unitarias y de interfaz usando **Vitest** y **React Testing Library**.

- Ejecutar pruebas: `pnpm test`
- Modo watch (desarrollo): `pnpm test:watch`
- Ver la cobertura: `pnpm test:coverage`
- Interfaz gráfica de Vitest: `pnpm test:ui`

Para el análisis de código:
- Linting: `pnpm lint`

## ⚙️ Base de Datos

La base de datos está construida sobre PostgreSQL mediante Supabase. Todas las migraciones y esquemas se encuentran controlados localmente en la carpeta `supabase/migrations/` o mantenidos mediante la interfaz/CLI de Supabase.
