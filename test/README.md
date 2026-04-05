# Test Directory Structure

This directory contains all unit and integration tests for the project. Following the **Clean Architecture** principles and the rules defined in `AGENTS.md`, tests are organized by feature and layers.

## Structure

```text
test/
└── <feature-name>/
    ├── domain/         # Entity and business logic tests
    ├── application/    # Use Case and service tests
    ├── infrastructure/ # Mapper and Repository implementation tests
    └── presentation/   # Component and UI hook tests
```

## Naming Convention

Tests should use the following naming convention:
- `*.test.ts` or `*.spec.ts`
- `*.test.tsx` or `*.spec.tsx` for React components

## Requirements

1. **Mandatory Tests**: Every new feature or modification must include its corresponding tests.
2. **Layer Separation**: Respect the Clean Architecture when organizing test files.
3. **Execution**: Run tests using `pnpm test` or `pnpm run test:watch`.

> [!IMPORTANT]
> A task is not considered complete (Definition of Done) until all its tests are implemented and passing in this directory.
