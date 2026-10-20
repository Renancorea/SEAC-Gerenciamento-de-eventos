import { executar } from "../db/conexao.js";

export async function inscrever(idUsuario, idEvento) {
    if (!idUsuario || !idEvento) {
        throw new Error("Identificador do usuário e do evento são obrigatórios.");
    }

    const uid = Number(idUsuario);
    const eid = Number(idEvento);

    // Validação da existência do usuário
    const usuarioResultado = await executar(
        `SELECT usuarioId, nome, tipo FROM Usuario WHERE usuarioId = ?`,
        [uid]
    );

    if (usuarioResultado.length === 0) {
        throw new Error("Usuário não encontrado.");
    }

    // Validação da existência do evento
    const eventoResultado = await executar(
        `SELECT eventoId, nome, assentos FROM Evento WHERE eventoId = ?`,
        [eid]
    );

    if (eventoResultado.length === 0) {
        throw new Error("Evento não encontrado.");
    }

    const evento = eventoResultado[0];

    // Impedimento de inscrições duplicadas usando a tabela correta Inscricao
    const inscricaoExistente = await executar(
        `SELECT * FROM Inscricao WHERE usuarioId = ? AND eventoId = ?`,
        [uid, eid]
    );

    if (inscricaoExistente.length > 0) {
        throw new Error("Usuário já está inscrito neste evento.");
    }

    // Verificação de capacidade máxima e cálculo de vagas disponíveis
    const inscricoesAtuais = await executar(
        `SELECT inscricaoId FROM Inscricao WHERE eventoId = ?`,
        [eid]
    );

    if (inscricoesAtuais.length >= evento.assentos) {
        throw new Error("Capacidade máxima do evento atingida. Não há assentos disponíveis.");
    }

    // Inserção na tabela Inscricao (presente inicia como false)
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

export async function registrarPresenca(idUsuario, idEvento) {
    if (!idUsuario || !idEvento) {
        throw new Error("Identificador do usuário e do evento são obrigatórios.");
    }

    const uid = Number(idUsuario);
    const eid = Number(idEvento);

    // Impedimento de registrar presença de quem não está inscrito
    const inscricao = await executar(
        `SELECT * FROM Inscricao WHERE usuarioId = ? AND eventoId = ?`,
        [uid, eid]
    );

    if (inscricao.length === 0) {
        throw new Error("Usuário não está inscrito neste evento.");
    }

    await executar(
        `UPDATE Inscricao
         SET presente = ?
         WHERE usuarioId = ? AND eventoId = ?`,
        [true, uid, eid]
    );

    return {
        usuarioId: uid,
        eventoId: eid,
        presente: true
    };
}

export async function listarInscritos(idEvento) {
    if (!idEvento) {
        throw new Error("Identificador do evento não informado.");
    }

    const eid = Number(idEvento);

    // Valida se o evento existe e obtém a quantidade de assentos
    const eventoResultado = await executar(
        `SELECT eventoId, nome, assentos FROM Evento WHERE eventoId = ?`,
        [eid]
    );

    if (eventoResultado.length === 0) {
        throw new Error("Evento não encontrado.");
    }

    const evento = eventoResultado[0];

    // Retorna apenas os inscritos do evento solicitado com dados do usuário
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
        inscritos
    };
}

export async function listarPresentes(idEvento) {
    if (!idEvento) {
        throw new Error("Identificador do evento não informado.");
    }

    const eid = Number(idEvento);

    const eventoResultado = await executar(
        `SELECT eventoId, nome FROM Evento WHERE eventoId = ?`,
        [eid]
    );

    if (eventoResultado.length === 0) {
        throw new Error("Evento não encontrado.");
    }

    const evento = eventoResultado[0];

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
        presentes
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