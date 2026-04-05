# Blueprint: Landing Page Corporativa - Sociedad Brito
**ID:** FEAT-BRITO-01 | **Status:** Design Phase

## Objetivo
Desarrollar una landing page de alto impacto para la **Sociedad Brito** que proyecte profesionalismo, solidez y facilite la captación de leads. La IA debe basar toda la narrativa y valores en el archivo de contexto proporcionado: `docs/core/brito-context.md`.

## Reglas de Negocio y Requerimientos (BR)
| ID        | Regla               | Descripción                                                                                    |
| :-------- | :------------------ | :--------------------------------------------------------------------------------------------- |
| **BR-01** | Coherencia de Marca | Los textos, colores y secciones deben alinearse estrictamente al perfil en `brito-context.md`. |
| **BR-02** | Captación de Leads  | El formulario de contacto debe validar datos con **Zod** antes de enviarlos.                   |
| **BR-03** | Rendimiento SEO     | La página debe exportar metadatos dinámicos y usar `next/image` para un LCP óptimo.            |
| **BR-04** | Persistencia Segura | Los leads deben guardarse en la tabla `leads` de Supabase con **RLS** habilitado.              |

## Especificaciones Técnicas (Clean Architecture)
Siguiendo la estructura de `src/features/landing/`:

### 1. Capa de Domain
- **Entity**: `Lead` { id, name, email, message, company, createdAt }.
- **Validation**: Schema Zod `contactFormSchema` para validación en cliente y servidor.

### 2. Capa de Application
- **Use Case**: `SubmitLeadUseCase`. Debe implementar el **Either Pattern** para manejar errores de red o base de datos.

### 3. Capa de Infrastructure
- **Repository**: `SupabaseLeadRepository`.
- **Mapper**: `LeadMapper` para transformar el payload del formulario al formato de la tabla en Supabase.

### 4. Capa de Presentation (Atomic Design)
Organizar componentes según su complejidad:
- **Atoms**: `Button`, `Input`, `Typography` (en `src/core/presentation/components/ui/`).
- **Molecules**: `FormField`, `ServiceCard`, `NavLinks`.
- **Organisms**: `HeroSection`, `AboutUs`, `ContactForm`, `Footer`.
- **Page**: `page.tsx` en el App Router (Server Component por defecto).

## UI/UX & Vibe
- **Framework**: Tailwind CSS con sistema de diseño basado en Shadcn/UI.
- **Interactividad**: Uso de Framer Motion para entradas suaves (Client Components aislados).
- **Carga**: Implementar **Skeletons** mientras se procesan las Server Actions.

## Criterios de Aceptación (DoD)
- [ ] Responsive Design: Optimizado para Mobile, Tablet y Desktop.
- [ ] TypeScript Estricto: Sin uso de `any` y con interfaces documentadas.
- [ ] Test Unitario: Prueba del `SubmitLeadUseCase` con repo mockeado.
- [ ] Registro de Implementación: Actualizar `03-implementation.log` al finalizar.