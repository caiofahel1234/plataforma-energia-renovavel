const authService = require('../services/auth.service');

async function registrar(req, res, next) {
    try {
        const { nome, email, senha, perfil } = req.body;

        if (!nome || !email || !senha) {
            return res.status(400).json({
                error: 'nome, email e senha são obrigatórios'
            });
        }

        const usuario = await authService.registrarUsuario({
            nome,
            email,
            senha,
            perfil
        });

        res.status(201).json(usuario);
    } catch (erro) {
        next(erro);
    }
}

async function login(req, res, next) {
    try {
        const { email, senha } = req.body;

        if (!email || !senha) {
            return res.status(400).json({
                error: 'email e senha são obrigatórios'
            });
        }

        const resultado = await authService.login({
            email,
            senha
        });

        res.json(resultado);
    } catch (erro) {
        next(erro);
    }
}

module.exports = {
    registrar,
    login
};