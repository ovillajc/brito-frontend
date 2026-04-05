# Vitest and Testing Library Setup

## Purpose
This implementation establishes a modern and fast testing environment for the project. By using **Vitest** instead of Jest, we benefit from Vite's native speed and seamless integration with React 19 and Next.js.

## Relationships
- **Next.js**: The setup is compatible with Server and Client components.
- **React Testing Library**: Integrated to provide high-level DOM assertions and component rendering.
- **JSDoc/TypeScript**: Full type support for test files.

## Clean Architecture Integration
The testing strategy is divided into layers as per `AGENTS.md`:
1. **Domain**: Unit tests for pure logic, entities, and validation schemas.
2. **Application**: Mocked repository tests for Use Cases.
3. **Infrastructure**: Integration tests for Mappers and API clients.
4. **Presentation**: Component tests with React Testing Library.

## Configuration Details
- **[vitest.config.ts](file:///Users/ovillajc/Documents/Desarrollo/projects/netus-devs/brito/vitest.config.ts)**: Uses `@vitejs/plugin-react` and `jsdom`.
- **[vitest.setup.ts](file:///Users/ovillajc/Documents/Desarrollo/projects/netus-devs/brito/vitest.setup.ts)**: Extends standard assertions with `jest-dom`.
- **Root `test/` directory**: Centralizes all test files, organized by module and feature.

## Maintenance
When adding new modules, ensure to create a corresponding folder in `test/` and document the testing strategy in `docs/code/<module>/testing.md` if it deviates from the standard.
