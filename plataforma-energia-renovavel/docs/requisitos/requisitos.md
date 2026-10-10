# Documento de Requisitos (RF + RNF) – rastreabilidade e status

Legenda: ✅ atendido e verificado · ◐ atendido parcialmente · ⬜ não atendido. "Verificado" = coberto por teste automatizado ou executado em navegador neste repositório.

## Requisitos Funcionais (Cap. 2)
| ID | Descrição | Prio. | Status | Onde / evidência |
|---|---|---|---|---|
| RF01 | Cadastrar municípios com dados socioeconômicos | Alta | ✅ | Tela *Municípios*; `POST /api/municipios`; teste `db.integration` (PostGIS ida e volta) e E2E |
| RF02 | Cadastrar indicadores e critérios | Alta | ✅ | Tela *Configuração TOPSIS*; `POST/PUT/DELETE /api/criterios`; critérios C1–C7 do Cap. 7.1 no `001_init.sql` |
| RF03 | Configurar pesos (soma = 1,0) | Alta | ✅ | Sliders + indicador de soma; servidor rejeita soma ≠ 1,0 (422) – `api.test.js`, `db.integration` |
| RF04 | Executar TOPSIS e gerar ranking | Alta | ✅ | `POST /api/topsis/executar`; exemplo do Cap. 7.3 (B > A > C) em 3 camadas de teste |
| RF05 | Dashboard com gráficos | Média | ✅ | KPIs, barras do ranking, mini-mapa, radar (E2E em navegador) |
| RF06 | Exportar PDF/CSV | Média | ✅ | `GET /api/relatorios/:id/pdf\|csv` (auditado) + exportação local no modo demo |
| RF07 | Visualização georreferenciada | Média | ✅ | Leaflet, marcadores por faixa de Ci, camada de calor, filtro por critério |
| RF08 | Gerenciar usuários e perfis | Alta | ✅ | Criar/listar/editar/desativar/redefinir senha e RBAC de 3 perfis no backend; ações auditadas |
| RF09 | Importar fontes externas (IBGE, ANEEL) | Baixa | ◐ | IBGE e ANEEL via APIs públicas com testes simulados; CEP/ViaCEP auxiliar. A disponibilidade real das APIs externas depende da rede no ambiente de execução. |
| RF10 | Histórico de simulações | Baixa | ✅ | `GET /api/simulacoes`, tela *Resultados* (reabrir simulação) |

## Requisitos Não Funcionais (Cap. 2)
| ID | Descrição | Status | Evidência |
|---|---|---|---|
| RNF01 | TOPSIS < 3 s para 500 alternativas | ✅ | Medido ponta a ponta (HTTP + PostgreSQL, 500 × 7 critérios): **≈ 60–75 ms** (`npm run test:db`) |
| RNF02 | Interface responsiva | ◐ | Grid/flex Tailwind, menu mobile. Verificado em desktop (1366×900); tablet/mobile **não testados automaticamente** |
| RNF03 | Disponibilidade ≥ 99,5% | ◐ | Healthchecks + `restart: unless-stopped`. O percentual depende da infraestrutura de produção e **não pode ser comprovado** aqui |
| RNF04 | JWT + bcrypt | ✅ | JWT em cookie httpOnly/SameSite=Strict; bcrypt custo ≥ 10 (padrão 12) |
| RNF05 | Cobertura de testes ≥ 80% | ◐ | **Back-end**: ≥ 99% de statements nas camadas controllers/services/middlewares/routes (limiar 80% imposto no `npm test`); `models` cobertos pelos testes com banco real. **Front-end**: apenas funções puras testadas (TOPSIS e sanitização) – cobertura ≥ 80% **não atingida** |
| RNF06 | Swagger/OpenAPI | ✅ | `/api/docs` (UI) e `docs/api/openapi.yaml` |

## Stakeholders (Cap. 3) → atendimento
| Stakeholder | Interesse | Como é atendido |
|---|---|---|
| Gestor Público | Identificar comunidades vulneráveis | Ranking, mapa, relatórios (UC03, UC04) |
| Pesquisador | Analisar correlações entre indicadores | Configuração de critérios/pesos, radar, histórico (UC02, UC03) |
| Comunidade | Acesso a energia limpa | Beneficiária indireta: indicadores C1–C7 priorizam os municípios mais vulneráveis |
| Equipe de Desenvolvimento | Software funcional e documentado | Código, testes, Swagger, UML, manual |
| Professor orientador | Rigor metodológico | Algoritmo do Cap. 7.2 fiel ao roteiro, validado com o exemplo 7.3 |

## Experiência por perfil (Cap. 3, 4.1 e 8) – cada ator tem painel, menu e regras próprios
| | **Administrador** | **Pesquisador** | **Gestor Público** |
|---|---|---|---|
| Interesse (Cap. 3) | Administrar o sistema | *Analisar correlações entre indicadores* | *Identificar comunidades vulneráveis para políticas públicas* |
| Painel inicial | **Painel Administrativo**: usuários, municípios, critérios, saúde dos dados, últimos eventos de auditoria | **Painel de Pesquisa**: matriz de correlação (Pearson), correlação de cada indicador com o Ci, soma dos pesos | **Painel de Gestão**: faixas de vulnerabilidade, prioridades de ação, ranking, mapa |
| Casos de uso | UC01 Cadastrar Município · Gerenciar Usuários · Auditoria | UC02 Configurar Critérios · UC03 · Análise/Comparação | UC03 Executar TOPSIS · UC04 Gerar Relatório |
| Telas exclusivas | Municípios (cadastro), Usuários, Auditoria | Configuração (editar tipo/peso e **salvar configuração oficial**), Análise de indicadores | **Executar TOPSIS** (dataset + pesos oficiais somente leitura), Resumo executivo em Resultados |
| Pesos e tipos | Edita | Edita e salva a configuração oficial | **Somente leitura**: o servidor usa sempre a configuração oficial e ignora a enviada |
| Cadastro de municípios | Sim | Somente leitura | Somente leitura |
| Identidade visual | cabeçalho escuro/âmbar | cabeçalho azul | cabeçalho verde-petróleo |

## Perfis × casos de uso (Cap. 4.1)
| Caso de uso | Roteiro | Implementação (RBAC no servidor e na interface) |
|---|---|---|
| UC01 Cadastrar Município | Administrador | admin |
| UC02 Configurar Critérios | Pesquisador | pesquisador, admin |
| UC03 Executar TOPSIS | Pesquisador, Gestor | pesquisador, gestor, admin (gestor: pesos oficiais) |
| UC04 Gerar Relatório | Gestor Público | gestor, pesquisador, admin |
| Gerenciar Usuários · Auditoria | – | admin |
| Análise de correlações e comparação de unidades | (Cap. 1 e 3) | pesquisador, admin |

O **Administrador** herda os papéis de Pesquisador e Gestor (generalização de ator no diagrama de casos de uso).
