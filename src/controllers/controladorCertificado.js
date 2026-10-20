import { gerarCertificado } from "../services/servicoCertificado.js";

export async function GerarCertificado(requisicao, resposta) {
    try {
        const certificado = await gerarCertificado(requisicao.body);

        return resposta.status(201).json({
            mensagem: "Certificado gerado com sucesso",
            certificado
        });

    } catch (erro) {
        const status = erro.message.includes("não encontrado") ? 404 : 400;
        return resposta.status(status).json({
            mensagem: erro.message
        });
    }
}