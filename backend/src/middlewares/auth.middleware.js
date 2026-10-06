const jwt = require('jsonwebtoken');

function autenticar(req, res, next) {
    try {
        const authorization = req.headers.authorization;

        if (!authorization) {
            return res.status(401).json({
                error: 'Token não informado'
            });
        }

        const [tipo, token] = authorization.split(' ');

        if (tipo !== 'Bearer' || !token) {
            return res.status(401).json({
                error: 'Formato do token inválido'
            });
        }

        const usuario = jwt.verify(
            token,
            process.env.JWT_SECRET
        );

        req.usuario = usuario;

        next();
    } catch (erro) {
        return res.status(401).json({
            error: 'Token inválido ou expirado'
        });
    }
}

module.exports = autenticar;