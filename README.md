# LESO Life OS

Sistema de gestión personal desarrollado en Next.js con Tailwind CSS y Firebase.

## Stack
- Next.js 14+ (App Router)
- TypeScript
- Tailwind CSS + shadcn/ui
- Firebase (Auth, Firestore, Storage)
- Zustand (State management)
- React Hook Form + Zod (Validación de formularios)
- pnpm (Package manager)

## Cómo correr local

1. Instalar dependencias:
   ```bash
   pnpm install
   ```

2. Configurar Firebase:
   - Crear un proyecto en Firebase y habilitar Authentication y Firestore.
   - Copiar las credenciales en un archivo `.env.local` basado en `.env.local.example`.

3. Correr la aplicación (Next.js + Firebase Emulators):
   ```bash
   pnpm dev:all
   ```

4. Abrir la aplicación:
   - App: [http://localhost:3000](http://localhost:3000)
   - Firebase Emulator UI: [http://localhost:4000](http://localhost:4000)

## Cómo correr solo el emulador

```bash
pnpm emulator
```

## Estructura del proyecto
- `src/app`: Rutas y páginas de Next.js
- `src/components`: Componentes reutilizables de UI y layout
- `src/lib`: Utilidades, hooks, configuración de Firebase y tipos
