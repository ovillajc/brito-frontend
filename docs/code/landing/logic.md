# Lógica de la Landing Page - Sociedad Brito

Este documento detalla la implementación técnica del feature `landing`, siguiendo los estándares de **Clean Architecture** y **Atomic Design**.

## Propósito
La landing page sirve como el punto de entrada principal para clientes B2B interesados en soluciones logísticas e industriales. Su objetivo es convertir visitantes en prospectos (Leads) mediante un formulario de contacto validado.

## Relación con otros Componentes

### 1. Capa de Dominio (`domain`)
- **Entidad `Lead`**: Define la estructura de datos pura para un prospecto. No tiene dependencias externas.
- **Esquema `contactFormSchema` (Zod)**: Define las reglas de validación (nombre, email, teléfono, empresa, mensaje). Es consumido tanto por la UI como por el Caso de Uso.

### 2. Capa de Aplicación (`application`)
- **Caso de Uso `SubmitLead`**: Orquesta la lógica de creación de un Lead. Actualmente utiliza el **Either Pattern** para retornar éxito (`ok: true`) o error (`ok: false`) de forma tipada, facilitando el manejo en la UI sin excepciones.
- **Interfaces de Repositorio**: Actualmente se utiliza un mock o implementación básica que será conectada a Supabase en el futuro.

### 3. Capa de Infraestructura (`infrastructure`)
- **Mappers**: Transforman el input del formulario a la entidad de dominio.
- **Próxima Integración**: Aquí residirá el `SupabaseLeadRepository`.

### 4. Capa de Presentación (`presentation`)
- **Atomic Design**: 
    - **Atoms**: Componentes UI básicos (Button, Input, Textarea).
    - **Organisms**: `Navbar`, `HeroSection`, `Footer`, `ContactFormSection`.
- **Hooks**: 
    - `useSubmitLead`: Gestiona el estado del formulario, la comunicación con el caso de uso y el feedback al usuario (toasts/modales).
- **Animaciones**: Utiliza `framer-motion` para transiciones suaves y efectos de entrada al hacer scroll.

## Decisiones de Diseño (Light Mode)
Se ha optado por un diseño **Light Mode** para transmitir transparencia y profesionalismo industrial:
- **Fondo**: `zinc-50`.
- **Tipografía**: `zinc-900` para legibilidad.
- **Colores de Acento**: Verde Brito (`#00843D`) y Naranja Brito (`#EA580C`) para botones y elementos clave.

## Testing
- **Vitest + RTL**: Se han implementado tests para cubrir el Happy Path, errores de validación y fallos de red.
- **Mocks Globales**: Se utiliza `vitest.setup.ts` para mockear APIs del navegador como `IntersectionObserver` y `ResizeObserver`, necesarias para las animaciones.

---
*Última actualización: 2024-04-05*
