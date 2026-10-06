import { cadastrar } from "../services/servicoUsuario.js";

export async function Cadastrar(requisicao, resposta) {

    try {

        const usuario = await cadastrar(requisicao.body);

        return resposta.status(201).json({

            mensagem: "Usuário cadastrado com sucesso",

        });

    } catch (erro) {

        return resposta.status(400).json({

            mensagem: erro.message

        });

    }

}