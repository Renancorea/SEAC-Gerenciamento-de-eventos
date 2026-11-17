import { executar } from "../db/conexao.js";

export async function inscrever(idUsuario, idEvento) {
    if (!idUsuario || !idEvento) {
        throw new Error("Identificador do usuário e do evento são obrigatórios.");
    }

    const uid = Number(idUsuario);
    const eid = Number(idEvento);

    const usuarioResultado = await executar(
        `SELECT usuarioId, nome, tipo FROM Usuario WHERE usuarioId = ?`,
        [uid]
    );

    if (usuarioResultado.length === 0) {
        throw new Error("Usuário não encontrado.");
    }

    const eventoResultado = await executar(
        `SELECT eventoId, nome, assentos FROM Evento WHERE eventoId = ?`,
        [eid]
    );

    if (eventoResultado.length === 0) {
        throw new Error("Evento não encontrado.");
    }

    const evento = eventoResultado[0];

    const inscricaoExistente = await executar(
        `SELECT * FROM Inscricao WHERE usuarioId = ? AND eventoId = ?`,
        [uid, eid]
    );

    if (inscricaoExistente.length > 0) {
        throw new Error("Usuário já está inscrito neste evento.");
    }

    const inscricoesAtuais = await executar(
        `SELECT inscricaoId FROM Inscricao WHERE eventoId = ?`,
        [eid]
    );

    if (inscricoesAtuais.length >= evento.assentos) {
        throw new Error("Capacidade máxima do evento atingida. Não há assentos disponíveis.");
    }

    const resultadoInsert = await executar(
        `INSERT INTO Inscricao (usuarioId, eventoId, presente) VALUES (?, ?, ?)`,
        [uid, eid, false]
    );

    return {
        inscricaoId: resultadoInsert.insertId,
        usuarioId: uid,
        eventoId: eid,
        presente: false
    };
}

export async function registrarPresenca(idUsuario, idEvento, presente = true, usuarioOrganizador = null) {
    if (!idUsuario || !idEvento) {
        throw new Error("Identificador do usuário e do evento são obrigatórios.");
    }

    const uid = Number(idUsuario);
    const eid = Number(idEvento);

    const eventoResultado = await executar(
        `SELECT eventoId, idOrganizador FROM Evento WHERE eventoId = ?`,
        [eid]
    );

    if (eventoResultado.length === 0) {
        throw new Error("Evento não encontrado.");
    }

    if (usuarioOrganizador && !usuarioOrganizador.adm && Number(eventoResultado[0].idOrganizador) !== Number(usuarioOrganizador.usuarioId)) {
        throw new Error("Acesso não autorizado: apenas o organizador responsável pelo evento pode registrar presença.");
    }

    const inscricao = await executar(
        `SELECT * FROM Inscricao WHERE usuarioId = ? AND eventoId = ?`,
        [uid, eid]
    );

    if (inscricao.length === 0) {
        throw new Error("Usuário não está inscrito neste evento.");
    }

    const presenteBool = Boolean(presente);

    await executar(
        `UPDATE Inscricao
         SET presente = ?
         WHERE usuarioId = ? AND eventoId = ?`,
        [presenteBool ? 1 : 0, uid, eid]
    );

    return {
        usuarioId: uid,
        eventoId: eid,
        presente: presenteBool
    };
}

export async function listarInscritos(idEvento, usuarioOrganizador = null) {
    if (!idEvento) {
        throw new Error("Identificador do evento não informado.");
    }

    const eid = Number(idEvento);

    const eventoResultado = await executar(
        `SELECT eventoId, nome, assentos, idOrganizador FROM Evento WHERE eventoId = ?`,
        [eid]
    );

    if (eventoResultado.length === 0) {
        throw new Error("Evento não encontrado.");
    }

    const evento = eventoResultado[0];

    if (usuarioOrganizador && !usuarioOrganizador.adm && Number(evento.idOrganizador) !== Number(usuarioOrganizador.usuarioId)) {
        throw new Error("Acesso não autorizado: apenas o organizador responsável pelo evento pode visualizar os inscritos.");
    }

    const inscritos = await executar(
        `SELECT i.inscricaoId, i.usuarioId, i.eventoId, i.presente, i.dataInscricao,
                u.nome, u.matricula, u.siape, u.email
         FROM Inscricao i
         INNER JOIN Usuario u ON i.usuarioId = u.usuarioId
         WHERE i.eventoId = ?`,
        [eid]
    );

    const quantidadeInscritos = inscritos.length;
    const assentosDisponiveis = Math.max(0, evento.assentos - quantidadeInscritos);

    return {
        eventoId: eid,
        nomeEvento: evento.nome,
        totalAssentos: evento.assentos,
        quantidadeInscritos,
        assentosDisponiveis,
        inscritos: inscritos.map(i => ({
            ...i,
            presente: Boolean(i.presente)
        }))
    };
}

export async function listarPresentes(idEvento, usuarioOrganizador = null) {
    if (!idEvento) {
        throw new Error("Identificador do evento não informado.");
    }

    const eid = Number(idEvento);

    const eventoResultado = await executar(
        `SELECT eventoId, nome, idOrganizador FROM Evento WHERE eventoId = ?`,
        [eid]
    );

    if (eventoResultado.length === 0) {
        throw new Error("Evento não encontrado.");
    }

    const evento = eventoResultado[0];

    if (usuarioOrganizador && !usuarioOrganizador.adm && Number(evento.idOrganizador) !== Number(usuarioOrganizador.usuarioId)) {
        throw new Error("Acesso não autorizado: apenas o organizador responsável pelo evento pode visualizar os presentes.");
    }

    const presentes = await executar(
        `SELECT i.inscricaoId, i.usuarioId, i.eventoId, i.presente, i.dataInscricao,
                u.nome, u.matricula, u.siape, u.email
         FROM Inscricao i
         INNER JOIN Usuario u ON i.usuarioId = u.usuarioId
         WHERE i.eventoId = ? AND i.presente = ?`,
        [eid, 1]
    );

    return {
        eventoId: eid,
        nomeEvento: evento.nome,
        quantidadePresentes: presentes.length,
        presentes: presentes.map(p => ({
            ...p,
            presente: Boolean(p.presente)
        }))
    };
}

export async function verificarInscricao(idUsuario, idEvento) {
    if (!idUsuario || !idEvento) {
        throw new Error("Identificador do usuário e do evento são obrigatórios.");
    }

    const uid = Number(idUsuario);
    const eid = Number(idEvento);

    const inscricao = await executar(
        `SELECT * FROM Inscricao WHERE usuarioId = ? AND eventoId = ?`,
        [uid, eid]
    );

    if (inscricao.length === 0) {
        return {
            inscrito: false,
            presente: false
        };
    }

    return {
        inscrito: true,
        presente: Boolean(inscricao[0].presente)
    };
}

export async function listarInscricoesUsuario(idUsuario) {
    const uid = Number(idUsuario);
    if (!uid) {
        throw new Error("Identificador do usuário não informado.");
    }

    const inscricoes = await executar(
        `SELECT i.inscricaoId, i.usuarioId, i.eventoId, i.presente, i.dataInscricao,
                e.nome AS nomeEvento, e.data AS dataEvento, e.horario AS horarioEvento,
                e.local AS localEvento, e.cargaHoraria
         FROM Inscricao i
         INNER JOIN Evento e ON i.eventoId = e.eventoId
         WHERE i.usuarioId = ?`,
        [uid]
    );

    return inscricoes.map(i => ({
        ...i,
        presente: Boolean(i.presente)
    }));
}