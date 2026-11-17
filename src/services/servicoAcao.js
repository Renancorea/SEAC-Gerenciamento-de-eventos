import { executar } from "../db/conexao.js";

async function verificarDonoEvento(eventoId, usuario) {
    const res = await executar(
        `SELECT eventoId, idOrganizador FROM Evento WHERE eventoId = ?`,
        [Number(eventoId)]
    );
    if (res.length === 0) {
        throw new Error("Evento associado não foi encontrado.");
    }
    if (usuario && !usuario.adm && Number(res[0].idOrganizador) !== Number(usuario.usuarioId)) {
        throw new Error("Acesso não autorizado: apenas o organizador responsável pelo evento pode gerenciar suas ações.");
    }
    return res[0];
}

export async function cadastrarAcao(dados, usuario = null) {
    const { nome, eventoId } = dados;

    if (!nome || String(nome).trim() === "" || !eventoId) {
        throw new Error("Nome da ação e identificador do evento são obrigatórios.");
    }

    const eid = Number(eventoId);
    await verificarDonoEvento(eid, usuario);

    const resultadoInsert = await executar(
        `INSERT INTO Acao (nome, eventoId) VALUES (?, ?)`,
        [nome.trim(), eid]
    );

    return {
        acaoId: resultadoInsert.insertId,
        nome: nome.trim(),
        eventoId: eid
    };
}

export async function listarAcoesPorEvento(eventoId) {
    if (!eventoId) {
        throw new Error("Identificador do evento não informado.");
    }

    const eid = Number(eventoId);

    const acoes = await executar(
        `SELECT * FROM Acao WHERE eventoId = ?`,
        [eid]
    );

    return acoes;
}

export async function buscarAcaoPorId(acaoId) {
    if (!acaoId) {
        throw new Error("Identificador da ação não informado.");
    }

    const aid = Number(acaoId);

    const resultado = await executar(
        `SELECT * FROM Acao WHERE acaoId = ?`,
        [aid]
    );

    if (resultado.length === 0) {
        throw new Error("Ação não encontrada.");
    }

    return resultado[0];
}

export async function editarAcao(acaoId, dados, usuario = null) {
    if (!acaoId) {
        throw new Error("Identificador da ação não informado.");
    }

    const aid = Number(acaoId);
    const { nome } = dados;

    if (!nome || String(nome).trim() === "") {
        throw new Error("O nome da ação deve ser preenchido.");
    }

    const acaoExistente = await buscarAcaoPorId(aid);
    await verificarDonoEvento(acaoExistente.eventoId, usuario);

    await executar(
        `UPDATE Acao SET nome = ? WHERE acaoId = ?`,
        [nome.trim(), aid]
    );

    return {
        acaoId: aid,
        nome: nome.trim(),
        eventoId: acaoExistente.eventoId
    };
}

export async function deletarAcao(acaoId, usuario = null) {
    if (!acaoId) {
        throw new Error("Identificador da ação não informado.");
    }

    const aid = Number(acaoId);
    const acaoExistente = await buscarAcaoPorId(aid);
    await verificarDonoEvento(acaoExistente.eventoId, usuario);

    await executar(
        `DELETE FROM Acao WHERE acaoId = ?`,
        [aid]
    );

    return { mensagem: "Ação deletada com sucesso." };
}
