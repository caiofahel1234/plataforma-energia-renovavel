function normalizarMatriz(matriz) {
    const quantidadeCriterios = matriz[0].length;
    const denominadores = [];

    for (let j = 0; j < quantidadeCriterios; j++) {
        let somaQuadrados = 0;

        for (let i = 0; i < matriz.length; i++) {
            somaQuadrados += matriz[i][j] ** 2;
        }

        denominadores[j] = Math.sqrt(somaQuadrados);
    }

    return matriz.map((linha) =>
        linha.map((valor, j) => {
            if (denominadores[j] === 0) {
                return 0;
            }

            return valor / denominadores[j];
        })
    );
}

function aplicarPesos(matrizNormalizada, pesos) {
    return matrizNormalizada.map((linha) =>
        linha.map((valor, j) => valor * pesos[j])
    );
}

function calcularIdeais(matrizPonderada, tipos) {
    const quantidadeCriterios = matrizPonderada[0].length;

    const idealPositivo = [];
    const idealNegativo = [];

    for (let j = 0; j < quantidadeCriterios; j++) {
        const valores = matrizPonderada.map((linha) => linha[j]);

        if (tipos[j] === 'beneficio') {
            idealPositivo[j] = Math.max(...valores);
            idealNegativo[j] = Math.min(...valores);
        } else {
            idealPositivo[j] = Math.min(...valores);
            idealNegativo[j] = Math.max(...valores);
        }
    }

    return {
        idealPositivo,
        idealNegativo
    };
}

function calcularDistancias(
    matrizPonderada,
    idealPositivo,
    idealNegativo
) {
    return matrizPonderada.map((linha) => {
        let somaPositiva = 0;
        let somaNegativa = 0;

        for (let j = 0; j < linha.length; j++) {
            somaPositiva += (linha[j] - idealPositivo[j]) ** 2;
            somaNegativa += (linha[j] - idealNegativo[j]) ** 2;
        }

        return {
            distanciaPositiva: Math.sqrt(somaPositiva),
            distanciaNegativa: Math.sqrt(somaNegativa)
        };
    });
}

function calcularCoeficientes(distancias) {
    return distancias.map((item) => {
        const denominador =
            item.distanciaPositiva + item.distanciaNegativa;

        if (denominador === 0) {
            return 0;
        }

        return item.distanciaNegativa / denominador;
    });
}

function calcularTOPSIS(matriz, pesos, tipos) {
    if (!matriz || matriz.length === 0) {
        throw new Error('Matriz de decisão vazia');
    }

    if (pesos.length !== matriz[0].length) {
        throw new Error('Quantidade de pesos incompatível com a matriz');
    }

    if (tipos.length !== matriz[0].length) {
        throw new Error('Quantidade de tipos incompatível com a matriz');
    }

    const matrizNormalizada = normalizarMatriz(matriz);

    const matrizPonderada = aplicarPesos(
        matrizNormalizada,
        pesos
    );

    const {
        idealPositivo,
        idealNegativo
    } = calcularIdeais(
        matrizPonderada,
        tipos
    );

    const distancias = calcularDistancias(
        matrizPonderada,
        idealPositivo,
        idealNegativo
    );

    const coeficientes = calcularCoeficientes(distancias);

    const ranking = coeficientes
        .map((coeficiente, indice) => ({
            indice,
            coeficiente
        }))
        .sort((a, b) => b.coeficiente - a.coeficiente);

    return {
        matrizNormalizada,
        matrizPonderada,
        idealPositivo,
        idealNegativo,
        distancias,
        coeficientes,
        ranking
    };
}

function prepararDadosTOPSIS(dados) {
    if (!dados || dados.length === 0) {
        throw new Error('Não existem dados na matriz de decisão');
    }

    const criteriosMap = new Map();
    const municipiosMap = new Map();

    for (const item of dados) {
        if (!criteriosMap.has(item.criterioId)) {
            criteriosMap.set(item.criterioId, {
                peso: Number(item.criterio.peso),
                tipo: item.criterio.tipo
            });
        }

        if (!municipiosMap.has(item.municipioId)) {
            municipiosMap.set(item.municipioId, {
                municipio: item.municipio,
                valores: new Map()
            });
        }

        municipiosMap
            .get(item.municipioId)
            .valores
            .set(item.criterioId, Number(item.valor));
    }

    const criterios = Array.from(criteriosMap.keys()).sort((a, b) => a - b);

const pesos = criterios.map(
    (criterioId) => criteriosMap.get(criterioId).peso
);

const tipos = criterios.map(
    (criterioId) => criteriosMap.get(criterioId).tipo
);

// Validação dos pesos
if (pesos.length === 0) {
    throw new Error('Nenhum critério encontrado');
}

if (
    pesos.some(
        (peso) => !Number.isFinite(peso) || peso <= 0
    )
) {
    throw new Error(
        'Todos os critérios devem possuir pesos maiores que zero'
    );
}

const somaPesos = pesos.reduce(
    (soma, peso) => soma + peso,
    0
);

if (Math.abs(somaPesos - 1) > 0.001) {
    throw new Error(
        `A soma dos pesos deve ser 1. Soma atual: ${somaPesos.toFixed(4)}`
    );
}

    const municipios = Array.from(municipiosMap.values());

    const matriz = municipios.map((item) =>
        criterios.map((criterioId) => {
            const valor = item.valores.get(criterioId);

            if (valor === undefined) {
                throw new Error(
                    `Município ${item.municipio.nome} não possui valor para o critério ${criterioId}`
                );
            }

            return valor;
        })
    );

    return {
        municipios: municipios.map((item) => item.municipio),
        matriz,
        pesos,
        tipos
    };
}

module.exports = {
    calcularTOPSIS,
    prepararDadosTOPSIS
};