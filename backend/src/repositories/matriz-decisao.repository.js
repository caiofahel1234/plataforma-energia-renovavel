const prisma = require('../lib/prisma');

async function listarTodos() {
    return prisma.matrizDecisao.findMany({
        orderBy: {
            id: 'asc'
        },
        include: {
            municipio: true,
            criterio: true
        }
    });
}

async function buscarPorId(id) {
    return prisma.matrizDecisao.findUnique({
        where: {
            id
        },
        include: {
            municipio: true,
            criterio: true
        }
    });
}

async function criar(dados) {
    return prisma.matrizDecisao.create({
        data: dados,
        include: {
            municipio: true,
            criterio: true
        }
    });
}

async function atualizar(id, dados) {
    return prisma.matrizDecisao.update({
        where: {
            id
        },
        data: dados,
        include: {
            municipio: true,
            criterio: true
        }
    });
}

async function remover(id) {
    return prisma.matrizDecisao.delete({
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