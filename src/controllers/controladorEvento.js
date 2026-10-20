import {
    filtrarEventos,
    pesquisarEventos,
    cadastrarEvento,
    deletarEvento,
    editarEvento,
    listarDetalhesEvento,
    listarEventos
} from "../services/servicoEvento.js";

export async function CadastrarEvento(requisicao, resposta) {
    try {
        const evento = await cadastrarEvento(requisicao.body);

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
        // Se houver parâmetro de pesquisa na rota principal
        if (requisicao.query.pesquisa) {
            const eventos = await pesquisarEventos(requisicao.query.pesquisa);
            return resposta.status(200).json({
                mensagem: "Eventos listados com sucesso",
                eventos
            });
        }

        // Se houver filtros de categoria, tipo, data ou cargaHoraria
        if (requisicao.query.tipo || requisicao.query.categoria || requisicao.query.data || requisicao.query.cargaHoraria) {
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
        const idOrganizador = Number(requisicao.body.idOrganizador || requisicao.query.idOrganizador);

        const eventoEditado = await editarEvento(idEvento, idOrganizador, requisicao.body);

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
        const idOrganizador = Number(requisicao.body.idOrganizador || requisicao.query.idOrganizador);

        await deletarEvento(idEvento, idOrganizador);

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