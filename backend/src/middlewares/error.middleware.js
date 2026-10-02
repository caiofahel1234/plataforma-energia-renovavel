const errorMiddleware = (err, req, res, next) => {
    console.error(err);

    res.status(err.statusCode || 500).json({
        sucesso: false,
        mensagem: err.message || 'Erro interno do servidor'
    });
};

module.exports = errorMiddleware;