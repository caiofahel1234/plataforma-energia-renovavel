const prisma = require('../lib/prisma');

async function buscarPorId(req, res, next) {
    try {
        const id = Number(req.params.id);

        if (!Number.isInteger(id)) {
            return res.status(400).json({
                error: 'ID da simulação inválido'
            });
        }

        const simulacao = await prisma.simulacao.findUnique({
            where: {
                id
            },
            include: {
                usuario: {
                    select: {
                        id: true,
                        nome: true,
                        email: true,
                        perfil: true
                    }
                },
                resultados: {
                    orderBy: {
                        posicao: 'asc'
                    },
                    include: {
                        municipio: true
                    }
                }
            }
        });

        if (!simulacao) {
            return res.status(404).json({
                error: 'Simulação não encontrada'
            });
        }

        res.json(simulacao);
    } catch (erro) {
        next(erro);
    }
}

module.exports = {
    buscarPorId
};