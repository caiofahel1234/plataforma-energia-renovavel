// Cap. 10: Usuário cadastra município → executa TOPSIS → vê ranking
describe('Fluxo E2E', () => {
  it('cadastra município, executa TOPSIS e vê o ranking', () => {
    cy.visit('/login')
    cy.get('input[type=email]').type('admin@demo.local'); cy.get('input[type=password]').type('qualquer-senha')
    cy.get('select').select('admin'); cy.contains('button', 'Entrar').click()
    cy.contains('Ranking de Vulnerabilidade')
    cy.contains('a', 'Municípios').click()
    ;['Município Teste', 'BA', '5000', '0.6', '-12.3', '-38.1', '3', '0.01', '900', '0.9', '5.5', '10', '5'].forEach((v, i) => cy.get('form input').eq(i).type(v))
    cy.contains('button', 'Cadastrar').click(); cy.contains('Município cadastrado'); cy.contains('td', 'Município Teste')
    cy.contains('a', 'Configuração TOPSIS').click(); cy.contains('Soma dos pesos: 100%')
    cy.contains('button', 'Executar TOPSIS').click(); cy.url().should('include', '/resultados')
    cy.contains('td', 'Município Teste'); cy.contains('th', 'Pos.')
  })
  it('bloqueia rotas sem autenticação', () => { cy.visit('/configuracao'); cy.url().should('include', '/login') })
})
