const prisma = require('../lib/prisma');

async function listarTodos() {
    return prisma.municipio.findMany({
        orderBy: {
            nome: 'asc'
        }
    });
}

async function buscarPorId(id) {
    return prisma.municipio.findUnique({
        where: {
            id
        }
    });
}

async function criar(dados) {
    return prisma.municipio.create({
        data: dados
    });
}

async function atualizar(id, dados) {
    return prisma.municipio.update({
        where: {
            id
        },
        data: dados
    });
}

async function remover(id) {
    return prisma.municipio.delete({
        where: {
            id
        }
    });
}

module.exports = {
    listarTodos,
    buscarPorId,
    criar,
    atualizar,
    remover
};