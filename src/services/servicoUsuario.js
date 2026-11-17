import bcrypt from "bcryptjs";
import { executar } from "../db/conexao.js";

export async function cadastrar(dados, usuarioAutenticado = null) {
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

    if (tipo === undefined || tipo === "" || (tipoNumerico !== 0 && tipoNumerico !== 1)) {
        throw new Error("Tipo de usuário inválido. Informe 0 para Organizador ou 1 para Participante.");
    }

    if (!email || !senha || !nome || String(nome).trim() === "") {
        throw new Error("Nome, e-mail e senha são obrigatórios.");
    }

    const emailNormalizado = String(email).trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailNormalizado)) {
        throw new Error("Informe um endereço de e-mail válido.");
    }

    if (String(senha).length < 6) {
        throw new Error("A senha deve ter pelo menos 6 caracteres.");
    }

    // Validação de e-mail duplicado comum a todos os usuários
    const emailResultado = await executar(
        "SELECT usuarioId FROM Usuario WHERE email = ?",
        [emailNormalizado]
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

        // Apenas um administrador autenticado pode conceder permissão administrativa no cadastro
        admFinal = Boolean(adm) && Boolean(usuarioAutenticado?.adm);
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

    const senhaHash = await bcrypt.hash(String(senha), 10);

    const resultadoInsert = await executar(
        `INSERT INTO Usuario
        (nome, matricula, email, tipo, siape, senha, adm)
        VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [String(nome).trim(), matriculaFinal, emailNormalizado, tipoNumerico, siapeFinal, senhaHash, admFinal ? 1 : 0]
    );

    return {
        usuarioId: resultadoInsert.insertId,
        nome: String(nome).trim(),
        email: emailNormalizado,
        tipo: tipoNumerico,
        matricula: matriculaFinal,
        siape: siapeFinal,
        adm: admFinal
    };
}