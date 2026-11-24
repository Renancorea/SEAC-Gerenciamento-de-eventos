import crypto from "crypto";
import bcrypt from "bcryptjs";
import { executar } from "../db/conexao.js";

// Gerenciador de sessões
const sessoesAtivas = new Map();

export async function login(dados) {
    const {
        identificador,
        senha,
        tipo
    } = dados;

    if (!identificador || !senha || tipo === undefined) {
        throw new Error("Identificador (matrícula ou SIAPE), senha e tipo devem ser preenchidos.");
    }

    const tipoNumerico = Number(tipo);
    if (tipoNumerico !== 0 && tipoNumerico !== 1) {
        throw new Error("Tipo de usuário inválido. Informe 0 para Organizador ou 1 para Participante.");
    }

    let resultado;

    if (tipoNumerico === 0) {
        // Organizador busca exclusivamente por SIAPE
        resultado = await executar(
            `SELECT * FROM Usuario
             WHERE siape = ? AND tipo = 0`,
            [String(identificador).trim()]
        );
    } else {
        // Participante busca exclusivamente por matrícula
        resultado = await executar(
            `SELECT * FROM Usuario
             WHERE matricula = ? AND tipo = 1`,
            [String(identificador).trim()]
        );
    }

    if (!resultado || resultado.length === 0) {
        throw new Error("Credenciais inválidas. Verifique o número de identificação e senha informados.");
    }

    const usuario = resultado[0];

    // Impedimento de que participante seja tratado como organizador ou vice-versa
    if (Number(usuario.tipo) !== tipoNumerico) {
        throw new Error("O tipo de usuário informado não corresponde ao cadastro.");
    }

    const senhaValida = await bcrypt.compare(senha, usuario.senha);

    if (!senhaValida) {
        throw new Error("Credenciais inválidas. Verifique o número de identificação e senha informados.");
    }

    // Criar token de sessão para encerramento de sessão coerente
    const token = crypto.randomBytes(32).toString("hex");
    const usuarioLimpo = {
        usuarioId: usuario.usuarioId,
        nome: usuario.nome,
        email: usuario.email,
        matricula: usuario.matricula,
        siape: usuario.siape,
        tipo: Number(usuario.tipo),
        adm: Number(usuario.tipo) === 0 ? Boolean(usuario.adm) : false
    };

    sessoesAtivas.set(token, {
        ...usuarioLimpo,
        criadoEm: new Date()
    });

    return {
        token,
        usuario: usuarioLimpo
    };
}

export async function logout(token) {
    if (token && sessoesAtivas.has(token)) {
        sessoesAtivas.delete(token);
        return true;
    }
    return true;
}

export async function verificarSessao(token) {
    if (!token) return null;
    const sessao = sessoesAtivas.get(token);
    if (!sessao) return null;

    // Revalida o usuário no banco para não confiar em cache desatualizado
    const resultado = await executar(
        `SELECT usuarioId, nome, email, matricula, siape, tipo, adm
         FROM Usuario
         WHERE usuarioId = ?`,
        [sessao.usuarioId]
    );

    if (!resultado || resultado.length === 0) {
        sessoesAtivas.delete(token);
        return null;
    }

    const u = resultado[0];
    return {
        usuarioId: u.usuarioId,
        nome: u.nome,
        email: u.email,
        matricula: u.matricula,
        siape: u.siape,
        tipo: Number(u.tipo),
        adm: Number(u.tipo) === 0 ? Boolean(u.adm) : false
    };
}

export function extrairToken(requisicao) {
    const authHeader = requisicao.headers?.authorization;
    if (authHeader && authHeader.startsWith("Bearer ")) {
        return authHeader.substring(7).trim();
    }
    if (requisicao.query?.token) {
        return String(requisicao.query.token).trim();
    }
    return null;
}

export async function exigirAutenticacao(requisicao, opcoes = {}) {
    const token = extrairToken(requisicao);
    if (!token) {
        const erro = new Error("Autenticação necessária. Faça login para continuar.");
        erro.status = 401;
        throw erro;
    }

    const usuario = await verificarSessao(token);
    if (!usuario) {
        const erro = new Error("Sessão inválida ou expirada. Faça login novamente.");
        erro.status = 401;
        throw erro;
    }

    if (opcoes.organizador && Number(usuario.tipo) !== 0) {
        const erro = new Error("Acesso restrito a organizadores.");
        erro.status = 403;
        throw erro;
    }

    if (opcoes.admin && (Number(usuario.tipo) !== 0 || !usuario.adm)) {
        const erro = new Error("Acesso restrito a administradores.");
        erro.status = 403;
        throw erro;
    }

    return usuario;
}

export async function obterUsuarioOpcional(requisicao) {
    const token = extrairToken(requisicao);
    if (!token) return null;
    return await verificarSessao(token).catch(() => null);
}