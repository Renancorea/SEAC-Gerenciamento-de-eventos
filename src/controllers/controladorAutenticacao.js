import {
    login,
    logout,
    extrairToken,
    exigirAutenticacao
} from "../services/servicoAutenticacao.js";

export async function Login(requisicao, resposta) {
    try {
        const resultado = await login(requisicao.body);

        return resposta.status(200).json({
            mensagem: "Login realizado com sucesso",
            token: resultado.token,
            usuario: resultado.usuario
        });

    } catch (erro) {
        return resposta.status(401).json({
            mensagem: erro.message || "Erro ao realizar login"
        });
    }
}

export async function Logout(requisicao, resposta) {
    try {
        const token = extrairToken(requisicao) || requisicao.body?.token;
        await logout(token);

        return resposta.status(200).json({
            mensagem: "Logout realizado com sucesso"
        });
    } catch (erro) {
        return resposta.status(400).json({
            mensagem: erro.message || "Erro ao realizar logout"
        });
    }
}

export async function SessaoAtual(requisicao, resposta) {
    try {
        const usuario = await exigirAutenticacao(requisicao);
        return resposta.status(200).json({
            mensagem: "Sessão ativa",
            usuario
        });
    } catch (erro) {
        return resposta.status(erro.status || 401).json({
            mensagem: erro.message || "Falha ao validar sessão."
        });
    }
}