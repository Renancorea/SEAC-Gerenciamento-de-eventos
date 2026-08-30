import { login, logout} from "../services/servicoAutenticacao.js";

export function login(requisicao, resposta) {
    try {
        const usuario = login(requisicao.body);

        return resposta.status(200).json({
            mensagem: "Login realizado com sucesso",
            usuario
        });

    } catch (erro) {
        return resposta.status(400).json({
            mensagem: erro
        });
    }
}

export function logout(resposta) {
    try {
        logout();
    
        return resposta.status(200).json({
            mensagem: "Logout realizado com sucesso"
        })
    } catch (erro) {
        return resposta.status(400).json({
            mensagem: erro
        });
    }
}
// Erro no logout é triste kkkkkkkkkkkkkkkkkkkkkkkkk