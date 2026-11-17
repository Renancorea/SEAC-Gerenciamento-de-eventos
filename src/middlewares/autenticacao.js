import { verificarSessao } from "../services/servicoAutenticacao.js";

function extrairToken(requisicao) {
    const authHeader = requisicao.headers.authorization;
    if (authHeader && authHeader.startsWith("Bearer ")) {
        return authHeader.substring(7).trim();
    }
    if (requisicao.query?.token) {
        return String(requisicao.query.token).trim();
    }
    return null;
}

export async function autenticarUsuario(requisicao, resposta, proximo) {
    try {
        const token = extrairToken(requisicao);
        if (!token) {
            return resposta.status(401).json({
                mensagem: "Autenticação necessária. Faça login para continuar."
            });
        }

        const usuario = await verificarSessao(token);
        if (!usuario) {
            return resposta.status(401).json({
                mensagem: "Sessão inválida ou expirada. Faça login novamente."
            });
        }

        requisicao.usuario = usuario;
        requisicao.tokenSessao = token;
        return proximo();
    } catch (erro) {
        return resposta.status(401).json({
            mensagem: "Falha ao validar sessão."
        });
    }
}

export async function autenticarOpcional(requisicao, resposta, proximo) {
    try {
        const token = extrairToken(requisicao);
        if (token) {
            const usuario = await verificarSessao(token);
            if (usuario) {
                requisicao.usuario = usuario;
                requisicao.tokenSessao = token;
            }
        }
    } catch {
        // Ignora token inválido no modo opcional
    }
    return proximo();
}

export function exigirOrganizador(requisicao, resposta, proximo) {
    if (!requisicao.usuario || Number(requisicao.usuario.tipo) !== 0) {
        return resposta.status(403).json({
            mensagem: "Acesso restrito a organizadores."
        });
    }
    return proximo();
}

export function exigirAdmin(requisicao, resposta, proximo) {
    if (!requisicao.usuario || Number(requisicao.usuario.tipo) !== 0 || !requisicao.usuario.adm) {
        return resposta.status(403).json({
            mensagem: "Acesso restrito a administradores."
        });
    }
    return proximo();
}
