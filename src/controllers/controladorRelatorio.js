import { relatorioGeralUsuarios, relatorioGeralEventos, relatorioUsuariosEvento } from '../services/servicoRelatorio.js';

export function RelatorioGeralUsuarios(requisicao, resposta) {

    try {

        const relatorio = relatorioGeralUsuarios();

        return resposta.status(200).json({
            mensagem: "Relatório geral de usuários gerado com sucesso",
            relatorio
        });

    } catch (erro) {

        return resposta.status(400).json({
            mensagem: erro.message
        });

    }
}

export function RelatorioGeralEventos(requisicao, resposta) {

    try {

        const relatorio = relatorioGeralEventos();

        return resposta.status(200).json({
            mensagem: "Relatório geral de eventos gerado com sucesso", relatorio
        });

    } catch (erro) {

        return resposta.status(400).json({
            mensagem: erro.message
        });

    }
} 
export function RelatorioUsuariosEvento(requisicao, resposta) {
    
    try {

        const usuarioId = Number(requisicao.params.usuarioId);
        const relatorio = relatorioUsuariosEvento(usuarioId);

        return resposta.status(200).json({
            mensagem: "Relatório de usuarios em um evento gerado com sucesso", relatorio
        });

    } catch (erro) {

        return resposta.status(400).json({
            mensagem: erro.message
        });

    }
}