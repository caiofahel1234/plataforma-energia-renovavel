const prisma = require('../lib/prisma');

async function atualizarCoordenadas(id, latitude, longitude) {
    const municipioId = Number(id);

    if (!Number.isInteger(municipioId)) {
        const erro = new Error('ID do município inválido');
        erro.status = 400;
        throw erro;
    }

    const lat = Number(latitude);
    const lng = Number(longitude);

    if (
        !Number.isFinite(lat) ||
        !Number.isFinite(lng) ||
        lat < -90 ||
        lat > 90 ||
        lng < -180 ||
        lng > 180
    ) {
        const erro = new Error('Latitude ou longitude inválida');
        erro.status = 400;
        throw erro;
    }

    const resultado = await prisma.$executeRaw`
        UPDATE municipios
        SET coordenadas = ST_SetSRID(
            ST_MakePoint(${lng}, ${lat}),
            4326
        )
        WHERE id = ${municipioId}
    `;

    if (resultado === 0) {
        const erro = new Error('Município não encontrado');
        erro.status = 404;
        throw erro;
    }

    return {
        message: 'Coordenadas atualizadas com sucesso'
    };
}

async function listarComCoordenadas() {
    return prisma.$queryRaw`
        SELECT
            id,
            nome,
            uf,
            populacao,
            idh,
            ST_Y(coordenadas) AS latitude,
            ST_X(coordenadas) AS longitude
        FROM municipios
        WHERE coordenadas IS NOT NULL
        ORDER BY nome ASC
    `;
}

module.exports = {
    atualizarCoordenadas,
    listarComCoordenadas
};