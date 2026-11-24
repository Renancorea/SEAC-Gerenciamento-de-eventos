import {
    relatorioGeralUsuarios,
    relatorioGeralEventos,
    relatorioUsuariosEvento
} from "../services/servicoRelatorio.js";
import { exigirAutenticacao } from "../services/servicoAutenticacao.js";

export async function RelatorioGeralUsuarios(requisicao, resposta) {
    try {
        await exigirAutenticacao(requisicao, { admin: true });
        const relatorio = await relatorioGeralUsuarios();

        return resposta.status(200).json({
            mensagem: "Relatório geral de usuários gerado com sucesso",
            relatorio
        });

    } catch (erro) {
        return resposta.status(erro.status || 400).json({
            mensagem: erro.message
        });
    }
}

export async function RelatorioGeralEventos(requisicao, resposta) {
    try {
        await exigirAutenticacao(requisicao, { organizador: true });
        const relatorio = await relatorioGeralEventos();

        return resposta.status(200).json({
            mensagem: "Relatório geral de eventos gerado com sucesso",
            relatorio
        });

    } catch (erro) {
        return resposta.status(erro.status || 400).json({
            mensagem: erro.message
        });
    }
}

export async function RelatorioUsuariosEvento(requisicao, resposta) {
    try {
        const usuario = await exigirAutenticacao(requisicao, { organizador: true });
        const idEvento = Number(requisicao.params.eventoId || requisicao.query.eventoId);

        if (!idEvento) {
            return resposta.status(400).json({
                mensagem: "Identificador do evento não informado."
            });
        }

        const relatorio = await relatorioUsuariosEvento(idEvento, usuario);

        return resposta.status(200).json({
            mensagem: "Relatório de usuários do evento gerado com sucesso",
            relatorio
        });

    } catch (erro) {
        const status = erro.status || (erro.message.includes("não autorizado") ? 403 : (erro.message.includes("não encontrado") ? 404 : 400));
        return resposta.status(status).json({
            mensagem: erro.message
        });
    }
}