const swaggerUi = require('swagger-ui-express');

const swaggerDocument = {
    openapi: '3.0.0',

    info: {
        title: 'Plataforma de Energia Renovável API',
        version: '1.0.0',
        description:
            'API da Plataforma de Energia Renovável com análise multicritério TOPSIS'
    },

    servers: [
        {
            url: 'http://localhost:3000'
        }
    ],

    components: {
        securitySchemes: {
            bearerAuth: {
                type: 'http',
                scheme: 'bearer',
                bearerFormat: 'JWT'
            }
        }
    },

    paths: {
        // =========================
        // AUTENTICAÇÃO
        // =========================

        '/api/auth/registrar': {
            post: {
                summary: 'Cadastrar usuário',
                tags: ['Autenticação'],
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                required: ['nome', 'email', 'senha'],
                                properties: {
                                    nome: { type: 'string' },
                                    email: { type: 'string', format: 'email' },
                                    senha: { type: 'string', format: 'password' },
                                    perfil: { type: 'string' }
                                }
                            }
                        }
                    }
                },
                responses: {
                    201: { description: 'Usuário cadastrado' },
                    400: { description: 'Dados obrigatórios ausentes' },
                    409: { description: 'E-mail já cadastrado' }
                }
            }
        },

        '/api/auth/login': {
            post: {
                summary: 'Realizar login',
                tags: ['Autenticação'],
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                required: ['email', 'senha'],
                                properties: {
                                    email: { type: 'string', format: 'email' },
                                    senha: { type: 'string', format: 'password' }
                                }
                            }
                        }
                    }
                },
                responses: {
                    200: { description: 'Login realizado com sucesso' },
                    400: { description: 'Dados obrigatórios ausentes' },
                    401: { description: 'E-mail ou senha inválidos' }
                }
            }
        },

        // =========================
        // MUNICÍPIOS
        // =========================

        '/api/municipios': {
            get: {
                summary: 'Listar municípios',
                tags: ['Municípios'],
                responses: {
                    200: { description: 'Lista de municípios' }
                }
            },

            post: {
                summary: 'Cadastrar município',
                tags: ['Municípios'],
                security: [{ bearerAuth: [] }],
                responses: {
                    201: { description: 'Município cadastrado' },
                    401: { description: 'Token inválido ou não informado' }
                }
            }
        },

        '/api/municipios/mapa': {
            get: {
                summary: 'Listar municípios com coordenadas',
                tags: ['Municípios'],
                security: [{ bearerAuth: [] }],
                responses: {
                    200: { description: 'Municípios georreferenciados' },
                    401: { description: 'Token inválido ou não informado' }
                }
            }
        },

        '/api/municipios/{id}': {
            get: {
                summary: 'Buscar município por ID',
                tags: ['Municípios'],
                parameters: [
                    {
                        name: 'id',
                        in: 'path',
                        required: true,
                        schema: { type: 'integer' }
                    }
                ],
                responses: {
                    200: { description: 'Município encontrado' },
                    404: { description: 'Município não encontrado' }
                }
            },

            put: {
                summary: 'Atualizar município',
                tags: ['Municípios'],
                security: [{ bearerAuth: [] }],
                parameters: [
                    {
                        name: 'id',
                        in: 'path',
                        required: true,
                        schema: { type: 'integer' }
                    }
                ],
                responses: {
                    200: { description: 'Município atualizado' },
                    401: { description: 'Token inválido ou não informado' },
                    404: { description: 'Município não encontrado' }
                }
            },

            delete: {
                summary: 'Remover município',
                tags: ['Municípios'],
                security: [{ bearerAuth: [] }],
                parameters: [
                    {
                        name: 'id',
                        in: 'path',
                        required: true,
                        schema: { type: 'integer' }
                    }
                ],
                responses: {
                    204: { description: 'Município removido' },
                    401: { description: 'Token inválido ou não informado' },
                    404: { description: 'Município não encontrado' }
                }
            }
        },

        '/api/municipios/{id}/coordenadas': {
            patch: {
                summary: 'Atualizar coordenadas do município',
                tags: ['Municípios'],
                security: [{ bearerAuth: [] }],
                parameters: [
                    {
                        name: 'id',
                        in: 'path',
                        required: true,
                        schema: { type: 'integer' }
                    }
                ],
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                required: ['latitude', 'longitude'],
                                properties: {
                                    latitude: { type: 'number' },
                                    longitude: { type: 'number' }
                                }
                            }
                        }
                    }
                },
                responses: {
                    200: { description: 'Coordenadas atualizadas' },
                    400: { description: 'Coordenadas inválidas' },
                    401: { description: 'Token inválido ou não informado' },
                    404: { description: 'Município não encontrado' }
                }
            }
        },

        // =========================
        // CRITÉRIOS
        // =========================

        '/api/criterios': {
            get: {
                summary: 'Listar critérios',
                tags: ['Critérios'],
                responses: {
                    200: { description: 'Lista de critérios' }
                }
            },

            post: {
                summary: 'Cadastrar critério',
                tags: ['Critérios'],
                security: [{ bearerAuth: [] }],
                responses: {
                    201: { description: 'Critério cadastrado' },
                    401: { description: 'Token inválido ou não informado' }
                }
            }
        },

        '/api/criterios/pesos': {
            put: {
                summary: 'Atualizar pesos dos critérios',
                tags: ['Critérios'],
                security: [{ bearerAuth: [] }],
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: {
                                type: 'array',
                                items: {
                                    type: 'object',
                                    properties: {
                                        criterioId: { type: 'integer' },
                                        peso: { type: 'number' }
                                    }
                                }
                            }
                        }
                    }
                },
                responses: {
                    200: { description: 'Pesos atualizados' },
                    400: { description: 'Pesos inválidos' },
                    401: { description: 'Token inválido ou não informado' },
                    403: { description: 'Usuário sem permissão' }
                }
            }
        },

        '/api/criterios/{id}': {
            get: {
                summary: 'Buscar critério por ID',
                tags: ['Critérios'],
                parameters: [
                    {
                        name: 'id',
                        in: 'path',
                        required: true,
                        schema: { type: 'integer' }
                    }
                ],
                responses: {
                    200: { description: 'Critério encontrado' },
                    404: { description: 'Critério não encontrado' }
                }
            },

            put: {
                summary: 'Atualizar critério',
                tags: ['Critérios'],
                security: [{ bearerAuth: [] }],
                parameters: [
                    {
                        name: 'id',
                        in: 'path',
                        required: true,
                        schema: { type: 'integer' }
                    }
                ],
                responses: {
                    200: { description: 'Critério atualizado' },
                    401: { description: 'Token inválido ou não informado' },
                    404: { description: 'Critério não encontrado' }
                }
            },

            delete: {
                summary: 'Remover critério',
                tags: ['Critérios'],
                security: [{ bearerAuth: [] }],
                parameters: [
                    {
                        name: 'id',
                        in: 'path',
                        required: true,
                        schema: { type: 'integer' }
                    }
                ],
                responses: {
                    204: { description: 'Critério removido' },
                    401: { description: 'Token inválido ou não informado' },
                    404: { description: 'Critério não encontrado' }
                }
            }
        },

        // =========================
        // MATRIZ DE DECISÃO
        // =========================

        '/api/matriz-decisao': {
            get: {
                summary: 'Listar matriz de decisão',
                tags: ['Matriz de Decisão'],
                security: [{ bearerAuth: [] }],
                responses: {
                    200: { description: 'Dados da matriz de decisão' },
                    401: { description: 'Token inválido ou não informado' }
                }
            },

            post: {
                summary: 'Cadastrar valor na matriz de decisão',
                tags: ['Matriz de Decisão'],
                security: [{ bearerAuth: [] }],
                responses: {
                    201: { description: 'Valor cadastrado' },
                    400: { description: 'Dados inválidos' },
                    401: { description: 'Token inválido ou não informado' }
                }
            }
        },

        '/api/matriz-decisao/importar': {
            post: {
                summary: 'Importar dados para a matriz de decisão',
                tags: ['Matriz de Decisão'],
                security: [{ bearerAuth: [] }],
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                properties: {
                                    dados: {
                                        type: 'array',
                                        items: {
                                            type: 'object'
                                        }
                                    }
                                }
                            }
                        }
                    }
                },
                responses: {
                    201: { description: 'Dados importados com sucesso' },
                    400: { description: 'Dados inválidos' },
                    401: { description: 'Token inválido ou não informado' }
                }
            }
        },

        '/api/matriz-decisao/{id}': {
            get: {
                summary: 'Buscar registro da matriz por ID',
                tags: ['Matriz de Decisão'],
                security: [{ bearerAuth: [] }],
                parameters: [
                    {
                        name: 'id',
                        in: 'path',
                        required: true,
                        schema: { type: 'integer' }
                    }
                ],
                responses: {
                    200: { description: 'Registro encontrado' },
                    404: { description: 'Registro não encontrado' }
                }
            },

            put: {
                summary: 'Atualizar registro da matriz',
                tags: ['Matriz de Decisão'],
                security: [{ bearerAuth: [] }],
                parameters: [
                    {
                        name: 'id',
                        in: 'path',
                        required: true,
                        schema: { type: 'integer' }
                    }
                ],
                responses: {
                    200: { description: 'Registro atualizado' },
                    404: { description: 'Registro não encontrado' }
                }
            },

            delete: {
                summary: 'Remover registro da matriz',
                tags: ['Matriz de Decisão'],
                security: [{ bearerAuth: [] }],
                parameters: [
                    {
                        name: 'id',
                        in: 'path',
                        required: true,
                        schema: { type: 'integer' }
                    }
                ],
                responses: {
                    204: { description: 'Registro removido' },
                    404: { description: 'Registro não encontrado' }
                }
            }
        },

        // =========================
        // TOPSIS
        // =========================

        '/api/topsis/executar': {
            post: {
                summary: 'Executar análise TOPSIS',
                tags: ['TOPSIS'],
                security: [{ bearerAuth: [] }],
                responses: {
                    201: { description: 'TOPSIS executado com sucesso' },
                    401: { description: 'Token inválido ou não informado' }
                }
            }
        },

        // =========================
        // SIMULAÇÕES
        // =========================

        '/api/simulacoes/{id}': {
            get: {
                summary: 'Consultar uma simulação',
                tags: ['Simulações'],
                security: [{ bearerAuth: [] }],
                parameters: [
                    {
                        name: 'id',
                        in: 'path',
                        required: true,
                        schema: { type: 'integer' }
                    }
                ],
                responses: {
                    200: { description: 'Simulação encontrada' },
                    400: { description: 'ID inválido' },
                    401: { description: 'Token inválido ou não informado' },
                    404: { description: 'Simulação não encontrada' }
                }
            }
        },

        // =========================
        // RELATÓRIOS
        // =========================

        '/api/relatorios/{id}/csv': {
            get: {
                summary: 'Exportar resultado da simulação em CSV',
                tags: ['Relatórios'],
                security: [{ bearerAuth: [] }],
                parameters: [
                    {
                        name: 'id',
                        in: 'path',
                        required: true,
                        schema: { type: 'integer' }
                    }
                ],
                responses: {
                    200: { description: 'Arquivo CSV gerado' },
                    401: { description: 'Token inválido ou não informado' },
                    404: { description: 'Simulação não encontrada' }
                }
            }
        },

        '/api/relatorios/{id}/pdf': {
            get: {
                summary: 'Exportar resultado da simulação em PDF',
                tags: ['Relatórios'],
                security: [{ bearerAuth: [] }],
                parameters: [
                    {
                        name: 'id',
                        in: 'path',
                        required: true,
                        schema: { type: 'integer' }
                    }
                ],
                responses: {
                    200: { description: 'Arquivo PDF gerado' },
                    401: { description: 'Token inválido ou não informado' },
                    404: { description: 'Simulação não encontrada' }
                }
            }
        },

        // =========================
        // IMPORTAÇÃO
        // =========================

        '/api/importacao/ibge/{criterioId}': {
            post: {
                summary: 'Importar dados do IBGE',
                tags: ['Importação'],
                security: [{ bearerAuth: [] }],
                parameters: [
                    {
                        name: 'criterioId',
                        in: 'path',
                        required: true,
                        schema: { type: 'integer' }
                    }
                ],
                responses: {
                    200: { description: 'Dados do IBGE importados' },
                    401: { description: 'Token inválido ou não informado' }
                }
            }
        },

        '/api/importacao/aneel/{criterioId}': {
            post: {
                summary: 'Importar dados da ANEEL',
                tags: ['Importação'],
                security: [{ bearerAuth: [] }],
                parameters: [
                    {
                        name: 'criterioId',
                        in: 'path',
                        required: true,
                        schema: { type: 'integer' }
                    }
                ],
                responses: {
                    200: { description: 'Dados da ANEEL importados' },
                    401: { description: 'Token inválido ou não informado' }
                }
            }
        }
    }
};

function configurarSwagger(app) {
    app.use(
        '/api-docs',
        swaggerUi.serve,
        swaggerUi.setup(swaggerDocument)
    );
}

module.exports = configurarSwagger;