import crypto from "crypto";
import bcrypt from "bcryptjs";
import { executar } from "../db/conexao.js";

// Gerenciador de sessões ativas para autenticação coerente
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
    sessoesAtivas.set(token, {
        usuarioId: usuario.usuarioId,
        tipo: usuario.tipo,
        nome: usuario.nome,
        criadoEm: new Date()
    });

    // Exclusão estrita de senhas e hashes das respostas da API
    const { senha: _, ...usuarioSemSenha } = usuario;

    return {
        token,
        usuario: {
            ...usuarioSemSenha,
            tipo: Number(usuario.tipo),
            adm: Boolean(usuario.adm)
        }
    };
}

export async function logout(token) {
    if (token && sessoesAtivas.has(token)) {
        sessoesAtivas.delete(token);
        return true;
    }
    return true;
}

export function verificarSessao(token) {
    return sessoesAtivas.get(token) || null;
}