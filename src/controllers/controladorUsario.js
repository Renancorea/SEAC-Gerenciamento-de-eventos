import { cadastrar } from "../services/servicoUsuario.js";

export async function Cadastrar(requisicao, resposta) {
    try {
        const usuario = await cadastrar(requisicao.body, requisicao.usuario || null);

        return resposta.status(201).json({
            mensagem: "Usuário cadastrado com sucesso",
            usuario
        });

    } catch (erro) {
        const status = erro.message.includes("já está") ? 409 : 400;
        return resposta.status(status).json({
            mensagem: erro.message
        });
    }
}