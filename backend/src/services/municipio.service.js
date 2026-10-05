const municipioRepository = require('../repositories/municipio.repository');

async function listarMunicipios() {
    return municipioRepository.listarTodos();
}

async function buscarMunicipio(id) {
    const municipio = await municipioRepository.buscarPorId(id);

    if (!municipio) {
        const erro = new Error('Município não encontrado');
        erro.status = 404;
        throw erro;
    }

    return municipio;
}

async function criarMunicipio(dados) {
    if (!dados.nome || !dados.uf) {
        const erro = new Error('Nome e UF são obrigatórios');
        erro.status = 400;
        throw erro;
    }

    if (dados.uf.length !== 2) {
        const erro = new Error('UF deve possuir 2 caracteres');
        erro.status = 400;
        throw erro;
    }

    return municipioRepository.criar({
        nome: dados.nome,
        uf: dados.uf.toUpperCase(),
        populacao: dados.populacao ?? null,
        idh: dados.idh ?? null
    });
}

async function atualizarMunicipio(id, dados) {
    await buscarMunicipio(id);

    return municipioRepository.atualizar(id, {
        nome: dados.nome,
        uf: dados.uf?.toUpperCase(),
        populacao: dados.populacao,
        idh: dados.idh
    });
}

async function removerMunicipio(id) {
    await buscarMunicipio(id);

    return municipioRepository.remover(id);
}

module.exports = {
    listarMunicipios,
    buscarMunicipio,
    criarMunicipio,
    atualizarMunicipio,
    removerMunicipio
};