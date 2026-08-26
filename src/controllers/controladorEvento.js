const servicoEvento = require("../services/servicoEvento.js");

export function cadastrarEvento(requisicao, resposta) {

    try {

        const evento = servicoEvento.cadastrarEvento(requisicao.body);

        return resposta.status(201).json({
            mensagem: "Evento cadastrado com sucesso",
            evento
        });

    } catch (erro) {

        return resposta.status(400).json({
            mensagem: erro.message
        });

    }
}

export function listarEventos(requisicao, resposta) {

    try {

        const eventos = servicoEvento.listarEventos();

        return resposta.status(200).json({
            mensagem: "Eventos listados com sucesso",
            eventos
        });

    } catch (erro) {

        return resposta.status(400).json({
            mensagem: erro.message
        });

    }
}

export function listarDetalhesEventos(requisicao, resposta) {

    try {

        const detalhesEventos = servicoEvento.listarDetalhesEventos();

        return resposta.status(200).json({
            mensagem: "Detalhes dos eventos listados com sucesso",
            detalhesEventos
        });

    } catch (erro) {

        return resposta.status(400).json({
            mensagem: erro.message
        });

    }
}

export function editarEvento(requisicao, resposta) {

    try {

        const eventoEditado = servicoEvento.editarEvento(requisicao.params.id, requisicao.body);

        return resposta.status(200).json({
            mensagem: "Evento editado com sucesso",
            eventoEditado
        });

    } catch (erro) {

        return resposta.status(400).json({
            mensagem: erro.message
        });

    }
}

export function deletarEvento(requisicao, resposta) {

    try {

        servicoEvento.deletarEvento(requisicao.params.id);

        return resposta.status(200).json({
            mensagem: "Evento deletado com sucesso"
        });

    } catch (erro) {

        return resposta.status(400).json({
            mensagem: erro.message
        });

    }
}