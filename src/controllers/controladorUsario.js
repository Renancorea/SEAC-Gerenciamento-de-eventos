import servicoUsuario from "../services/servicoUsuario.js";

export function cadastrar(requisicao, resposta) {
    try {
        const usuario = servicoUsuario.cadastrar(requisicao.body);

        return resposta.status(201).json({
            mensagem: "Usuário cadastrado com sucesso",
            usuario
        });

    } catch (erro) {
        return resposta.status(400).json({
            mensagem: erro
        });
    }
}

export function login(requisicao, resposta) {
    try {
        const usuario = servicoUsuario.login(requisicao.body);

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
