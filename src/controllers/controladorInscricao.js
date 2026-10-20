import {
    inscrever,
    registrarPresenca,
    listarInscritos,
    listarPresentes,
    verificarInscricao
} from "../services/servicoInscricao.js";

export async function RealizarInscricao(requisicao, resposta) {
    try {
        const usuarioId = Number(requisicao.body.usuarioId);
        const eventoId = Number(requisicao.body.eventoId);

        const participacao = await inscrever(usuarioId, eventoId);

        return resposta.status(201).json({
            mensagem: "Inscrição realizada com sucesso",
            participacao
        });

    } catch (erro) {
        const status = erro.message.includes("não encontrado") ? 404 : 400;
        return resposta.status(status).json({
            mensagem: erro.message
        });
    }
}

export async function RegistrarPresenca(requisicao, resposta) {
    try {
        const usuarioId = Number(requisicao.body.usuarioId);
        const eventoId = Number(requisicao.body.eventoId);

        const participacao = await registrarPresenca(usuarioId, eventoId);

        return resposta.status(200).json({
            mensagem: "Presença registrada com sucesso",
            participacao
        });

    } catch (erro) {
        const status = erro.message.includes("não está inscrito") ? 404 : 400;
        return resposta.status(status).json({
            mensagem: erro.message
        });
    }
}

export async function VizualizarInscritos(requisicao, resposta) {
    try {
        const eventoId = Number(requisicao.params.eventoId);
        const resultado = await listarInscritos(eventoId);

        return resposta.status(200).json(resultado);

    } catch (erro) {
        const status = erro.message.includes("não encontrado") ? 404 : 400;
        return resposta.status(status).json({
            mensagem: erro.message
        });
    }
}

export async function VizualizarPresentes(requisicao, resposta) {
    try {
        const eventoId = Number(requisicao.params.eventoId);
        const resultado = await listarPresentes(eventoId);

        return resposta.status(200).json(resultado);

    } catch (erro) {
        const status = erro.message.includes("não encontrado") ? 404 : 400;
        return resposta.status(status).json({
            mensagem: erro.message
        });
    }
}

export async function VerificarInscricaoUsuario(requisicao, resposta) {
    try {
        const usuarioId = Number(requisicao.params.usuarioId);
        const eventoId = Number(requisicao.params.eventoId || requisicao.query.eventoId);

        const resultado = await verificarInscricao(usuarioId, eventoId);

        return resposta.status(200).json(resultado);

    } catch (erro) {
        return resposta.status(400).json({
            mensagem: erro.message
        });
    }
}