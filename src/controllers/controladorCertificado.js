import { gerarCertificado } from "../services/servicoCertificado.js";


export async function gerarCertificado(requisicao, resposta) {

    try {

        const certificado = await gerarCertificado(requisicao.body);

        return resposta.status(201).json({
            mensagem: "Certificado gerado com sucesso",
            certificado
        });

    } catch (erro) {

        return resposta.status(400).json({
            mensagem: erro.message
        });

    }
}