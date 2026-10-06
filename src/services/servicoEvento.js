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

export async function cadastrarEvento(dados) {

    const {
        nome,
        local,
        data,
        horario,
        descricao,
        tipo,
        assentos,
        categoria,
        idOrganizador,
        cargaHoraria
    } = dados;


    if (!nome || !local || !data || !horario || !assentos) {
        throw new Error(
            "Todos esses campos devem ser preenchidos"
        );
    }

    if (assentos != null && (!Number.isInteger(assentos) || assentos <= 0)) {
        throw new Error(
            "O numero de assentos deve ser um natural maior que 0"
        );
    }
    if (cargaHoraria != null && (!Number.isInteger(cargaHoraria) || cargaHoraria <= 0)) {

        throw new Error(
           "A carga horaria deve ser um natural maior que 0"
        );
    }


    const organizador = await executar(
        "SELECT * FROM Usuario WHERE usuarioId = ?",
        [idOrganizador]
    );

    const organizadorExiste = organizador.length > 0;


    if (!organizadorExiste) {

        throw new Error(
            "Organizador não encontrado"
        );

    }


    await executar(
        `INSERT INTO Evento
        (nome, local, data, horario, descricao, tipo, assentos, categoria, idOrganizador, cargaHoraria)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
            nome,
            local,
            data,
            horario,
            descricao,
            tipo,
            assentos,
            categoria,
            idOrganizador,
            cargaHoraria
        ]
    );

}


export async function listarEventos() {

    const resultado = await executar(
        `SELECT * FROM Evento`
    );

    return resultado;

}


export async function listarDetalhesEvento(idEvento, idOrganizador) {

    const evento = await executar(
        `SELECT * FROM Evento WHERE eventoId = ?`,
        [idEvento]
    );

    const organizador = await executar(
        `SELECT * FROM Usuario WHERE usuarioId = ?`,
        [idOrganizador]
    );

    return {
        evento,
        organizador
    };

}


export async function deletarEvento(id, idOrganizador) {

    const resultado = await executar(
        `DELETE FROM Evento
         WHERE eventoId = ? AND idOrganizador = ?`,
        [id, idOrganizador]
    );

    return resultado;

}


export async function editarEvento(idEvento, idOrganizador, dados) {

    const resultado = await executar(
        `UPDATE Evento
         SET nome = ?,
             local = ?,
             data = ?,
             horario = ?,
             descricao = ?,
             tipo = ?,
             assentos = ?,
             categoria = ?,
             cargaHoraria = ?
         WHERE eventoId = ? AND idOrganizador = ?`,
        [
            dados.nome,
            dados.local,
            dados.data,
            dados.horario,
            dados.descricao,
            dados.tipo,
            dados.assentos,
            dados.categoria,
            dados.cargaHoraria,
            idEvento,
            idOrganizador
        ]
    );

    return resultado;

}


export async function pesquisarEventos(pesquisa) {

    pesquisa = pesquisa.toLowerCase();

    const resultado = await executar(
        `SELECT * FROM Evento
         WHERE LOWER(nome) LIKE ?
         OR LOWER(local) LIKE ?
         OR LOWER(descricao) LIKE ?`,
        [
            `%${pesquisa}%`,
            `%${pesquisa}%`,
            `%${pesquisa}%`
        ]
    );

    return resultado;

}


export async function filtrarEventos(
    tipo,
    data,
    categoria,
    cargaHoraria
) {

    const resultado = await executar(
        `SELECT * FROM Evento
         WHERE tipo = ?
         OR data = ?
         OR categoria = ?
         OR cargaHoraria = ?`,
        [
            tipo,
            data,
            categoria,
            cargaHoraria
        ]
    );

    return resultado;

}