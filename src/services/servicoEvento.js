import { executar } from "../db/conexao.js";

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

    if (!nome || !local || !data || !horario || assentos == null || !idOrganizador) {
        throw new Error("Todos os campos obrigatórios (nome, local, data, horário, assentos, idOrganizador) devem ser preenchidos.");
    }

    const assentosNum = Number(assentos);
    if (!Number.isInteger(assentosNum) || assentosNum <= 0) {
        throw new Error("A quantidade de assentos deve ser um número natural maior que zero.");
    }

    let cargaNum = 0;
    if (cargaHoraria != null) {
        cargaNum = Number(cargaHoraria);
        if (isNaN(cargaNum) || cargaNum <= 0) {
            throw new Error("A carga horária deve ser um valor numérico positivo.");
        }
    }

    // Validação da existência do organizador e confirmação de que ele é de fato do tipo Organizador (tipo = 0)
    const organizadorResultado = await executar(
        "SELECT * FROM Usuario WHERE usuarioId = ?",
        [Number(idOrganizador)]
    );

    if (organizadorResultado.length === 0) {
        throw new Error("Organizador não encontrado no sistema.");
    }

    const organizador = organizadorResultado[0];
    if (Number(organizador.tipo) !== 0) {
        throw new Error("O usuário informado não possui perfil de organizador (tipo = 0).");
    }

    const resultadoInsert = await executar(
        `INSERT INTO Evento
        (nome, local, data, horario, descricao, tipo, assentos, categoria, idOrganizador, cargaHoraria)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
            nome.trim(),
            local.trim(),
            data,
            horario,
            descricao || null,
            tipo || null,
            assentosNum,
            categoria || null,
            Number(idOrganizador),
            cargaNum
        ]
    );

    return {
        eventoId: resultadoInsert.insertId,
        nome: nome.trim(),
        local: local.trim(),
        data,
        horario,
        descricao: descricao || null,
        tipo: tipo || null,
        assentos: assentosNum,
        categoria: categoria || null,
        idOrganizador: Number(idOrganizador),
        cargaHoraria: cargaNum
    };
}

export async function listarEventos() {
    const resultado = await executar(
        `SELECT * FROM Evento ORDER BY data ASC`
    );

    return resultado;
}

export async function listarDetalhesEvento(idEvento) {
    if (!idEvento) {
        throw new Error("Identificador do evento não informado.");
    }

    const eventoResultado = await executar(
        `SELECT * FROM Evento WHERE eventoId = ?`,
        [Number(idEvento)]
    );

    if (eventoResultado.length === 0) {
        throw new Error("Evento não encontrado.");
    }

    const evento = eventoResultado[0];

    const organizadorResultado = await executar(
        `SELECT usuarioId, nome, email, siape FROM Usuario WHERE usuarioId = ?`,
        [evento.idOrganizador]
    );

    return {
        evento,
        organizador: organizadorResultado[0] || null
    };
}

export async function deletarEvento(idEvento, idOrganizador) {
    if (!idEvento || !idOrganizador) {
        throw new Error("Identificador do evento e do organizador são obrigatórios.");
    }

    const eventoResultado = await executar(
        `SELECT * FROM Evento WHERE eventoId = ?`,
        [Number(idEvento)]
    );

    if (eventoResultado.length === 0) {
        throw new Error("Evento não encontrado.");
    }

    const evento = eventoResultado[0];

    // Impedimento de que um usuário altere ou exclua eventos de outro organizador sem autorização
    if (Number(evento.idOrganizador) !== Number(idOrganizador)) {
        throw new Error("Acesso não autorizado: você não é o organizador responsável por este evento.");
    }

    await executar(
        `DELETE FROM Evento WHERE eventoId = ? AND idOrganizador = ?`,
        [Number(idEvento), Number(idOrganizador)]
    );

    return { mensagem: "Evento excluído com sucesso." };
}

export async function editarEvento(idEvento, idOrganizador, dados) {
    if (!idEvento || !idOrganizador) {
        throw new Error("Identificador do evento e do organizador são obrigatórios.");
    }

    const eventoResultado = await executar(
        `SELECT * FROM Evento WHERE eventoId = ?`,
        [Number(idEvento)]
    );

    if (eventoResultado.length === 0) {
        throw new Error("Evento não encontrado.");
    }

    const evento = eventoResultado[0];

    // Impedimento de que um usuário altere eventos de outro organizador
    if (Number(evento.idOrganizador) !== Number(idOrganizador)) {
        throw new Error("Acesso não autorizado: você não é o organizador responsável por este evento.");
    }

    const nome = dados.nome !== undefined ? dados.nome.trim() : evento.nome;
    const local = dados.local !== undefined ? dados.local.trim() : evento.local;
    const data = dados.data !== undefined ? dados.data : evento.data;
    const horario = dados.horario !== undefined ? dados.horario : evento.horario;
    const descricao = dados.descricao !== undefined ? dados.descricao : evento.descricao;
    const tipo = dados.tipo !== undefined ? dados.tipo : evento.tipo;
    const categoria = dados.categoria !== undefined ? dados.categoria : evento.categoria;

    let assentos = evento.assentos;
    if (dados.assentos !== undefined) {
        const assentosNum = Number(dados.assentos);
        if (!Number.isInteger(assentosNum) || assentosNum <= 0) {
            throw new Error("A quantidade de assentos deve ser um número natural maior que zero.");
        }
        assentos = assentosNum;
    }

    let cargaHoraria = evento.cargaHoraria;
    if (dados.cargaHoraria !== undefined) {
        const cargaNum = Number(dados.cargaHoraria);
        if (isNaN(cargaNum) || cargaNum <= 0) {
            throw new Error("A carga horária deve ser um valor numérico positivo.");
        }
        cargaHoraria = cargaNum;
    }

    await executar(
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
            nome,
            local,
            data,
            horario,
            descricao,
            tipo,
            assentos,
            categoria,
            cargaHoraria,
            Number(idEvento),
            Number(idOrganizador)
        ]
    );

    return {
        eventoId: Number(idEvento),
        nome,
        local,
        data,
        horario,
        descricao,
        tipo,
        assentos,
        categoria,
        cargaHoraria,
        idOrganizador: Number(idOrganizador)
    };
}

export async function pesquisarEventos(pesquisa) {
    if (!pesquisa || String(pesquisa).trim() === "") {
        return await listarEventos();
    }

    const termo = String(pesquisa).trim().toLowerCase();

    const resultado = await executar(
        `SELECT * FROM Evento
         WHERE LOWER(nome) LIKE ?
         OR LOWER(local) LIKE ?
         OR LOWER(descricao) LIKE ?`,
        [
            `%${termo}%`,
            `%${termo}%`,
            `%${termo}%`
        ]
    );

    return resultado;
}

export async function filtrarEventos(filtros = {}) {
    const {
        tipo,
        data,
        categoria,
        cargaHoraria
    } = filtros;

    const condicoes = [];
    const parametros = [];

    if (tipo && tipo !== "todos") {
        condicoes.push("tipo = ?");
        parametros.push(tipo);
    }

    if (data) {
        condicoes.push("data = ?");
        parametros.push(data);
    }

    if (categoria && categoria !== "todas") {
        condicoes.push("categoria = ?");
        parametros.push(categoria);
    }

    if (cargaHoraria) {
        condicoes.push("cargaHoraria = ?");
        parametros.push(Number(cargaHoraria));
    }

    if (condicoes.length === 0) {
        return await listarEventos();
    }

    // Combina múltiplos filtros com AND evitando retorno incorreto por uso indevido de OR
    const sql = `SELECT * FROM Evento WHERE ${condicoes.join(" AND ")} ORDER BY data ASC`;
    const resultado = await executar(sql, parametros);

    return resultado;
}