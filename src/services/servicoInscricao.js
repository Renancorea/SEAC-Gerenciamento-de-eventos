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


export async function inscrever(idUsuario, idEvento) {

    const participacao = await executar(
        `SELECT * FROM Participacao
         WHERE usuarioId = ? AND eventoId = ?`,
        [idUsuario, idEvento]
    );

    if (participacao.length > 0) {

        throw new Error(
            "Usuário já está inscrito neste evento"
        );

    }
    const evento = await executar(
        `SELECT * FROM Evento
         WHERE eventoId = ?`,
        [idEvento]
    );
    if (evento.length === 0) {
        throw new Error(
            "Evento não encontrado"
        );
    }
    const usuario = await executar(
        `SELECT * FROM Usuario
         WHERE usuarioId = ?`,
        [idUsuario]
    );

    if (usuario.length === 0) {
        throw new Error(
            "Usuário não encontrado"
        );
    }
    await executar(
        `INSERT INTO Participacao
         (usuarioId, eventoId, inscrito, presente)
         VALUES (?, ?, ?, ?)`,
        [idUsuario, idEvento, true, false]
    );

    return {
        usuarioId: idUsuario,
        eventoId: idEvento,
        inscrito: true,
        presente: false

    };

}

export async function registrarPresenca(idUsuario, idEvento) {

    const participacao = await executar(
        `SELECT * FROM Participacao
         WHERE usuarioId = ? AND eventoId = ?`,
        [idUsuario, idEvento]
    );
    if (participacao.length === 0) {
        throw new Error(
            "Usuário não está inscrito neste evento"
        );

    }


    await executar(
        `UPDATE Participacao
         SET presente = ?
         WHERE usuarioId = ? AND eventoId = ?`,
        [true, idUsuario, idEvento]
    );


    return {

        usuarioId: idUsuario,

        eventoId: idEvento,

        inscrito: true,

        presente: true

    };

}


export async function listarInscritos(idEvento, assentos) {

    const inscritos = await executar(
        `SELECT * FROM Participacao
         WHERE eventoId = ? AND inscrito = ?`,
        [idEvento, true]
    );


    return {

        quantidadeInscritos: inscritos.length,

        assentosDisponiveis: assentos - inscritos.length,

        inscritos

    };

}


export async function listarPresentes(idEvento) {

    const presentes = await executar(
        `SELECT * FROM Participacao
         WHERE eventoId = ? AND presente = ?`,
        [idEvento, true]
    );


    return {

        quantidadePresentes: presentes.length,

        presentes

    };

}


export async function verificarInscricao(idUsuario, idEvento) {

    const participacao = await executar(
        `SELECT * FROM Participacao
         WHERE usuarioId = ? AND eventoId = ?`,
        [idUsuario, idEvento]
    );


    if (participacao.length === 0) {

        return {

            inscrito: false,

            presente: false

        };

    }


    return {

        inscrito: participacao[0].inscrito,

        presente: participacao[0].presente

    };

}