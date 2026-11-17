import {
    filtrarEventos,
    pesquisarEventos,
    cadastrarEvento,
    deletarEvento,
    editarEvento,
    listarDetalhesEvento,
    listarEventos,
    salvarImagemEvento,
    listarImagensEvento
} from "../services/servicoEvento.js";

export async function CadastrarEvento(requisicao, resposta) {
    try {
        const evento = await cadastrarEvento({
            ...requisicao.body,
            idOrganizador: requisicao.usuario.usuarioId
        });

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

export async function ListarEventos(requisicao, resposta) {
    try {
        const { pesquisa, tipo, categoria, data, cargaHoraria } = requisicao.query;

        if (pesquisa || tipo || categoria || data || cargaHoraria) {
            const eventos = await filtrarEventos(requisicao.query);
            return resposta.status(200).json({
                mensagem: "Eventos listados com sucesso",
                eventos
            });
        }

        const eventos = await listarEventos();

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

export async function ListarDetalhesEventos(requisicao, resposta) {
    try {
        const id = Number(requisicao.params.id || requisicao.query.id);
        const detalhesEventos = await listarDetalhesEvento(id);

        return resposta.status(200).json({
            mensagem: "Detalhes do evento listados com sucesso",
            detalhesEventos
        });

    } catch (erro) {
        const status = erro.message.includes("não encontrado") ? 404 : 400;
        return resposta.status(status).json({
            mensagem: erro.message
        });
    }
}

export async function EditarEvento(requisicao, resposta) {
    try {
        const idEvento = Number(requisicao.params.id);
        const idOrganizador = requisicao.usuario.usuarioId;
        const isAdmin = Boolean(requisicao.usuario.adm);

        const eventoEditado = await editarEvento(idEvento, idOrganizador, requisicao.body, isAdmin);

        return resposta.status(200).json({
            mensagem: "Evento editado com sucesso",
            eventoEditado
        });

    } catch (erro) {
        const status = erro.message.includes("não autorizado") ? 403 : (erro.message.includes("não encontrado") ? 404 : 400);
        return resposta.status(status).json({
            mensagem: erro.message
        });
    }
}

export async function DeletarEvento(requisicao, resposta) {
    try {
        const idEvento = Number(requisicao.params.id);
        const idOrganizador = requisicao.usuario.usuarioId;
        const isAdmin = Boolean(requisicao.usuario.adm);

        await deletarEvento(idEvento, idOrganizador, isAdmin);

        return resposta.status(200).json({
            mensagem: "Evento deletado com sucesso"
        });

    } catch (erro) {
        const status = erro.message.includes("não autorizado") ? 403 : (erro.message.includes("não encontrado") ? 404 : 400);
        return resposta.status(status).json({
            mensagem: erro.message
        });
    }
}

export async function PesquisarEventos(requisicao, resposta) {
    try {
        const pesquisa = requisicao.query.pesquisa || "";
        const eventosEncontrados = await pesquisarEventos(pesquisa);

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

export async function FiltrarEventos(requisicao, resposta) {
    try {
        const eventosFiltrados = await filtrarEventos(requisicao.query);

        return resposta.status(200).json({
            mensagem: "Eventos filtrados com sucesso",
            eventosFiltrados
        });

    } catch (erro) {
        return resposta.status(400).json({
            mensagem: erro.message
        });
    }
}

export async function UploadImagemEvento(requisicao, resposta) {
    try {
        const idEvento = Number(requisicao.params.id);
        const imagem = await salvarImagemEvento(
            idEvento,
            requisicao.usuario.usuarioId,
            requisicao.body,
            Boolean(requisicao.usuario.adm)
        );

        return resposta.status(201).json({
            mensagem: "Imagem enviada com sucesso",
            imagem
        });
    } catch (erro) {
        const status = erro.message.includes("não autorizado") ? 403 : (erro.message.includes("não encontrado") ? 404 : 400);
        return resposta.status(status).json({
            mensagem: erro.message
        });
    }
}

export async function ListarImagensEvento(requisicao, resposta) {
    try {
        const idEvento = Number(requisicao.params.id);
        const imagens = await listarImagensEvento(idEvento);
        return resposta.status(200).json({
            mensagem: "Imagens listadas com sucesso",
            imagens
        });
    } catch (erro) {
        return resposta.status(400).json({
            mensagem: erro.message
        });
    }
}