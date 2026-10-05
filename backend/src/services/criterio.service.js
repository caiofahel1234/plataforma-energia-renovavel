const criterioRepository = require('../repositories/criterio.repository');

async function listarCriterios() {
    return criterioRepository.listarTodos();
}

async function buscarCriterio(id) {
    const criterio = await criterioRepository.buscarPorId(id);

    if (!criterio) {
        const erro = new Error('Critério não encontrado');
        erro.status = 404;
        throw erro;
    }

    return criterio;
}

async function criarCriterio(dados) {
    if (!dados.nome || !dados.tipo) {
        const erro = new Error('Nome e tipo são obrigatórios');
        erro.status = 400;
        throw erro;
    }

    const tiposValidos = ['beneficio', 'custo'];

    if (!tiposValidos.includes(dados.tipo.toLowerCase())) {
        const erro = new Error('Tipo deve ser beneficio ou custo');
        erro.status = 400;
        throw erro;
    }

    return criterioRepository.criar({
        nome: dados.nome,
        descricao: dados.descricao ?? null,
        tipo: dados.tipo.toLowerCase(),
        peso: dados.peso ?? null,
        unidade: dados.unidade ?? null
    });
}

async function atualizarCriterio(id, dados) {
    await buscarCriterio(id);

    if (dados.tipo) {
        const tipo = dados.tipo.toLowerCase();

        if (!['beneficio', 'custo'].includes(tipo)) {
            const erro = new Error('Tipo deve ser beneficio ou custo');
            erro.status = 400;
            throw erro;
        }
    }

    return criterioRepository.atualizar(id, {
        nome: dados.nome,
        descricao: dados.descricao,
        tipo: dados.tipo?.toLowerCase(),
        peso: dados.peso,
        unidade: dados.unidade
    });
}

async function removerCriterio(id) {
    await buscarCriterio(id);

    return criterioRepository.remover(id);
}

module.exports = {
    listarCriterios,
    buscarCriterio,
    criarCriterio,
    atualizarCriterio,
    removerCriterio
};