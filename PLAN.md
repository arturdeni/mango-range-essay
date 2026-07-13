# Plan técnico — Mango `<Range />` exercise

Documento de referencia con las decisiones tomadas antes de implementar, pensado para poder explicar el razonamiento en la entrevista técnica.

## 1. Objetivo del ejercicio

Construir un componente `<Range />` reutilizable con dos modos de uso, sobre Next.js (App Router) + TypeScript:

1. **Exercise 1 — Normal range** (`/exercise1`): rango continuo min↔max, con labels editables por click, alimentado por un mock `{ min, max }`.
2. **Exercise 2 — Fixed values range** (`/exercise2`): rango sobre un array fijo de valores `[1.99, 5.99, 10.99, 30.99, 50.99, 70.99]`, labels no editables, alimentado por un mock `{ rangeValues: [] }`.

Restricciones del enunciado: no puede ser `<input type="range">`, debe correr en `localhost:8080`, debe tener tests, y debe usar un servicio HTTP mockeado.

## 2. Stack y decisiones técnicas

| Decisión | Elección | Por qué |
|---|---|---|
| Framework | Next.js App Router + TypeScript, scaffold manual (sin `create-next-app`) | Pedido explícito del enunciado; control total de la estructura |
| Package manager | pnpm | Estándar del equipo/preferencia personal |
| Estilos | CSS vanilla + BEM | Tailwind descartado explícitamente; BEM da co-localización simple sin dependencias ni build tooling extra |
| Mock HTTP | Next.js Route Handlers (`app/api/range-config`, `app/api/range-values`) | Es un servidor HTTP real y autocontenido en el propio repo, sin depender de servicios externos (alternativa a mockable.io) |
| Testing | Jest + React Testing Library | Estándar de facto en el ecosistema Next.js (`next/jest`), estable y bien documentado |
| Agente de desarrollo | Claude Code, con `AGENTS.md` (convención oficial de Next.js 16+) + `CLAUDE.md` importándolo, más `next-devtools-mcp` para acceso en vivo a errores/rutas del dev server | Mantiene al agente alineado con la doc versionada de Next.js instalada y con el estado real de la app durante el desarrollo |

## 3. Arquitectura del componente

Un único componente `<Range />` con dos modos (`continuous` y `stepped`) que comparten la lógica de arrastre y solo difieren en si el label es editable y si el valor se clampa libremente o se "snapea" a un array de valores fijos.

```
app/
  layout.tsx, page.tsx
  exercise1/page.tsx        → Normal Range
  exercise2/page.tsx        → Fixed Values Range
  api/
    range-config/route.ts   → GET → { min, max }
    range-values/route.ts   → GET → { rangeValues: [...] }

components/Range/
  Range.tsx                 → orquestador (composición, sin lógica de negocio)
  RangeTrack.tsx             → pista + relleno activo
  RangeHandle.tsx             → handle individual (hover/drag/focus/aria)
  RangeLabel.tsx             → label editable (continuous) o fija (stepped)
  hooks/
    useRangeDrag.ts          → lógica de arrastre (pointer events), sin JSX
    useRangeKeyboard.ts      → navegación con flechas (a11y)
  lib/
    valueMath.ts             → value↔percentage, clamping, snapping
  types.ts
  index.ts                   → barrel export

lib/api/
  getRangeConfig.ts, getRangeValues.ts  → fetchers tipados
```

**RSC boundary**: `Range.tsx` y sus subcomponentes son Client Components (`'use client'`) porque manejan drag/estado; los Route Handlers permanecen 100% server-side. Esta separación evita mezclar lógica de servidor con interactividad de cliente.

**Formateo de valores**: el enunciado muestra los valores en euros (`1€`, `5.99€`), pero el componente se mantiene agnóstico a la moneda. `Range` acepta un prop opcional `formatValue?: (value: number) => string`; cada página (`exercise1`/`exercise2`) pasa su propio formateador `(v) => \`${v}€\``. El formateo es puramente de presentación: afecta al texto del label y al `aria-valuetext` del handle, pero la edición del label sigue trabajando sobre el número crudo (`<input type="number">`), no sobre la cadena formateada. Así el `€` vive en la capa de página, no dentro del design-system component.

## 4. Accesibilidad

- `role="slider"` + `aria-valuemin`/`aria-valuemax`/`aria-valuenow`/`aria-label` en cada handle, más `aria-valuetext` con el valor formateado (`20€`) cuando se pasa `formatValue`, para que el lector de pantalla anuncie la moneda y no un número pelado.
- Navegación con teclado (flechas) además del drag — no lo pide el enunciado explícitamente, pero un slider drag-only no es accesible.
- Foco visible y contraste adecuado en los handles.

## 5. Testing

- `valueMath.ts` → unit tests puros (clamping, no-cruce de valores, snapping a array fijo).
- `useRangeDrag` / `useRangeKeyboard` → tests de comportamiento vía el componente.
- `Range.tsx` → integration tests: arrastre simulado, edición de label, límites, no-cruce, formateo de valores (`formatValue` → label + `aria-valuetext`, edición sobre el número crudo), fetch mockeado de los route handlers.
- Route handlers → tests de la respuesta HTTP.

## 6. Orden de implementación

1. Scaffold Next.js + `AGENTS.md`/`CLAUDE.md`/`.mcp.json` + `README`/`PLAN.md` — commit inicial.
2. `valueMath.ts` + tests unitarios (lógica pura, sin UI).
3. Route handlers mock + tests.
4. `RangeTrack` + `RangeHandle` (UI estática, sin interacción).
5. `useRangeDrag` + integración en `Range`.
6. Exercise 1: labels editables + fetch de config.
7. Exercise 2: snapping a valores fijos + labels no editables.
8. Pase de accesibilidad (teclado, aria) + tests de integración finales.
9. Pulido visual + README final.

## 7. Por qué no MDX / por qué sí Route Handlers como "servidor mock"

- Next.js soporta MDX para renderizar contenido markdown como páginas — no aplica aquí, no hay contenido editorial que mostrar, así que no se instala `@next/mdx`.
- El enunciado permite "cualquier método mockeado"; los Route Handlers de Next.js son la opción más simple y autocontenida: no dependen de un servicio externo (mockable.io) que pueda caducar, y siguen siendo una llamada HTTP real desde el cliente.
