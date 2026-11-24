import fs from "fs";
import path from "path";
import { executar } from "../db/conexao.js";

function escapeHtml(texto) {
    return String(texto ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#39;");
}

export async function gerarCertificado(dados, usuarioSolicitante = null) {
    const uid = Number(dados.usuarioId || usuarioSolicitante?.usuarioId);
    const eid = Number(dados.eventoId);

    if (!uid || !eid) {
        throw new Error("Usuário e evento são obrigatórios para a emissão do certificado.");
    }

    if (usuarioSolicitante) {
        const ehProprioUsuario = uid === Number(usuarioSolicitante.usuarioId);
        const ehOrganizador = Number(usuarioSolicitante.tipo) === 0;
        const ehAdmin = ehOrganizador && Boolean(usuarioSolicitante.adm);

        if (!ehProprioUsuario && !ehOrganizador) {
            throw new Error("Acesso não autorizado: você não pode emitir certificados de outro usuário.");
        }

        if (ehOrganizador && !ehAdmin && !ehProprioUsuario) {
            const evRes = await executar("SELECT idOrganizador FROM Evento WHERE eventoId = ?", [eid]);
            if (evRes.length === 0) throw new Error("Evento não encontrado.");
            if (Number(evRes[0].idOrganizador) !== Number(usuarioSolicitante.usuarioId)) {
                throw new Error("Acesso não autorizado: apenas o organizador do evento pode emitir certificados para seus participantes.");
            }
        }
    }

    const inscricaoResultado = await executar(
        `SELECT
            u.usuarioId,
            u.nome AS nomeParticipante,
            u.matricula,
            u.siape,
            e.eventoId,
            e.nome AS nomeEvento,
            e.data AS dataEvento,
            e.cargaHoraria,
            i.presente
         FROM Usuario u
         INNER JOIN Inscricao i ON u.usuarioId = i.usuarioId
         INNER JOIN Evento e ON i.eventoId = e.eventoId
         WHERE u.usuarioId = ? AND e.eventoId = ?`,
        [uid, eid]
    );

    if (inscricaoResultado.length === 0) {
        const userExists = await executar("SELECT usuarioId FROM Usuario WHERE usuarioId = ?", [uid]);
        if (userExists.length === 0) throw new Error("Usuário não encontrado.");

        const eventExists = await executar("SELECT eventoId FROM Evento WHERE eventoId = ?", [eid]);
        if (eventExists.length === 0) throw new Error("Evento não encontrado.");

        throw new Error("Usuário não está inscrito neste evento.");
    }

    const dadosEvento = inscricaoResultado[0];

    if (!dadosEvento.presente) {
        throw new Error("Usuário não possui presença confirmada neste evento para emissão de certificado.");
    }

    const certificadoExistente = await executar(
        `SELECT *
         FROM Certificado
         WHERE usuarioId = ? AND eventoId = ?`,
        [uid, eid]
    );

    if (certificadoExistente.length > 0) {
        const existente = certificadoExistente[0];
        return {
            certificadoId: existente.certificadoId,
            codigo: path.basename(existente.arquivo, path.extname(existente.arquivo)),
            usuarioId: uid,
            eventoId: eid,
            nomeParticipante: dadosEvento.nomeParticipante,
            nomeEvento: dadosEvento.nomeEvento,
            dataEvento: dadosEvento.dataEvento,
            cargaHoraria: existente.cargaHoraria,
            formato: path.extname(existente.arquivo).replace(".", "") || "html",
            caminho: existente.arquivo,
            urlDownload: `/certificados/${path.basename(existente.arquivo)}`,
            jaExistia: true
        };
    }

    const codigo = `SEAC-${Date.now()}`;
    const identificador = dadosEvento.matricula
        ? `Matrícula: ${dadosEvento.matricula}`
        : `SIAPE: ${dadosEvento.siape}`;

    const dataFormatada = dadosEvento.dataEvento
        ? new Date(dadosEvento.dataEvento).toLocaleDateString("pt-BR")
        : "data informada";

    const html = `
        <!DOCTYPE html>
        <html lang="pt-BR">
        <head>
            <meta charset="UTF-8">
            <title>Certificado - ${escapeHtml(dadosEvento.nomeEvento)}</title>
            <style>
                @page { size: A4 landscape; margin: 0; }
                body {
                    margin: 0;
                    padding: 0;
                    font-family: Arial, sans-serif;
                    background: #f8fafc;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    min-height: 100vh;
                }
                .certificado {
                    width: 90%;
                    max-width: 950px;
                    border: 12px solid #166534;
                    box-sizing: border-box;
                    padding: 60px 50px;
                    background: white;
                    text-align: center;
                    box-shadow: 0 10px 30px rgba(0,0,0,0.08);
                }
                h1 {
                    font-size: 34px;
                    color: #166534;
                    margin-bottom: 25px;
                    letter-spacing: 2px;
                    text-transform: uppercase;
                }
                .texto {
                    font-size: 20px;
                    line-height: 1.7;
                    color: #334155;
                }
                .nome {
                    font-size: 32px;
                    font-weight: bold;
                    color: #0f172a;
                    margin: 25px 0 10px;
                }
                .identificacao {
                    font-size: 18px;
                    color: #64748b;
                    margin-bottom: 25px;
                }
                .destaque {
                    color: #166534;
                    font-weight: bold;
                }
                .codigo {
                    margin-top: 45px;
                    font-size: 13px;
                    color: #94a3b8;
                    border-top: 1px dashed #cbd5e1;
                    padding-top: 15px;
                }
            </style>
        </head>
        <body>
            <div class="certificado">
                <h1>INSTITUTO FEDERAL DO CEARÁ — SEAC</h1>
                <div class="texto">Certificamos que</div>
                <div class="nome">${escapeHtml(dadosEvento.nomeParticipante)}</div>
                <div class="identificacao">${escapeHtml(identificador)}</div>
                <div class="texto">
                    participou com êxito do evento <span class="destaque">${escapeHtml(dadosEvento.nomeEvento)}</span>,
                    realizado em ${escapeHtml(dataFormatada)}.
                </div>
                <div class="texto" style="margin-top: 15px;">
                    Carga horária total: <strong>${escapeHtml(dadosEvento.cargaHoraria)} horas</strong>.
                </div>
                <div class="codigo">
                    Código de autenticidade: <strong>${escapeHtml(codigo)}</strong>
                </div>
            </div>
        </body>
        </html>
    `;

    const pastaCertificados = path.resolve("./certificados");
    if (!fs.existsSync(pastaCertificados)) {
        fs.mkdirSync(pastaCertificados, { recursive: true });
    }

    const caminhoArquivo = path.join(pastaCertificados, `${codigo}.html`);
    const formatoArquivo = "html";
    fs.writeFileSync(caminhoArquivo, html, "utf-8");

    const insertRes = await executar(
        `INSERT INTO Certificado
         (cargaHoraria, arquivo, dataEmissao, usuarioId, eventoId)
         VALUES (?, ?, ?, ?, ?)`,
        [
            dadosEvento.cargaHoraria,
            caminhoArquivo,
            new Date(),
            uid,
            eid
        ]
    );

    return {
        certificadoId: insertRes.insertId,
        codigo,
        usuarioId: uid,
        eventoId: eid,
        nomeParticipante: dadosEvento.nomeParticipante,
        identificacao: identificador,
        nomeEvento: dadosEvento.nomeEvento,
        dataEvento: dadosEvento.dataEvento,
        cargaHoraria: dadosEvento.cargaHoraria,
        formato: formatoArquivo,
        caminho: caminhoArquivo,
        urlDownload: `/certificados/${path.basename(caminhoArquivo)}`,
        jaExistia: false
    };
}

export async function listarCertificadosUsuario(usuarioId) {
    const uid = Number(usuarioId);
    if (!uid) {
        throw new Error("Identificador do usuário não informado.");
    }

    const lista = await executar(
        `SELECT c.certificadoId, c.cargaHoraria, c.arquivo, c.dataEmissao, c.usuarioId, c.eventoId,
                e.nome AS nomeEvento, e.data AS dataEvento, e.local AS localEvento
         FROM Certificado c
         INNER JOIN Evento e ON c.eventoId = e.eventoId
         WHERE c.usuarioId = ?`,
        [uid]
    );

    return lista.map(c => ({
        certificadoId: c.certificadoId,
        codigo: path.basename(c.arquivo, path.extname(c.arquivo)),
        cargaHoraria: c.cargaHoraria,
        dataEmissao: c.dataEmissao,
        usuarioId: c.usuarioId,
        eventoId: c.eventoId,
        nomeEvento: c.nomeEvento,
        dataEvento: c.dataEvento,
        localEvento: c.localEvento,
        formato: path.extname(c.arquivo).replace(".", "") || "html",
        urlDownload: `/certificados/${path.basename(c.arquivo)}`
    }));
}