import { cadastrar } from "../services/servicoUsuario.js";
import { obterUsuarioOpcional } from "../services/servicoAutenticacao.js";

export async function Cadastrar(requisicao, resposta) {
    try {
        const usuarioAutenticado = await obterUsuarioOpcional(requisicao);
        const usuario = await cadastrar(requisicao.body, usuarioAutenticado);

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