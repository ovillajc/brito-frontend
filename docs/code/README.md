# Code Documentation Standard

This directory contains detailed documentation for each module and feature in the project. Following the **Clean Architecture** principles defined in `AGENTS.md`, every important implementation or modification must be documented here.

## Structure

```text
docs/code/
└── <module-name>/
    └── <feature-description>.md
```

## Requirements

Each documentation file must include:
1. **Purpose**: Why this code exists and what problem it solves.
2. **Relationships**: How it interacts with other components, hooks, or stores.
3. **Architecture**: How it fits into the Clean Architecture layers (Domain, Application, Infrastructure, Presentation).
4. **Maintenance**: Guidelines for future modifications.

## Feature Directory

- **Auth**: [Documentación](file:///Users/ovillajc/Documents/Desarrollo/projects/netus-devs/brito/docs/code/features/auth/README.md) - Gestión de sesiones y seguridad.
- **Dashboard**: [Documentación](file:///Users/ovillajc/Documents/Desarrollo/projects/netus-devs/brito/docs/code/features/dashboard/README.md) - Métricas clave y resumen operativo.

> [!NOTE]
> Este repositorio de documentación sirve como la "fuente de verdad" para la lógica de la implementación, complementando el propio código y su JSDoc.
