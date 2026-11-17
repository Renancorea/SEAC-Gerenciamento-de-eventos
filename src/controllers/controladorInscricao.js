import {
    inscrever,
    registrarPresenca,
    listarInscritos,
    listarPresentes,
    verificarInscricao,
    listarInscricoesUsuario
} from "../services/servicoInscricao.js";

export async function RealizarInscricao(requisicao, resposta) {
    try {
        const usuarioId = requisicao.usuario.usuarioId;
        const eventoId = Number(requisicao.body.eventoId);

        const participacao = await inscrever(usuarioId, eventoId);

        return resposta.status(201).json({
            mensagem: "Inscrição realizada com sucesso",
            participacao
        });

    } catch (erro) {
        const status = erro.message.includes("não encontrado") ? 404 : (erro.message.includes("já está inscrito") ? 409 : 400);
        return resposta.status(status).json({
            mensagem: erro.message
        });
    }
}

export async function RegistrarPresenca(requisicao, resposta) {
    try {
        const usuarioId = Number(requisicao.body.usuarioId);
        const eventoId = Number(requisicao.body.eventoId);
        const presente = requisicao.body.presente !== undefined ? Boolean(requisicao.body.presente) : true;

        const participacao = await registrarPresenca(usuarioId, eventoId, presente, requisicao.usuario);

        return resposta.status(200).json({
            mensagem: presente ? "Presença registrada com sucesso" : "Presença removida com sucesso",
            participacao
        });

    } catch (erro) {
        const status = erro.message.includes("não autorizado") ? 403 : (erro.message.includes("não está inscrito") || erro.message.includes("não encontrado") ? 404 : 400);
        return resposta.status(status).json({
            mensagem: erro.message
        });
    }
}

export async function VizualizarInscritos(requisicao, resposta) {
    try {
        const eventoId = Number(requisicao.params.eventoId);
        const resultado = await listarInscritos(eventoId, requisicao.usuario);

        return resposta.status(200).json(resultado);

    } catch (erro) {
        const status = erro.message.includes("não autorizado") ? 403 : (erro.message.includes("não encontrado") ? 404 : 400);
        return resposta.status(status).json({
            mensagem: erro.message
        });
    }
}

export async function VizualizarPresentes(requisicao, resposta) {
    try {
        const eventoId = Number(requisicao.params.eventoId);
        const resultado = await listarPresentes(eventoId, requisicao.usuario);

        return resposta.status(200).json(resultado);

    } catch (erro) {
        const status = erro.message.includes("não autorizado") ? 403 : (erro.message.includes("não encontrado") ? 404 : 400);
        return resposta.status(status).json({
            mensagem: erro.message
        });
    }
}

export async function VerificarInscricaoUsuario(requisicao, resposta) {
    try {
        const usuarioIdSolicitado = Number(requisicao.params.usuarioId || requisicao.usuario.usuarioId);
        const eventoId = Number(requisicao.params.eventoId || requisicao.query.eventoId);

        if (usuarioIdSolicitado !== requisicao.usuario.usuarioId && Number(requisicao.usuario.tipo) !== 0) {
            return resposta.status(403).json({
                mensagem: "Acesso não autorizado."
            });
        }

        const resultado = await verificarInscricao(usuarioIdSolicitado, eventoId);

        return resposta.status(200).json(resultado);

    } catch (erro) {
        return resposta.status(400).json({
            mensagem: erro.message
        });
    }
}

export async function MinhasInscricoes(requisicao, resposta) {
    try {
        const inscricoes = await listarInscricoesUsuario(requisicao.usuario.usuarioId);
        return resposta.status(200).json({
            mensagem: "Inscrições listadas com sucesso",
            inscricoes
        });
    } catch (erro) {
        return resposta.status(400).json({
            mensagem: erro.message
        });
    }
}