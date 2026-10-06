const express = require('express');
const cors = require('cors');
const helmet = require('helmet');

const errorMiddleware = require('./middlewares/error.middleware');
const municipioRoutes = require('./routes/municipio.routes');
const criterioRoutes = require('./routes/criterio.routes');
const matrizDecisaoRoutes = require('./routes/matriz-decisao.routes');
const topsisRoutes = require('./routes/topsis.routes');
const simulacaoRoutes = require('./routes/simulacao.routes');
const authRoutes = require('./routes/auth.routes');
const configurarSwagger = require('./docs/swagger');
const relatorioRoutes = require('./routes/relatorio.routes');
const importacaoRoutes = require('./routes/importacao.routes');

const app = express();

configurarSwagger(app);

app.use(helmet());

app.use(cors());

app.use(express.json());

app.get('/', (req, res) => {
    res.json({
        mensagem: 'API da Plataforma de Energia Renovável'
    });
});

app.get('/health', (req, res) => {
    res.status(200).json({
        status: 'ok',
        mensagem: 'API funcionando'
    });
});


app.get('/teste-erro', (req, res, next) => {
    const erro = new Error('Erro de teste');
    erro.statusCode = 400;

    next(erro);
});

app.use('/api/municipios', municipioRoutes);
app.use('/api/criterios', criterioRoutes);
app.use('/api/matriz-decisao', matrizDecisaoRoutes);
app.use('/api/topsis', topsisRoutes);
app.use('/api/simulacoes', simulacaoRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/relatorios', relatorioRoutes);
app.use('/api/importacoes', importacaoRoutes);

app.use(errorMiddleware);

module.exports = app;