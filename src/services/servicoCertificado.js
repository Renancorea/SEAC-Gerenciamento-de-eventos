import fs from "fs";
import path from "path";
import puppeteer from "puppeteer";
import { executar } from "../db/conexao.js";

export async function gerarCertificado(dados) {
    const {
        usuarioId,
        eventoId
    } = dados;

    if (!usuarioId || !eventoId) {
        throw new Error("Usuário e evento são obrigatórios para a emissão do certificado.");
    }

    const uid = Number(usuarioId);
    const eid = Number(eventoId);

    // Validação da inscrição e presença usando a tabela oficial Inscricao
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
        // Verifica se o usuário ou evento existem para mensagem precisa
        const userExists = await executar("SELECT usuarioId FROM Usuario WHERE usuarioId = ?", [uid]);
        if (userExists.length === 0) throw new Error("Usuário não encontrado.");

        const eventExists = await executar("SELECT eventoId FROM Evento WHERE eventoId = ?", [eid]);
        if (eventExists.length === 0) throw new Error("Evento não encontrado.");

        throw new Error("Usuário não está inscrito neste evento.");
    }

    const dadosEvento = inscricaoResultado[0];

    // Verificação de confirmação de presença (presente = true)
    if (!dadosEvento.presente) {
        throw new Error("Usuário não possui presença confirmada neste evento para emissão de certificado.");
    }

    // Impedimento de duplicidade na emissão com base na restrição UNIQUE (usuarioId, eventoId)
    const certificadoExistente = await executar(
        `SELECT *
         FROM Certificado
         WHERE usuarioId = ? AND eventoId = ?`,
        [uid, eid]
    );

    if (certificadoExistente.length > 0) {
        throw new Error("O certificado para este participante já foi emitido.");
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
            <title>Certificado - ${dadosEvento.nomeEvento}</title>
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
                <div class="nome">${dadosEvento.nomeParticipante}</div>
                <div class="identificacao">${identificador}</div>
                <div class="texto">
                    participou com êxito do evento <span class="destaque">${dadosEvento.nomeEvento}</span>,
                    realizado em ${dataFormatada}.
                </div>
                <div class="texto" style="margin-top: 15px;">
                    Carga horária total: <strong>${dadosEvento.cargaHoraria} horas</strong>.
                </div>
                <div class="codigo">
                    Código de autenticidade: <strong>${codigo}</strong>
                </div>
            </div>
        </body>
        </html>
    `;

    // Garante que o diretório ./certificados exista
    const pastaCertificados = path.resolve("./certificados");
    if (!fs.existsSync(pastaCertificados)) {
        fs.mkdirSync(pastaCertificados, { recursive: true });
    }

    let caminhoArquivo = path.join(pastaCertificados, `${codigo}.pdf`);
    let formatoArquivo = "pdf";

    // Tentativa de geração com Puppeteer (com flags seguras de sandbox e timeout rápido de 2s)
    try {
        const gerarPdf = async () => {
            const browser = await puppeteer.launch({
                headless: true,
                args: [
                    "--no-sandbox",
                    "--disable-setuid-sandbox",
                    "--disable-dev-shm-usage",
                    "--disable-gpu"
                ]
            });
            try {
                const page = await browser.newPage();
                await page.setContent(html, { waitUntil: "networkidle0" });
                await page.pdf({
                    path: caminhoArquivo,
                    format: "A4",
                    landscape: true,
                    printBackground: true
                });
            } finally {
                await browser.close();
            }
        };

        const timeoutPromise = new Promise((_, reject) =>
            setTimeout(() => reject(new Error("Timeout ao inicializar Chromium do Puppeteer")), 2000)
        );

        await Promise.race([gerarPdf(), timeoutPromise]);
    } catch (erroPuppeteer) {
        console.warn("[SEAC] Puppeteer indisponível no ambiente. Gerando certificado em formato HTML:", erroPuppeteer.message);
        caminhoArquivo = path.join(pastaCertificados, `${codigo}.html`);
        formatoArquivo = "html";
        fs.writeFileSync(caminhoArquivo, html, "utf-8");
    }

    // Registro do certificado no banco de dados respeitando a tabela Certificado
    await executar(
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
        urlDownload: `/certificados/${path.basename(caminhoArquivo)}`
    };
}