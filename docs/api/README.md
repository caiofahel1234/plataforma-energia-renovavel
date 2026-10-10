# API
- Especificação OpenAPI 3: [`openapi.yaml`](openapi.yaml). Interface interativa em **`/api/docs`** (Swagger UI) quando `ENABLE_DOCS=true` (padrão fora de produção).
- Autenticação por cookie `token` (httpOnly). Requisições `POST/PUT/DELETE` exigem `X-CSRF-Token` (retornado em `/auth/login` e `/auth/me`).
- Erros: `{ "erro": "mensagem genérica", "requestId": "…" }`.
