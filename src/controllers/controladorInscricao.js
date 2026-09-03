import { inscrever, registrarPresenca, listarInscritos, listarPresentes, verificarInscricao} from "../services/servicoInscricao.js";
import { listarDetalhesEvento } from "../services/servicoEvento.js";

export function realizarInscricao(requisicao, resposta) {

    try {

        const usuarioId = Number(requisicao.body.usuarioId);
        const eventoId = Number(requisicao.body.eventoId);

        const participacao = inscrever(
            usuarioId,
            eventoId
        );

        return resposta.status(201).json({
            mensagem: "Inscrição realizada com sucesso",
            participacao
        });

    } catch (erro) {

        return resposta.status(400).json({
            mensagem: erro.message
        });

    }
}


export function registrarPresenca(requisicao, resposta) {

    try {

        const usuarioId = Number(requisicao.body.usuarioId);
        const eventoId = Number(requisicao.body.eventoId);

        const participacao = registrarPresenca(
            usuarioId,
            eventoId
        );

        return resposta.status(200).json({
            mensagem: "Presença registrada com sucesso",
            participacao
        });

    } catch (erro) {

        return resposta.status(400).json({
            mensagem: erro.message
        });

    }
}
export function vizualizarInscritos(requisicao, resposta) {

    try {

        const eventoId = Number(requisicao.params.eventoId);

        const evento = listarDetalhesEvento(eventoId);

        const resultado = listarInscritos(
            eventoId,
            evento.assentos
        );

        return resposta.status(200).json(resultado);

    } catch (erro) {

        return resposta.status(404).json({
            mensagem: erro.message
        });

    }
}

export function vizualizarPresentes(requisicao, resposta) {

    try {

        const eventoId = Number(requisicao.params.eventoId);

        const resultado = listarPresentes(eventoId);

        return resposta.status(200).json(resultado);

    } catch (erro) {

        return resposta.status(404).json({
            mensagem: erro.message
        });

    }
}

export function verificarInscricaoUsuario(requisicao, resposta) {

    try {

        const usuarioId = Number(requisicao.params.usuarioId);
        const eventoId = Number(requisicao.params.eventoId);

        const resultado = verificarInscricao(usuarioId, eventoId);

        return resposta.status(200).json(resultado);

    } catch (erro) {

        return resposta.status(404).json({
            mensagem: erro.message
        });

    }
}