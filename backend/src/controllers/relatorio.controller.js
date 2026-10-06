const prisma = require('../lib/prisma');

async function exportarCSV(req, res, next) {
    try {
        const id = Number(req.params.id);

        if (!Number.isInteger(id)) {
            return res.status(400).json({
                error: 'ID da simulação inválido'
            });
        }

        const simulacao = await prisma.simulacao.findUnique({
            where: { id },
            include: {
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

        const linhas = [
            [
                'Posição',
                'Município',
                'UF',
                'Coeficiente TOPSIS',
                'Distância Positiva',
                'Distância Negativa'
            ]
        ];

        for (const resultado of simulacao.resultados) {
            linhas.push([
                resultado.posicao,
                resultado.municipio.nome,
                resultado.municipio.uf,
                resultado.coeficienteCi,
                resultado.distanciaPositiva,
                resultado.distanciaNegativa
            ]);
        }

        const csv = linhas
            .map((linha) =>
                linha
                    .map((valor) => `"${String(valor).replace(/"/g, '""')}"`)
                    .join(';')
            )
            .join('\n');

        res.setHeader(
            'Content-Type',
            'text/csv; charset=utf-8'
        );

        res.setHeader(
            'Content-Disposition',
            `attachment; filename="simulacao-${id}.csv"`
        );

        res.send('\uFEFF' + csv);
    } catch (erro) {
        next(erro);
    }
}

async function exportarPDF(req, res, next) {
    try {
        const id = Number(req.params.id);

        if (!Number.isInteger(id)) {
            return res.status(400).json({
                error: 'ID da simulação inválido'
            });
        }

        const simulacao = await prisma.simulacao.findUnique({
            where: { id },
            include: {
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

        const PDFDocument = require('pdfkit');

        const documento = new PDFDocument({
            margin: 50
        });

        res.setHeader('Content-Type', 'application/pdf');

        res.setHeader(
            'Content-Disposition',
            `attachment; filename="simulacao-${id}.pdf"`
        );

        documento.pipe(res);

        documento
            .fontSize(20)
            .text('Plataforma de Energia Renovável', {
                align: 'center'
            });

        documento.moveDown();

        documento
            .fontSize(16)
            .text('Resultado da Simulação TOPSIS', {
                align: 'center'
            });

        documento.moveDown();

        documento
            .fontSize(11)
            .text(`Simulação: ${simulacao.id}`);

        documento.text(
            `Data: ${simulacao.dataExecucao.toLocaleString('pt-BR')}`
        );

        documento.text(`Status: ${simulacao.status}`);

        documento.moveDown();

        documento.fontSize(13).text('Ranking');

        documento.moveDown();

        for (const resultado of simulacao.resultados) {
            documento
                .fontSize(11)
                .text(
                    `${resultado.posicao}º - ${resultado.municipio.nome} (${resultado.municipio.uf})`
                );

            documento.text(
                `Coeficiente TOPSIS: ${resultado.coeficienteCi}`
            );

            documento.text(
                `Distância positiva: ${resultado.distanciaPositiva}`
            );

            documento.text(
                `Distância negativa: ${resultado.distanciaNegativa}`
            );

            documento.moveDown();
        }

        documento.end();
    } catch (erro) {
        next(erro);
    }
}

module.exports = {
    exportarCSV,
    exportarPDF
};