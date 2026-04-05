# Blueprint: Módulo de Autenticación (Login)

## 1. Descripción General
Este módulo gestiona la autenticación de usuarios para la plataforma de Sociedad Brito, permitiendo el acceso seguro mediante correo electrónico/contraseña y proveedores sociales (Google, Apple).

## 2. Objetivos
- Proporcionar una interfaz de inicio de sesión premium y responsiva.
- Garantizar la seguridad de las sesiones mediante Supabase SSR.
- Implementar validaciones estrictas de datos en el cliente y servidor.

## 3. Arquitectura (Clean Architecture)
- **Domain**: Define la entidad `UserEntity`, el contrato `IAuthRepository` y los esquemas de validación `loginSchema`.
- **Application**: Contiene el caso de uso `LoginWithEmailUseCase` que orquesta la autenticación.
- **Infrastructure**: Implementa el repositorio de Supabase y el mapeo de DTOs a entidades.
- **Presentation**: Componentes atómicos de UI, hooks personalizados y gestión de estado con Zustand.

## 4. Diseño Visual
- **Paleta de Colores**: 
    - Principal: Verde Brito (#00843D)
    - Acento: Naranja Brito (#EA580C)
    - Fondo: Modo Claro (Zinc-50 / White)
- **Layout**: Diseño de dos paneles en escritorio:
    - **Izquierda**: Panel decorativo con gradiente oscuro y mensajes de marca.
    - **Derecha**: Formulario limpio y moderno con campos de entrada claros.

## 5. Casos de Uso
- **UC01**: Inicio de sesión con Email/Password.
- **UC02**: Inicio de sesión con Proveedores Sociales (Google/Apple).
- **UC03**: Cierre de sesión y limpieza de estado.

## 6. Diagrama de Flujo
1. El usuario ingresa credenciales.
2. `useLogin` valida localmente con Zod.
3. Se invoca `LoginWithEmailUseCase`.
4. El repositorio de Supabase realiza la petición.
5. Si tiene éxito, se actualiza `AuthStore` y se redirige a `/dashboard`.
6. Si falla, se muestra un mensaje de error descriptivo.
