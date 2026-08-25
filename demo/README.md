# Demo — Painel de Clima, 3 execuções ao vivo

A mesma feature, três processos: prompt cru → modo plan → r-spec.
Encena ao vivo a régua L1 → L2 → L3 da talk.

**Feature:** painel de clima com cidades favoritas na aplicação existente —
buscar cidade, favoritar, ver temperatura atual + previsão de 5 dias, alternar
°C/°F — via **Open-Meteo** (geocoding: `https://geocoding-api.open-meteo.com/v1/search?name=`
· forecast: `https://api.open-meteo.com/v1/forecast`) — gratuita, sem chave.

**Base:** aplicação **zerada** (React + Vite + Tailwind no front, Express + TS
no back, Vitest configurado, `GET /health`, `DESIGN.md`) — sem nenhuma feature
implementada. Só `03-sdd/` traz Playwright (E2E); `01-prompt/` e `02-plan/`
não. As 3 pastas partem do mesmo código; diferem só no que o agente enxerga:

| Pasta | Setup | Rodada |
|---|---|---|
| `01-prompt/` | Sem NENHUMA config de agente | Prompt cru |
| `02-plan/` | Sem config; usar o plan mode do harness | Plano aprovado |
| `03-sdd/` | AGENTS.md + skills (versão atual do r-spec) + subagents + `tasks/` vazio | Pipeline r-spec |

---

## Antes da apresentação (uma vez)

Instalar dependências e conferir que o app sobe em cada pasta:
`npm install` (raiz, backend e frontend) e `npm run dev` (frontend :5173, backend :3000).

---

## Rodada 1 — Prompt direto (~8 min)

Abrir o harness em `01-prompt/` e mandar um prompt decente — o que um bom
dev escreveria num chat, sem processo:

> Adiciona um painel de clima no app: buscar cidade, adicionar aos favoritos,
> mostrar temperatura atual e previsão dos próximos 5 dias, com opção de
> trocar entre Celsius e Fahrenheit. Usa a Open-Meteo (https://open-meteo.com),
> que é gratuita e não precisa de chave — tem endpoint de geocoding pra busca
> de cidade e de forecast pro clima. Quero poder remover favoritos, tratamento
> de erro, e um visual consistente com o resto do app.

**O que observar com a plateia (narrar durante):**
- O prompt é bom — e mesmo assim: quem decidiu se o frontend chama a API
  direto ou via backend? Os favoritos persistem entre reloads ou somem?
  O que fazer quando a busca retorna várias cidades com o mesmo nome?
- Seguiu o DESIGN.md e os padrões do projeto (kebab-case, sem `any`, logging)?
- Escreveu testes? Que estados de erro cobriu?

**Resultado esperado:** funciona — mas as decisões não ditas foram do
modelo, convenções do projeto passaram batido e a verificação é você
olhando. É o loop do "ajusta isso, ajusta aquilo" do slide 2.

## Rodada 2 — Modo plan (~8 min)

Abrir o harness em `02-plan/`, ativar o plan mode e mandar o MESMO prompt
da rodada 1. Aprovar o plano e deixar executar.

**O que observar:** o plano melhora a estrutura (etapas, arquivos), mas as
decisões continuam do modelo, não suas — orquestração geocoding→forecast
decidida por ele, persistência dos favoritos implícita, convenções do
projeto ainda invisíveis, verificação fraca. E o plano morre com a sessão:
não vira artefato versionado.

## Rodada 3 — r-spec (~20 min)

Abrir o harness em `03-sdd/`. Mostrar antes: `AGENTS.md`, `.claude/skills/`
(processo + convenções) e `tasks/` vazio — a feature vira `tasks/01-...`.

**Fase 1 — create-prd:**

> Use a skill create-prd para a feature "painel de clima com cidades
> favoritas".
>
> Requisitos base:
> - Campo de busca de cidade por nome, usando o geocoding da Open-Meteo:
>   https://geocoding-api.open-meteo.com/v1/search?name=
> - Se a busca retornar mais de uma cidade com o mesmo nome (país/estado
>   diferentes), o usuário escolhe qual delas antes de favoritar.
> - Adicionar a cidade escolhida a uma lista de favoritos.
> - Cada favorito exibe: nome da cidade, temperatura atual, condição
>   (código do tempo da Open-Meteo) e mín/máx do dia.
> - Clicar num favorito expande a previsão dos próximos 5 dias (mín/máx
>   e condição por dia).
> - Fonte da previsão: forecast da Open-Meteo, gratuita e sem chave:
>   https://api.open-meteo.com/v1/forecast
> - Alternar entre Celsius e Fahrenheit, aplicando a TODOS os valores de
>   temperatura exibidos na tela.
> - Remover um favorito da lista.
> - A Open-Meteo (geocoding e forecast) deve ser consumida exclusivamente
>   pelo backend (o frontend nunca chama a Open-Meteo diretamente).
> - Estados de carregamento e de erro com mensagem clara em pt-BR e
>   opção de "tentar novamente".
> - UI seguindo o DESIGN.md do projeto, responsiva.
> - Fora do escopo desta versão: alertas climáticos, gráficos históricos,
>   múltiplas listas de favoritos, notificações e i18n além do pt-BR.

Revisar o `prd.md` gerado COM a plateia (o ponto da talk: artefato auditável).

**Fase 2 — create-techspec:** mostrar a decisão de arquitetura + trade-offs.

**Fase 3 — create-tasks:** aprovar a lista de alto nível.

**Fase 4 — execute-tasks** (orquestrado, subagentes implementam + revisam)
— enquanto roda, responder perguntas da plateia.

**Fase 5 — execute-review:** mostrar o `codereview.md` nascendo.

**Se o tempo apertar:** cortar as fases do meio e mostrar as pontas —
create-prd ao vivo + codereview.md de uma execução anterior (regra da casa:
nunca acelerar tudo, cortar o meio).

## Plano B (qualquer rodada travar)

- Artefatos prontos do exemplo `01-painel-clima` no repo do r-spec — os mesmos
  mostrados na talk.
- Rodada 1/2 travou? Congelar a tela, narrar o que aconteceria, seguir pra 3.
- Open-Meteo fora do ar? Testar com `curl` antes; se cair na hora, pedir no
  prompt pra usar uma fixture local com o payload da API.

## Comparação final (fechar a demo)

| | Prompt | Plan | r-spec |
|---|---|---|---|
| Decisões não ditas | do modelo | do modelo | **suas, aprovadas no PRD/TechSpec** |
| Convenções | invisíveis pro agente | invisíveis pro agente | **AGENTS.md + skills** |
| Verificação | você olhando | você olhando | **review + QA + regressão** |
| Rastro | chat perdido | chat perdido | **`tasks/01-*/` versionado** |
