const matrizDecisaoRepository = require('../repositories/matriz-decisao.repository');
const municipioRepository = require('../repositories/municipio.repository');
const criterioRepository = require('../repositories/criterio.repository');

async function listarMatriz() {
    return matrizDecisaoRepository.listarTodos();
}

async function buscarMatriz(id) {
    const registro = await matrizDecisaoRepository.buscarPorId(id);

    if (!registro) {
        const erro = new Error('Registro da matriz de decisão não encontrado');
        erro.status = 404;
        throw erro;
    }

    return registro;
}

async function criarMatriz(dados) {
    const { municipioId, criterioId, valor, anoReferencia } = dados;

    if (!municipioId || !criterioId || valor === undefined) {
        const erro = new Error(
            'Município, critério e valor são obrigatórios'
        );
        erro.status = 400;
        throw erro;
    }

    const municipio = await municipioRepository.buscarPorId(
        Number(municipioId)
    );

    if (!municipio) {
        const erro = new Error('Município não encontrado');
        erro.status = 404;
        throw erro;
    }

    const criterio = await criterioRepository.buscarPorId(
        Number(criterioId)
    );

    if (!criterio) {
        const erro = new Error('Critério não encontrado');
        erro.status = 404;
        throw erro;
    }

    if (Number.isNaN(Number(valor))) {
        const erro = new Error('Valor deve ser numérico');
        erro.status = 400;
        throw erro;
    }

    return matrizDecisaoRepository.criar({
        municipioId: Number(municipioId),
        criterioId: Number(criterioId),
        valor: Number(valor),
        anoReferencia: anoReferencia
            ? Number(anoReferencia)
            : null
    });
}

async function atualizarMatriz(id, dados) {
    await buscarMatriz(id);

    const dadosAtualizacao = {};

    if (dados.valor !== undefined) {
        if (Number.isNaN(Number(dados.valor))) {
            const erro = new Error('Valor deve ser numérico');
            erro.status = 400;
            throw erro;
        }

        dadosAtualizacao.valor = Number(dados.valor);
    }

    if (dados.anoReferencia !== undefined) {
        dadosAtualizacao.anoReferencia = dados.anoReferencia
            ? Number(dados.anoReferencia)
            : null;
    }

    return matrizDecisaoRepository.atualizar(
        id,
        dadosAtualizacao
    );
}

async function removerMatriz(id) {
    await buscarMatriz(id);

    return matrizDecisaoRepository.remover(id);
}

async function importarMatriz(dados) {
    if (!Array.isArray(dados) || dados.length === 0) {
        const erro = new Error(
            'A lista de dados para importação deve ser informada'
        );
        erro.status = 400;
        throw erro;
    }

    for (const item of dados) {
        if (
            !item.municipioId ||
            !item.criterioId ||
            item.valor === undefined
        ) {
            const erro = new Error(
                'Cada registro deve possuir municipioId, criterioId e valor'
            );
            erro.status = 400;
            throw erro;
        }

        const municipio = await municipioRepository.buscarPorId(
            Number(item.municipioId)
        );

        if (!municipio) {
            const erro = new Error(
                `Município ${item.municipioId} não encontrado`
            );
            erro.status = 404;
            throw erro;
        }

        const criterio = await criterioRepository.buscarPorId(
            Number(item.criterioId)
        );

        if (!criterio) {
            const erro = new Error(
                `Critério ${item.criterioId} não encontrado`
            );
            erro.status = 404;
            throw erro;
        }

        if (Number.isNaN(Number(item.valor))) {
            const erro = new Error(
                'Todos os valores devem ser numéricos'
            );
            erro.status = 400;
            throw erro;
        }
    }

    const registros = dados.map((item) => ({
        municipioId: Number(item.municipioId),
        criterioId: Number(item.criterioId),
        valor: Number(item.valor),
        anoReferencia: item.anoReferencia
            ? Number(item.anoReferencia)
            : null
    }));

    return matrizDecisaoRepository.criarEmLote(registros);
}

module.exports = {
    listarMatriz,
    buscarMatriz,
    criarMatriz,
    atualizarMatriz,
    removerMatriz,
    importarMatriz
};