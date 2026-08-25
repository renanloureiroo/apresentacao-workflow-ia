---
name: backend-architecture
description: Arquitetura do backend Express (module-based, camadas routes → controller → service, validação Zod, erros centralizados). Acionar ao criar ou alterar qualquer coisa em backend/src/ — novo módulo, rota, service, middleware. Não usar para componentes/hooks React (use react-frontend-expert).
---

# Arquitetura do Backend

O backend é organizado por **módulo de domínio** (não por tipo de arquivo). Cada módulo é uma pasta autocontida em `backend/src/modules/<module>/`, com camadas curtas e responsabilidade única por arquivo. Código transversal (erros, middlewares, tipos comuns) vive em `backend/src/shared/`.

## Quando usar

- **Acionar para:** criar um módulo/endpoint novo, adicionar uma rota, service, validação, middleware ou tratamento de erro no backend.
- **Não usar se:** a tarefa é só frontend (use `react-frontend-expert`) ou não toca `backend/src/`.

## Convenções

### Estrutura e organização

```
backend/src/
  app.ts                          # monta express(), registra middlewares globais e routers de cada módulo
  index.ts                        # listen()
  shared/
    errors/
      app-error.ts                # classe AppError (statusCode + message)
    middlewares/
      error-handler.ts            # error handler central (único lugar que formata resposta de erro)
      not-found.ts                # 404 para rota inexistente
  modules/
    <module>/
      <module>.routes.ts          # define o Router e os paths, aplica middleware de validação
      <module>.controller.ts      # traduz HTTP (req/res) <-> chamada de service; sem lógica de negócio
      <module>.service.ts         # lógica de negócio; não conhece req/res; lança AppError em caso de falha
      <module>.schema.ts          # schema(s) Zod de input (body/query/params) + tipos inferidos
      <module>.types.ts           # tipos de domínio que não vêm do Zod (ex.: retorno de integração externa)
      <module>.test.ts            # testes de integração via supertest sobre createApp()
```

- Nome do módulo em kebab-case, mesmo nome usado nos arquivos (`weather.routes.ts`, não `weatherRoutes.ts`).
- `app.ts` só importa e registra routers (`app.use('/api/<module>', moduleRouter)`) e os middlewares globais (`cors`, `express.json`, `not-found`, `error-handler` por último). Não coloca lógica de rota ali.
- Um módulo nunca importa arquivo interno de outro módulo. Se dois módulos precisam compartilhar algo, esse algo vai para `shared/`.

### Padrões de código

- **Controller é fino**: extrai dados do `req`, chama exatamente um método de service, devolve `res.status(...).json(...)`. Nenhum `if` de regra de negócio no controller.
- **Service é puro em relação a HTTP**: recebe/retorna tipos de domínio, nunca `Request`/`Response`. Erros de negócio são lançados como `throw new AppError(mensagem, statusCode)`, nunca `res.status()` dentro do service.
- **Validação sempre no `schema.ts` via Zod**, aplicada num middleware genérico de validação (`shared/middlewares/validate.ts` — se não existir, criar no primeiro módulo que precisar) antes do controller. Controller já recebe `req.body`/`req.query` tipado e validado.
- **Erros**: qualquer erro esperado (validação de negócio, recurso não encontrado, etc.) é um `AppError`. Erros inesperados sobem para o `error-handler` central, que decide o formato de resposta — nenhum outro lugar do código deve montar `{ error: ... }` manualmente.
- **Sem números/strings mágicos**: status codes e mensagens repetidas viram constantes nomeadas (`shared/` ou no topo do arquivo do módulo), conforme regra geral do `AGENTS.md`.
- **Logging**: seguindo a regra do `AGENTS.md`, logue no controller (entrada da requisição) e no service (branches relevantes/erros), com prefixo `[module]` ou `[module:acao]` para rastreio.

### Validação de input (Zod)

- Cada `schema.ts` exporta um schema por payload esperado (`createXSchema`, `xParamsSchema`, etc.) e o tipo inferido via `z.infer<typeof schema>`.
- Nunca duplicar validação manual (`if (!body.campo)`) em controller/service quando já existe um schema — o schema é a única fonte de verdade do shape de entrada.

### Testes

- Testes de módulo são de integração: sobem a app via `createApp()` (sem `listen`) e batem nas rotas com `supertest`, como já é feito em `backend/src/app.test.ts`.
- Segue a regra geral do projeto: `describe`/`it` em português, `it` no padrão **"deve…"**.

## Exemplos

```ts
// modules/weather/weather.schema.ts
import { z } from 'zod';

export const getWeatherQuerySchema = z.object({
  city: z.string().min(1, 'city é obrigatório'),
});

export type GetWeatherQuery = z.infer<typeof getWeatherQuerySchema>;
```

```ts
// modules/weather/weather.service.ts
import { AppError } from '../../shared/errors/app-error';

const CITY_NOT_FOUND_STATUS = 404;

export async function getWeatherByCity(city: string) {
  console.log(`[weather:service] buscando clima para "${city}"`);
  const result = await fetchFromProvider(city);
  if (!result) {
    console.log(`[weather:service] cidade "${city}" não encontrada`);
    throw new AppError(`Cidade "${city}" não encontrada`, CITY_NOT_FOUND_STATUS);
  }
  return result;
}
```

```ts
// modules/weather/weather.controller.ts
import { Request, Response } from 'express';
import { getWeatherByCity } from './weather.service';
import { GetWeatherQuery } from './weather.schema';

export async function getWeatherHandler(req: Request, res: Response) {
  const { city } = req.query as unknown as GetWeatherQuery;
  console.log(`[weather:controller] GET /api/weather?city=${city}`);
  const weather = await getWeatherByCity(city);
  res.status(200).json(weather);
}
```

```ts
// modules/weather/weather.routes.ts
import { Router } from 'express';
import { getWeatherHandler } from './weather.controller';
import { validate } from '../../shared/middlewares/validate';
import { getWeatherQuerySchema } from './weather.schema';

export const weatherRouter = Router();

weatherRouter.get('/', validate({ query: getWeatherQuerySchema }), getWeatherHandler);
```

```ts
// shared/errors/app-error.ts
export class AppError extends Error {
  constructor(
    message: string,
    public readonly statusCode: number,
  ) {
    super(message);
    this.name = 'AppError';
  }
}
```

## Antipadrões (evite)

- ❌ Lógica de negócio dentro do controller (`if` de regra, cálculo, acesso a integração externa direto na rota) → ✅ mover para o `service`.
- ❌ `res.status(...).json(...)` dentro do `service` → ✅ service lança `AppError`, quem responde HTTP é o controller/error-handler.
- ❌ Validar manualmente campo a campo no controller (`if (!req.body.x)`) → ✅ schema Zod + middleware `validate`.
- ❌ Um módulo importando arquivo de dentro de outro módulo (`../outro-module/outro.service`) → ✅ extrair para `shared/`.
- ❌ Try/catch espalhado formatando resposta de erro em cada rota → ✅ um único `error-handler` central em `shared/middlewares/`.
