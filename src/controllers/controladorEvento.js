import { filtrarEventos, pesquisarEventos, cadastrarEvento, deletarEvento, editarEvento, listarDetalhesEvento, listarEventos } from "../services/servicoEvento.js";


export function cadastrarEvento(requisicao, resposta) {

    try {
        
        const evento = cadastrarEvento(requisicao.body);

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

        const eventos = listarEventos();

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

export function listarDetalhesEvento(requisicao, resposta) {

    try {
        const id = Number(requisicao.params.id);
        const detalhesEventos = listarDetalhesEvento(id);

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

        const eventoEditado = editarEvento(requisicao.params.id, requisicao.body.idOrganizador, requisicao.body);

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

        deletarEvento(requisicao.params.id, requisicao.body.idOrganizador);

        return resposta.status(200).json({
            mensagem: "Evento deletado com sucesso"
        });

    } catch (erro) {

        return resposta.status(400).json({
            mensagem: erro.message
        });

    }
}

export function pesquisarEventos(requisicao, resposta) {

    try {

        const pesquisa = requisicao.query.pesquisa;
        const eventosEncontrados = pesquisarEventos(pesquisa);

        return resposta.status(200).json({
            mensagem: "Eventos encontrados com sucesso",
            eventosEncontrados
        });

    } catch (erro) {

        return resposta.status(400).json({
            mensagem: erro.message
        });

    }
}

export function filtrarEventos(requisicao, resposta) {

    try {

        const filtro = requisicao.query.filtro;
        const eventosFiltrados = filtrarEventos(filtro);

        return resposta.status(200).json({
            mensagem: "Eventos filtrados com sucesso",
            eventosFiltrados
        });

    } catch (erro) {

        return resposta.status(400).json({
            mensagem: erro.message
        });

    }
};