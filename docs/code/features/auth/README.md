# Documentación Técnica: Módulo de Autenticación (Auth)

## Introducción
El módulo de autenticación es el pilar de seguridad de la aplicación de Sociedad Brito. Está construido siguiendo los principios de **Clean Architecture** para garantizar que la lógica de negocio (dominio) sea independiente de las herramientas externas (Supabase).

## Estructura de Capas

### 1. Domain (Dominio)
Localización: `src/features/auth/domain/`
- **Entities**: `UserEntity` define el modelo de datos de usuario que utiliza toda la aplicación. No contiene lógica de frameworks.
- **Repositories**: `IAuthRepository` es la interfaz que define el contrato. Cualquier implementación futura (Firebase, Auth0) debe cumplir con esta interfaz.
- **Schemas**: `loginSchema` utiliza Zod para centralizar las reglas de validación (ej. longitud mínima de contraseña).

### 2. Application (Aplicación)
Localización: `src/features/auth/aplication/`
- **Use Cases**: `LoginWithEmailUseCase` orquesta el proceso. Recibe las dependencias inyectadas y devuelve un objeto `Either`.
- **Patrón Either**: Todas las funciones devuelven `{ ok: true, data }` o `{ ok: false, error }`, obligando al consumidor a manejar ambos escenarios.

### 3. Infrastructure (Infraestructura)
Localización: `src/features/auth/infraestructure/`
- **Repositories**: `SupabaseAuthRepository` implementa el contrato de dominio usando el SDK `@supabase/ssr`.
- **Mappers**: `AuthMapper` transforma el objeto `User` de Supabase a `UserEntity`. Esto protege a la aplicación de cambios en el esquema de la API de Supabase.

### 4. Presentation (Presentación)
Localización: `src/features/auth/presentation/`
- **Store**: `useAuthStore` (Zustand) centraliza el estado global de la sesión.
- **Hooks**: `useLogin` encapsula la lógica de `react-hook-form` y la interacción con los casos de uso.
- **Components**: Siguen el patrón de **Atomic Design**. El `LoginForm` es un organismo que utiliza átomos de `core`.

## Flujo de Datos
1. **Vista** (`LoginForm`) -> **Hook** (`useLogin`) -> **UseCase** (`LoginWithEmailUseCase`) -> **Repository** (`SupabaseAuthRepository`) -> **Supabase API**.
2. La respuesta fluye de vuelta a través del **Mapper**, se entrega al **Store** y finalmente actualiza la **Vista**.

## Seguridad
- Se utiliza `createServerClient` para el manejo de cookies en el lado del servidor, evitando la exposición de tokens sensibles en `localStorage`.
- Las políticas de **RLS** (Row Level Security) en la base de datos aseguran que un usuario solo pueda acceder a su propio registro en la tabla `profiles`.
