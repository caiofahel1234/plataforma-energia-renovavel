const express = require('express');
const cors = require('cors');
const helmet = require('helmet');

const errorMiddleware = require('./middlewares/error.middleware');
const municipioRoutes = require('./routes/municipio.routes');
const criterioRoutes = require('./routes/criterio.routes');
const matrizDecisaoRoutes = require('./routes/matriz-decisao.routes');

const app = express();

app.use(helmet());

app.use(cors());

app.use(express.json());

app.get('/', (req, res) => {
    res.json({
        mensagem: 'API da Plataforma de Energia Renovável'
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

app.use(errorMiddleware);

module.exports = app;