import {
    cadastrarAcao,
    listarAcoesPorEvento,
    buscarAcaoPorId,
    editarAcao,
    deletarAcao
} from "../services/servicoAcao.js";

export async function CadastrarAcao(requisicao, resposta) {
    try {
        const acao = await cadastrarAcao(requisicao.body, requisicao.usuario);

        return resposta.status(201).json({
            mensagem: "Ação cadastrada com sucesso",
            acao
        });
    } catch (erro) {
        const status = erro.message.includes("não autorizado") ? 403 : (erro.message.includes("não foi encontrado") ? 404 : 400);
        return resposta.status(status).json({
            mensagem: erro.message
        });
    }
}

export async function ListarAcoesPorEvento(requisicao, resposta) {
    try {
        const eventoId = Number(requisicao.params.eventoId);
        const acoes = await listarAcoesPorEvento(eventoId);

        return resposta.status(200).json({
            mensagem: "Ações listadas com sucesso",
            acoes
        });
    } catch (erro) {
        return resposta.status(400).json({
            mensagem: erro.message
        });
    }
}

export async function BuscarAcaoPorId(requisicao, resposta) {
    try {
        const id = Number(requisicao.params.id);
        const acao = await buscarAcaoPorId(id);

        return resposta.status(200).json({
            mensagem: "Ação encontrada com sucesso",
            acao
        });
    } catch (erro) {
        const status = erro.message.includes("não encontrada") ? 404 : 400;
        return resposta.status(status).json({
            mensagem: erro.message
        });
    }
}

export async function EditarAcao(requisicao, resposta) {
    try {
        const id = Number(requisicao.params.id);
        const acao = await editarAcao(id, requisicao.body, requisicao.usuario);

        return resposta.status(200).json({
            mensagem: "Ação editada com sucesso",
            acao
        });
    } catch (erro) {
        const status = erro.message.includes("não autorizado") ? 403 : (erro.message.includes("não encontrada") ? 404 : 400);
        return resposta.status(status).json({
            mensagem: erro.message
        });
    }
}

export async function DeletarAcao(requisicao, resposta) {
    try {
        const id = Number(requisicao.params.id);
        await deletarAcao(id, requisicao.usuario);

        return resposta.status(200).json({
            mensagem: "Ação deletada com sucesso"
        });
    } catch (erro) {
        const status = erro.message.includes("não autorizado") ? 403 : (erro.message.includes("não encontrada") ? 404 : 400);
        return resposta.status(status).json({
            mensagem: erro.message
        });
    }
}
