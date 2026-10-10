# Qualidade ISO/IEC 25010 (Cap. 11) – metas e medições

| Característica | Sub-característica | Métrica | Meta | Medido / situação |
|---|---|---|---|---|
| Adequação Funcional | Completude | % requisitos implementados | ≥ 90% | 8 de 10 RF totalmente atendidos; 2 parciais (RF08, RF09) → **80% completos, 100% ao menos parciais** (ver `requisitos.md`) |
| Eficiência de Desempenho | Tempo de resposta | Cálculo TOPSIS | < 3 s | **≈ 60–75 ms** (500 alternativas × 7 critérios, HTTP + PostgreSQL) |
| Usabilidade | Aprendizado | Tempo da 1ª tarefa | < 5 min | **Não medido** (requer teste com usuários) |
| Confiabilidade | Disponibilidade | Uptime mensal | ≥ 99,5% | **Não mensurável** fora de produção; healthchecks e restart configurados |
| Segurança | Confidencialidade | Dados protegidos por auth | 100% | 100% das rotas de dados exigem sessão (teste: 401 sem cookie); RBAC, CSRF, auditoria testados |
| Manutenibilidade | Modularidade | Acoplamento entre módulos | Baixo | Camadas Rotas → Controllers → Services → Models; serviço TOPSIS sem dependência de banco (injeção do repositório) |
| Portabilidade | Adaptabilidade | Funciona em 3+ navegadores | Chrome, Firefox, Safari | Verificado **somente em Chromium**; Firefox/Safari não testados |
