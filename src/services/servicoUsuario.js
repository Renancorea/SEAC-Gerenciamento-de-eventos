import bcrypt from "bcryptjs";
import { executar } from "../db/conexao.js";

export async function cadastrar(dados) {
    const {
        nome,
        matricula,
        email,
        tipo,
        siape,
        senha,
        adm
    } = dados;

    const tipoNumerico = Number(tipo);

    if (tipo === undefined || (tipoNumerico !== 0 && tipoNumerico !== 1)) {
        throw new Error("Tipo de usuário inválido. Informe 0 para Organizador ou 1 para Participante.");
    }

    if (!email || !senha || !nome) {
        throw new Error("Nome, e-mail e senha são obrigatórios.");
    }

    // Validação de e-mail duplicado comum a todos os usuários
    const emailResultado = await executar(
        "SELECT usuarioId FROM Usuario WHERE email = ?",
        [email.trim().toLowerCase()]
    );

    if (emailResultado.length > 0) {
        throw new Error("Este e-mail já está cadastrado.");
    }

    let matriculaFinal = null;
    let siapeFinal = null;
    let admFinal = false;

    if (tipoNumerico === 0) {
        // Organizador
        if (!siape || String(siape).trim() === "") {
            throw new Error("SIAPE é obrigatório para organizadores.");
        }

        siapeFinal = String(siape).trim();

        const siapeResultado = await executar(
            "SELECT usuarioId FROM Usuario WHERE siape = ?",
            [siapeFinal]
        );

        if (siapeResultado.length > 0) {
            throw new Error("Este SIAPE já está cadastrado.");
        }

        // Organizador pode ser administrador (adm booleano)
        admFinal = Boolean(adm);
    } else {
        // Participante
        if (!matricula || String(matricula).trim() === "") {
            throw new Error("Matrícula é obrigatória para participantes.");
        }

        matriculaFinal = String(matricula).trim();

        const matriculaResultado = await executar(
            "SELECT usuarioId FROM Usuario WHERE matricula = ?",
            [matriculaFinal]
        );

        if (matriculaResultado.length > 0) {
            throw new Error("Esta matrícula já está cadastrada.");
        }

        // Participante NUNCA pode ser administrador ou organizador
        admFinal = false;
    }

    const senhaHash = await bcrypt.hash(senha, 10);

    const resultadoInsert = await executar(
        `INSERT INTO Usuario
        (nome, matricula, email, tipo, siape, senha, adm)
        VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [nome.trim(), matriculaFinal, email.trim().toLowerCase(), tipoNumerico, siapeFinal, senhaHash, admFinal ? 1 : 0]
    );

    return {
        usuarioId: resultadoInsert.insertId,
        nome: nome.trim(),
        email: email.trim().toLowerCase(),
        tipo: tipoNumerico,
        matricula: matriculaFinal,
        siape: siapeFinal,
        adm: admFinal
    };
}