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

async function atualizarPesos(pesos) {
    if (!Array.isArray(pesos) || pesos.length === 0) {
        const erro = new Error(
            'A lista de pesos deve ser informada'
        );
        erro.status = 400;
        throw erro;
    }

    const somaPesos = pesos.reduce(
        (soma, item) => soma + Number(item.peso),
        0
    );

    if (
        pesos.some(
            (item) =>
                !Number.isInteger(Number(item.criterioId)) ||
                !Number.isFinite(Number(item.peso)) ||
                Number(item.peso) <= 0
        )
    ) {
        const erro = new Error(
            'Todos os critérios devem possuir pesos maiores que zero'
        );
        erro.status = 400;
        throw erro;
    }

    if (Math.abs(somaPesos - 1) > 0.001) {
        const erro = new Error(
            `A soma dos pesos deve ser 1. Soma atual: ${somaPesos.toFixed(4)}`
        );
        erro.status = 400;
        throw erro;
    }

    for (const item of pesos) {
        await buscarCriterio(Number(item.criterioId));
    }

    const resultados = [];

    for (const item of pesos) {
        const criterio = await criterioRepository.atualizar(
            Number(item.criterioId),
            {
                peso: Number(item.peso)
            }
        );

        resultados.push(criterio);
    }

    return resultados;
}

module.exports = {
    listarCriterios,
    buscarCriterio,
    criarCriterio,
    atualizarCriterio,
    removerCriterio,
    atualizarPesos
};