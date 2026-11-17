import { gerarCertificado, listarCertificadosUsuario } from "../services/servicoCertificado.js";

export async function GerarCertificado(requisicao, resposta) {
    try {
        const certificado = await gerarCertificado(requisicao.body, requisicao.usuario);

        return resposta.status(certificado.jaExistia ? 200 : 201).json({
            mensagem: certificado.jaExistia
                ? "Certificado já emitido anteriormente"
                : "Certificado gerado com sucesso",
            certificado
        });

    } catch (erro) {
        const status = erro.message.includes("não autorizado") ? 403 : (erro.message.includes("não encontrado") ? 404 : 400);
        return resposta.status(status).json({
            mensagem: erro.message
        });
    }
}

export async function MeusCertificados(requisicao, resposta) {
    try {
        const certificados = await listarCertificadosUsuario(requisicao.usuario.usuarioId);
        return resposta.status(200).json({
            mensagem: "Certificados listados com sucesso",
            certificados
        });
    } catch (erro) {
        return resposta.status(400).json({
            mensagem: erro.message
        });
    }
}

export async function ListarCertificadosPorUsuario(requisicao, resposta) {
    try {
        const usuarioId = Number(requisicao.params.usuarioId);
        if (usuarioId !== requisicao.usuario.usuarioId && !requisicao.usuario.adm) {
            return resposta.status(403).json({
                mensagem: "Acesso não autorizado aos certificados de outro usuário."
            });
        }

        const certificados = await listarCertificadosUsuario(usuarioId);
        return resposta.status(200).json({
            mensagem: "Certificados listados com sucesso",
            certificados
        });
    } catch (erro) {
        return resposta.status(400).json({
            mensagem: erro.message
        });
    }
}