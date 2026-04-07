# Blueprint: Módulo de Flotilla (Fleet Management)

## 1. Descripción General
El módulo de Flotilla es el núcleo operativo de la plataforma para Sociedad Brito. Gestiona los activos físicos (tractocamiones y remolques/trailers) y el capital humano (operadores) necesarios para la ejecución de servicios logísticos. Permite el "armado" de unidades combinando estos tres elementos.

## 2. Objetivos
- Centralizar el registro de vehículos (tractos y remolques) con metadatos técnicos y legales.
- Gestionar el perfil completo de los operadores, incluyendo licencias y certificaciones.
- Permitir la carga y consulta de documentación digital para cada entidad.
- Facilitar el ensamblaje de "unidades operativas" (Tracto + Remolque + Operador).

## 3. Arquitectura (Clean Architecture)
- **Domain**: 
  - Entidades: `TractorEntity`, `TrailerEntity`, `OperatorEntity`, `UnitAssemblyEntity`.
  - Interfaces: `IFleetRepository`.
  - Esquemas Zod para registro y validación.
- **Application**: 
  - Casos de Uso: `RegisterVehicle`, `RegisterOperator`, `AssembleUnit`, `UploadDocument`.
- **Infrastructure**: 
  - Repositorio Supabase para datos y Storage para documentos.
  - Mappers para normalizar las respuestas de Postgres.
- **Presentation**: 
  - Páginas: `FleetDashboard`, `TractorsList`, `TrailersList`, `OperatorsList`.
  - Componentes: Modales de registro, visores de documentos, tarjetas de resumen de unidad.

## 4. Entidades Principales

### Tractocamiones
- Datos: Marca, Modelo, Año, Placas, VIN (Número de serie), Póliza de Seguro, Fecha de vencimiento, Estado.
- Documentos: Factura, Certificado de seguridad, Póliza física.

### Remolques (Trailers)
- Datos: Tipo (Caja Seca, Refrigerado, etc.), Marca, Modelo, Placas, Número económico, Póliza.
- Documentos: Factura, Permisos SCT.

### Operadores
- Datos: Nombre, Apellido, Licencia (Número y Clase), RFC, NSS, CURP, Dirección, Teléfono, Tipo de sangre, Fastrack/Opalo.
- Documentos: Identificación, Licencia física, Comprobante de domicilio.

## 5. Diseño Visual
- **Navegación**: Dividida por sub-pestanas u opciones laterales dentro del módulo de Flotilla.
- **Estética**: Tablas de alta densidad de datos (estilo tabular premium) con filtros rápidos y estados visuales (badges) para documentos vencidos o pólizas por expirar.
