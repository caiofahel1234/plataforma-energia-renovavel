const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const prisma = require('../lib/prisma');

async function registrarUsuario({ nome, email, senha, perfil = 'usuario' }) {
    const usuarioExistente = await prisma.usuario.findUnique({
        where: { email }
    });

    if (usuarioExistente) {
        const erro = new Error('E-mail já cadastrado');
        erro.status = 409;
        throw erro;
    }

    const senhaHash = await bcrypt.hash(senha, 10);

    const usuario = await prisma.usuario.create({
        data: {
            nome,
            email,
            senhaHash,
            perfil,
            ativo: true
        },
        select: {
            id: true,
            nome: true,
            email: true,
            perfil: true,
            ativo: true,
            createdAt: true
        }
    });

    return usuario;
}

async function login({ email, senha }) {
    const usuario = await prisma.usuario.findUnique({
        where: { email }
    });

    if (!usuario || !usuario.ativo) {
        const erro = new Error('E-mail ou senha inválidos');
        erro.status = 401;
        throw erro;
    }

    const senhaValida = await bcrypt.compare(senha, usuario.senhaHash);

    if (!senhaValida) {
        const erro = new Error('E-mail ou senha inválidos');
        erro.status = 401;
        throw erro;
    }

    const token = jwt.sign(
        {
            id: usuario.id,
            email: usuario.email,
            perfil: usuario.perfil
        },
        process.env.JWT_SECRET,
        {
            expiresIn: '8h'
        }
    );

    return {
        token,
        usuario: {
            id: usuario.id,
            nome: usuario.nome,
            email: usuario.email,
            perfil: usuario.perfil
        }
    };
}

module.exports = {
    registrarUsuario,
    login
};