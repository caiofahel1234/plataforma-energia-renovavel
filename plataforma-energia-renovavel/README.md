# Plataforma de Mensuração Multicritério de Vulnerabilidade Social Energética (TOPSIS)

SPA React + API Node/Express + PostgreSQL/PostGIS. Segue o *Roteiro de Desenvolvimento – Plataforma de Energia Renovável com TOPSIS*.

## Perfis (cada um com painel, menu e regras próprios)
| Perfil | Painel | Faz |
|---|---|---|
| Administrador | Painel Administrativo | cadastra municípios (UC01), gerencia usuários (RF08), consulta a auditoria |
| Pesquisador | Painel de Pesquisa | configura critérios/pesos e salva a **configuração oficial** (UC02), analisa correlações e compara unidades |
| Gestor Público | Painel de Gestão | executa o TOPSIS (UC03) **sempre com a configuração oficial**, vê prioridades e gera relatórios (UC04) |

## Estrutura
```
frontend/  React + Vite + Tailwind + Leaflet + Recharts   (src/{components,pages,services,hooks,utils})
backend/   Express  (src/{routes,controllers,services,models,middlewares,config}, tests/, migrations/, seeds/)
docs/      requisitos/ · uml/ · api/ · manual-usuario/
docker-compose.yml · .github/workflows/ci.yml
```

## Subir tudo com 1 comando (Docker)
```bash
./scripts/gen-dev-cert.sh                   # certificado autoassinado p/ HTTPS (apenas dev)
cp .env.example .env                        # preencha POSTGRES_PASSWORD, JWT_SECRET, ADMIN_PASSWORD
docker compose up --build
```
Abra `https://localhost` (aceite o certificado autoassinado). Login: `ADMIN_EMAIL` / `ADMIN_PASSWORD` do `.env`. Swagger: `https://localhost/api/docs`. O banco já sobe com os critérios do Cap. 7.1 e **8 municípios fictícios** (`backend/seeds/demo.sql` – remova em produção). Após o 1º acesso, apague `ADMIN_PASSWORD` do `.env`.

## Desenvolvimento local
```bash
# 1) Banco (PostgreSQL + PostGIS) e backend
cd backend && cp .env.example .env && npm install     # preencha DATABASE_URL, JWT_SECRET (>=32 chars)
npm run migrate && npm run seed                        # schema + dados fictícios
ADMIN_EMAIL=admin@exemplo.com ADMIN_PASSWORD='Troque@Esta-Senha-1' npm start
# 2) Frontend (proxy /api -> :3000)
cd ../frontend && echo "VITE_API_URL=/api" > .env.development.local && npm install && npm run dev
```
Sem `VITE_API_URL` o front roda em **modo demonstração** (somente `npm run dev`; dados locais, sem autenticação real; não funciona em build de produção).

## Mapa (tiles do OpenStreetMap)
O OpenStreetMap bloqueia (**403 "Access blocked"**) requisições de tiles **sem Referer**. Por isso a política de referenciador é `strict-origin-when-cross-origin` (envia só a origem, nunca caminho/query) no `index.html`, no `nginx.conf` e na camada de tiles. **Não use `no-referrer` no front.** Os servidores públicos do OSM são para uso leve: em produção/alto tráfego configure um provedor próprio em `VITE_TILE_URL` e inclua o domínio dele em `img-src` da CSP do `nginx.conf`.

## Testes
O comando `npm run test:db` é executado por um script Node multiplataforma, portanto funciona também no PowerShell/Windows.

| Nível | Comando | Observação |
|---|---|---|
| Unitário + integração (Jest/Supertest) | `cd backend && npm test` | camada de dados simulada; limiar de cobertura 80% |
| Integração com banco real | `cd backend && RUN_DB_TESTS=1 DATABASE_URL=postgres://…/vse_test npm run test:db` | **apaga o schema `public` do banco informado** – use um banco de testes |
| Front (Vitest) | `cd frontend && npm test` | TOPSIS e sanitização |
| E2E (Cypress) | `cd frontend && npm run dev` e `npm run e2e` | fluxo cadastrar → executar → ranking (modo demo) |

## Segurança (OWASP Top 10)
JWT em cookie httpOnly/Secure/SameSite=Strict + token CSRF; RBAC no servidor; bcrypt (custo ≥ 10) e política de senha forte; bloqueio de conta e rate limit; validação estrita (zod) e consultas parametrizadas; CORS restrito; CSP/HSTS/X-Frame-Options (API e Nginx); segredos só em `.env`; erros genéricos; auditoria de login, parâmetros TOPSIS, exclusões, exportações, acessos negados e CSRF; anti-IDOR nas simulações; `npm audit` sem vulnerabilidades conhecidas na data da entrega.

## Checklist de entrega (Cap. 14)
| Item | Situação |
|---|---|
| Repositório Git com histórico organizado | ⬜ a cargo da equipe (`git init`; commits por sprint) |
| README completo | ✅ |
| Docker Compose (1 comando) | ◐ configurado e **não executado** (sem Docker no ambiente de desenvolvimento) |
| Documento de Requisitos | ✅ `docs/requisitos` |
| Diagramas UML (mín.: Casos de Uso, Classes, Sequência) | ✅ 6 diagramas + 4 fluxos em `docs/uml` |
| Banco modelado e com migrations | ✅ `backend/migrations` (executado em PostgreSQL 16 + PostGIS 3.4) |
| API documentada (Swagger) | ✅ `/api/docs` e `docs/api/openapi.yaml` |
| TOPSIS com testes de validação | ✅ exemplo do Cap. 7.3 em 3 camadas |
| Frontend responsivo com dashboard | ✅ (validado em desktop) |
| Testes automatizados (unit. + integração) | ✅ ver tabela acima |
| Manual do Usuário | ✅ `docs/manual-usuario` |
| Apresentação (slides + demo) | ⬜ não produzida |

Limitações conhecidas: ver `docs/requisitos/requisitos.md`. A disponibilidade real das fontes externas depende da rede; cobertura completa do front-end, testes automatizados mobile/tablet e Firefox/Safari continuam fora da evidência automatizada.
