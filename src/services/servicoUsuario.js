import bcrypt from "bcryptjs";
import Conexao from "../db/conexao.js";

function executar(sql, valores) {
    return new Promise((resolve, reject) => {

        Conexao.execute(sql, valores, (err, resultado) => {

            if (err) {
                reject(err);
                return;
            }

            resolve(resultado);
        });

    });
}

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

    if (tipo === 0) {

        if (!nome || !siape || !email || !senha) {
            throw new Error(
                "Todos os campos devem ser preenchidos"
            );
        }

        const siapeResultado = await executar(
            "SELECT * FROM Usuario WHERE siape = ?",
            [siape]
        );

        const siapeExiste = siapeResultado.length > 0;

        if (siapeExiste) {
            throw new Error(
                "Este siape já existe"
            );
        }

        const emailResultado = await executar(
            "SELECT * FROM Usuario WHERE email = ?",
            [email]
        );

        const emailExiste = emailResultado.length > 0;

        if (emailExiste) {
            throw new Error(
                "Este email já existe"
            );
        }
    } else {

        if (!nome || !matricula || !email || !senha) {
            throw new Error(
                "Todos os campos devem ser preenchidos"
            );
        }

        const matriculaResultado = await executar(
            "SELECT * FROM Usuario WHERE matricula = ?",
            [matricula]
        );

        const matriculaExiste = matriculaResultado.length > 0;

        if (matriculaExiste) {
            throw new Error(
                "Esta matrícula já existe"
            );
        }

        const emailResultado = await executar(
            "SELECT * FROM Usuario WHERE email = ?",
            [email]
        );

        const emailExiste = emailResultado.length > 0;

        if (emailExiste) {
            throw new Error(
                "Este email já existe"
            );
        }
    }

    const senhaHash = await bcrypt.hash(senha, 10);

    await executar(
        `INSERT INTO Usuario
        (nome, matricula, email, tipo, siape, senha, adm)
        VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [nome, matricula, email, tipo, siape, senhaHash, adm]
    );
}