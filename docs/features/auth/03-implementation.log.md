# Implementation Log - Módulo Auth

## [2026-04-05] - Estabilización de la Feature de Login

### Tarea 1: Estructura de Capas
- Se crearon los directorios siguiendo Clean Architecture: `domain`, `application`, `infraestructure`, `presentation`.
- Decisión: Mantener nombres en inglés para consistencia técnica a pesar de la documentación en español.

### Tarea 2: Definición del Dominio
- Creada `UserEntity` para representar al usuario en el sistema.
- Creada interfaz `IAuthRepository` para invertir la dependencia con Supabase.
- Creado `loginSchema` con Zod para validaciones centralizadas.

### Tarea 3: Caso de Uso e Infraestructura
- Implementado `LoginWithEmailUseCase` usando el patrón `Either`. Esto permite un manejo de errores funcional y tipado.
- Implementado `SupabaseAuthRepository` utilizando `@supabase/ssr`.
- Implementado `AuthMapper` para desacoplar el dominio del DTO de Supabase.

### Tarea 4: Capa de Presentación
- Implementado `AuthStore` con Zustand. Se aplicó el middleware `persist` para mantener la sesión en el cliente.
- Creado hook `useLogin` para desacoplar la lógica React Hook Form de los componentes.
- Desarrollados componentes `LoginLeftPanel` (Branding) y `LoginForm` (UI interactiva).
- Nota: Se adaptó el diseño de la imagen a los colores corporativos de Brito.

### Tarea 5: Estabilización de Tests
- Se detectó error `TypeError: ... is not a constructor` en Vitest debido a mocks mal definidos para `IntersectionObserver` y `ResizeObserver`.
- Corrección: Se refactorizó `vitest.setup.ts` para usar clases en lugar de mocks simples.
- Resultado: 19/19 tests pasados.

### Tarea 7: Estabilización de Tipos y UI (Final)
- Se resolvieron errores de TypeScript en `LoginForm.tsx` y `use-login.ts` mediante aserciones de tipo seguras para la integración con `react-hook-form` y los componentes de `shadcn/ui`.
- Se corrigieron atributos `className` duplicados en `LoginLeftPanel.tsx`.
- Se actualizó la sintaxis de gradientes de Tailwind de la versión antigua a la moderna (`bg-linear-to-*`).
- Se verificó la consistencia de `UserEntity` (usando `name` como campo estándar).

### Tarea 8: Verificación Final
- Todos los tests unitarios (dominio, aplicación, infraestructura y stores) pasan correctamente.
- La UI es responsiva y cumple con los lineamientos de diseño premium solicitados.

### Tarea 9: Rediseño del UI de Login basado en prototipo Stitch
- Mapeadas y reestructuradas las variables de color globales integrándolas a `Tailwind v4` vía `@theme inline` en `app/globals.css`.
- Intercambio de tipografías hacia `Manrope` (titulares) e `Inter` (párrafos) usando `next/font/google`.
- Eliminación de opciones de Social Login priorizando diseño 100% fiel al prototipo de Stitch.
- Incorporación de `Material Symbols Outlined` nativo para UI Elements, e integración del layout a 2 columnas con la imagen optimizada (vía `assets/images/hero-login.jpeg`).
- Corrección del bug de inferencia entre `<LoginFormInput>` y `zodResolver` provocado por la mezcla de `.default(false)` en esquemas y tipado de Hook Form.
- Adición de Tests para la Renderización y Estructura en la Capa de Presentación (`LoginForm` y `LoginLeftPanel`).
