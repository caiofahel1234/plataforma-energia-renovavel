function autorizar(...perfisPermitidos) {
    return (req, res, next) => {
        if (!req.usuario) {
            return res.status(401).json({
                error: 'Usuário não autenticado'
            });
        }

        if (!perfisPermitidos.includes(req.usuario.perfil)) {
            return res.status(403).json({
                error: 'Usuário sem permissão para realizar esta operação'
            });
        }

        next();
    };
}

module.exports = autorizar;