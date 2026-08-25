# Apresentação — Confiança no código gerado por I.A

Material da talk sobre **Spec-Driven Development (SDD)**: por que código gerado
por I.A sem processo não é confiável, e como especificar antes, executar uma
fase por vez e verificar com sensores muda isso. A implementação usada na demo
é o [r-spec](https://github.com/renanloureiroo/r-spec).

## Estrutura

```
.
├── talk-sdd.pptx        # Slides (21, com notas do apresentador)
├── talk-sdd.pdf         # Mesmo deck em PDF
└── demo/
    ├── README.md        # Roteiro da demo: prompts, tempos, plano B
    ├── 01-prompt/       # Base sem config de agente — rodada "prompt cru"
    ├── 02-plan/         # Mesma base — rodada "modo plan"
    └── 03-sdd/        # Base completa (AGENTS.md, skills, subagents) — rodada r-spec
```

## A talk (~20 min)

Arco: a dor do "ajusta isso, ajusta aquilo" → por que a I.A chuta (sem acesso,
sem direção) → guias e sensores → degradação da janela de contexto (context
rot) → SDD como resposta → artefatos reais (PRD, TechSpec, Tasks, Review) →
gancho pro r-spec.

## A demo (sessão separada)

A mesma feature — **painel de cotações USD/EUR/BTC → BRL** (AwesomeAPI,
gratuita, sem chave) — executada três vezes ao vivo, uma em cada base:

| Rodada        | Base         | O que mostra                                              |
| ------------- | ------------ | --------------------------------------------------------- |
| 1. Prompt cru | `01-prompt/` | Decisões implícitas, convenções ignoradas                 |
| 2. Modo plan  | `02-plan/`   | Estrutura melhor, decisões ainda do modelo                |
| 3. r-spec     | `03-sdd/`    | Artefatos aprovados, sensores por fase, rastro versionado |

As três bases partem da mesma aplicação **zerada** (React + Vite + Tailwind,
Express + TypeScript, Vitest, sem nenhuma feature); só `03-sdd/` traz
Playwright (E2E), `01-prompt/` e `02-plan/` não. Diferem
apenas no que o agente enxerga — a `03-sdd/` leva AGENTS.md, as skills na
versão atual do r-spec e os subagents. Setup: `npm install` na raiz,
`backend/` e `frontend/` de cada base. Roteiro completo em `demo/README.md`.

## Fontes principais

- [r-spec](https://github.com/renanloureiroo/r-spec) — o processo apresentado
- [Anthropic — Effective Context Engineering for AI Agents](https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents) (set/2025)
- [Chroma — Context Rot](https://www.trychroma.com/research/context-rot) (2025)
- Curso "Processo de Desenvolvimento com I.A" (Rodrigo Branas & Pedro Nauck) — régua L0–L4, guias e sensores, dados MRCR
