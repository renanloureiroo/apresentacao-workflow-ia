# Aplicação base

Fullstack de demonstração: `frontend/` (React + Vite + Tailwind) e `backend/`
(Express + TypeScript), com Vitest (unit/integração) e Playwright (E2E).

- Dev: `npm run dev` dentro de `backend/` e de `frontend/`
- App: http://localhost:5173 · API: http://localhost:3000 (`GET /health`)
- E2E: `npm install` na raiz, depois `npm run test:e2e`

A UI segue o `DESIGN.md`. Features entram em `tasks/<NN>-<slug>/` quando
desenvolvidas via pipeline de SDD.
