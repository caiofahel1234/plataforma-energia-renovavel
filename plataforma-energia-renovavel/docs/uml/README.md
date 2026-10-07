# Diagramas UML (Cap. 4)
Fonte em Mermaid (`.mmd`) + imagem (`.png`). Para regenerar: abra o `.mmd` em https://mermaid.live ou use `mermaid-cli`. Cada arquivo traz o tema embutido (texto escuro sobre fundo claro).

| Diagrama | Arquivo | Requisitos / seção do roteiro |
|---|---|---|
| Casos de Uso (obrigatório) | `01-casos-de-uso` | 4.1 · RF01–RF10 |
| Fluxos específicos UC01–UC04 | `01b` … `01e` | 4.1 (fluxos textuais dos UC) |
| Classes (obrigatório) | `02-classes` | 4.2 · Cap. 6 (banco) |
| Sequência – Executar TOPSIS (obrigatório) | `03-sequencia-executar-topsis` | 4.3 · RF04, RNF04 |
| Atividades – Fluxo TOPSIS | `04-atividades-fluxo-topsis` | 4.4 · Cap. 7.2 |
| Componentes | `05-componentes` | 4.5 · Cap. 5 |
| Implantação | `06-implantacao` | 4.6 · RNF03, Cap. 13 |

## Correções feitas na versão anterior dos diagramas
- **Casos de uso:** os rótulos `<<include>>/<<extend>>` apareciam como `&lt;&gt;` (o texto era removido como tag HTML) → agora `«include»`, `«extend»`, `«herda»`. "Autenticar" passou a ser pré-condição (como no UC01 do roteiro), reduzindo de 31 para 21 relações; a relação do Administrador com os demais passou a ser por generalização de ator.
- **Sequência:** o texto das mensagens estava invisível (cor clara sobre fundo branco) e os fragmentos `alt` não tinham condição → mensagens legíveis e fragmentos `break` com a condição. `salvarSimulacao` passou de *API → BD* para *TopsisService → BD*, como no roteiro (e o código foi alinhado).
- **Classes:** atributos estavam `+` (públicos); o roteiro usa `-`. Cardinalidades completas (`1`, `0..*`, `1..*`), composição Simulação ◆ Resultado, relação Simulação → Matriz do roteiro e método `salvarSimulacao`.
- **Componentes:** a interface REST/JSON estava entre API e Controllers; agora fica entre Frontend e Backend, como no roteiro; adicionados middlewares de segurança, Relatórios, Auditoria e DataImport→IBGE.
- **Implantação:** adicionados TLS/HTTPS, portas, as 3 redes isoladas (a do banco com `internal: true`) e a saída HTTPS da API.
- **Atividades e fluxo UC01:** já estavam conforme o roteiro; mantidos (fluxo UC01 ganhou o ramo de erro de validação e a auditoria).
