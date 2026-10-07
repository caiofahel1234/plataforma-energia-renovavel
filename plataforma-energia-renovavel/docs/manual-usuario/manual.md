# Manual do Usuário – Plataforma de Vulnerabilidade Social Energética (TOPSIS)

## 1. Acesso
1. Abra o endereço da plataforma (ex.: `https://localhost`) e entre com **e-mail e senha** fornecidos pelo Administrador.
2. Após 5 tentativas erradas a conta é bloqueada por 15 minutos. A sessão expira em 30 minutos de inatividade.
3. Para sair, use o ícone de saída no canto superior direito.

## 2. Perfis
| Perfil | O que pode fazer |
|---|---|
| **Administrador** | Tudo: usuários, municípios, critérios, TOPSIS, relatórios |
| **Pesquisador** | Configurar critérios e pesos, executar TOPSIS, mapas, relatórios |
| **Gestor Público** | Executar TOPSIS, ver mapa e resultados, gerar relatórios |

## 2.1 O que cada perfil vê
Cada perfil entra em um **painel próprio**, com menu, cor de cabeçalho e telas diferentes:
- **Gestor Público** – *Painel de Gestão*: faixas de vulnerabilidade, prioridades de ação e ranking. Em **Executar TOPSIS** escolhe os municípios e executa com a **configuração oficial** de pesos (somente leitura). Em *Resultados e relatórios* vê o **resumo executivo** e exporta PDF/CSV.
- **Pesquisador** – *Painel de Pesquisa*: matriz de correlação entre indicadores. Em *Configurar critérios* ajusta tipos e pesos e usa **Salvar como configuração oficial** (é essa que o Gestor passa a usar). Em *Análise de indicadores* compara até 3 municípios (radar) e vê as correlações.
- **Administrador** – *Painel Administrativo*: usuários, municípios, completude da matriz e últimos eventos. Em *Municípios (cadastro)* cadastra e exclui; em *Usuários* gerencia perfis; em *Auditoria* consulta a trilha (login, alterações de parâmetros, exclusões, exportações, acessos negados).

Tentar abrir por endereço uma tela de outro perfil leva de volta ao seu painel (e o servidor também recusa a operação).

## 3. Telas
**Dashboard** – total de municípios, média de Ci, município mais vulnerável, capacidade solar instalada, gráfico do ranking e mini-mapa. Cores: vermelho = alta vulnerabilidade (Ci < 0,4), amarelo = média, verde = baixa (Ci ≥ 0,6). *Quanto maior o Ci, menos vulnerável.*

**Configuração TOPSIS** (Pesquisador/Admin edita critérios)
1. Para cada critério escolha o tipo (**Benefício**: quanto maior, melhor; **Custo**: quanto menor, melhor).
2. Ajuste os pesos nos controles deslizantes. O indicador **"Soma dos pesos"** precisa marcar **100%**; senão o botão *Executar TOPSIS* fica desabilitado.
3. Opcional: adicione ou exclua critérios.
4. Clique em **Executar TOPSIS**.

**Resultados** – tabela com posição, município, D+, D-, Ci; clique numa linha (ou use o seletor) para ver o **radar** do município contra a solução ideal. Exporte em **CSV** ou **PDF**. O **histórico** lista simulações anteriores; **Reabrir** restaura parâmetros e resultado.

**Municípios** (cadastro: Administrador) – preencha nome, UF, população, IDH, latitude/longitude e os valores de cada critério. Com a API ativa, use **Buscar** com o código IBGE (7 dígitos) ou CEP (8 dígitos) para preencher nome/UF/população. **Importar**: CSV (`nome,uf,populacao,lat,lng,C1..Cn`) ou JSON, até 1 MB / 500 linhas; registros inválidos são descartados.

**Mapa** – marcadores coloridos pela faixa de Ci; clique para ver posição, Ci e indicador crítico. Marque **Camada de calor** para ver a concentração de vulnerabilidade; escolha um critério para o raio dos marcadores e o calor refletirem aquele indicador.

**Usuários** (Administrador) – crie usuários com perfil. A senha deve ter **12+ caracteres, com maiúscula, minúscula, número e símbolo**.

## 4. Mensagens de erro
Por segurança, os erros são genéricos (ex.: "Credenciais inválidas", "Você não tem permissão"). Ao relatar um problema, informe a hora e o `requestId` quando exibido.

## 5. Perguntas frequentes
- **Por que o botão Executar está desabilitado?** A soma dos pesos não é 100% ou há menos de 2 critérios.
- **Por que não vejo "Usuários" ou o formulário de município?** Seu perfil não tem essa permissão.
- **O mapa está cinza.** O fundo do mapa (OpenStreetMap) exige acesso à internet.
