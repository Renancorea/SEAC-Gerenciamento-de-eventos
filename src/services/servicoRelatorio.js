import fs from "fs";
import path from "path";
import puppeteer from "puppeteer";
import { executar } from "../db/conexao.js";

async function gerarPdfRelatorio(html, nomeArquivo) {
    const pastaRelatorios = path.resolve("./relatorios");
    if (!fs.existsSync(pastaRelatorios)) {
        fs.mkdirSync(pastaRelatorios, { recursive: true });
    }

    let caminho = path.join(pastaRelatorios, `${nomeArquivo}.pdf`);
    let formato = "pdf";

    try {
        const gerarPdf = async () => {
            const browser = await puppeteer.launch({
                headless: true,
                args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-dev-shm-usage", "--disable-gpu"]
            });
            try {
                const page = await browser.newPage();
                await page.setContent(html, { waitUntil: "networkidle0" });
                await page.pdf({
                    path: caminho,
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
    } catch (erro) {
        console.warn("[SEAC] Puppeteer indisponível para relatório. Salvando em HTML:", erro.message);
        caminho = path.join(pastaRelatorios, `${nomeArquivo}.html`);
        formato = "html";
        fs.writeFileSync(caminho, html, "utf-8");
    }

    return { caminho, formato };
}

export async function relatorioGeralUsuarios() {
    const usuarios = await executar(
        `SELECT usuarioId, nome, matricula, siape, email, tipo
         FROM Usuario
         ORDER BY nome ASC`
    );

    const codigo = `SEAC-RGU-${Date.now()}`;

    const html = `
        <!DOCTYPE html>
        <html lang="pt-BR">
        <head>
            <meta charset="UTF-8">
            <title>Relatório Geral de Usuários</title>
            <style>
                body { margin: 0; padding: 40px; font-family: Arial, sans-serif; background: #fff; color: #1e293b; }
                .relatorio { max-width: 900px; margin: auto; border: 2px solid #0f766e; padding: 30px; }
                h1 { color: #0f766e; font-size: 24px; border-bottom: 2px solid #0f766e; padding-bottom: 8px; }
                table { width: 100%; border-collapse: collapse; margin-top: 20px; font-size: 14px; }
                th, td { border: 1px solid #cbd5e1; padding: 8px 12px; text-align: left; }
                th { background-color: #f1f5f9; color: #0f766e; }
                .codigo { margin-top: 30px; font-size: 12px; color: #64748b; border-top: 1px dashed #cbd5e1; padding-top: 10px; }
            </style>
        </head>
        <body>
            <div class="relatorio">
                <h1>SEAC — Relatório Geral de Usuários</h1>
                <p><strong>Total de usuários cadastrados:</strong> ${usuarios.length}</p>
                <table>
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Nome</th>
                            <th>Perfil</th>
                            <th>Identificação</th>
                            <th>E-mail</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${usuarios.map(u => `
                            <tr>
                                <td>${u.usuarioId}</td>
                                <td>${u.nome}</td>
                                <td>${Number(u.tipo) === 0 ? "Organizador" : "Participante"}</td>
                                <td>${u.matricula ? `Matrícula: ${u.matricula}` : `SIAPE: ${u.siape}`}</td>
                                <td>${u.email}</td>
                            </tr>
                        `).join("")}
                    </tbody>
                </table>
                <div class="codigo">Código de autenticidade: <strong>${codigo}</strong></div>
            </div>
        </body>
        </html>
    `;

    const arquivoInfo = await gerarPdfRelatorio(html, codigo);

    return {
        codigo,
        totalUsuarios: usuarios.length,
        usuarios: usuarios.map(u => ({
            usuarioId: u.usuarioId,
            nome: u.nome,
            tipo: Number(u.tipo) === 0 ? "Organizador" : "Participante",
            identificacao: u.matricula || u.siape,
            email: u.email
        })),
        arquivo: arquivoInfo.caminho,
        formato: arquivoInfo.formato
    };
}

export async function relatorioGeralEventos() {
    const eventos = await executar(
        `SELECT eventoId, nome, local, data, horario, tipo, categoria, assentos, cargaHoraria
         FROM Evento
         ORDER BY data ASC`
    );

    const codigo = `SEAC-RGE-${Date.now()}`;

    const html = `
        <!DOCTYPE html>
        <html lang="pt-BR">
        <head>
            <meta charset="UTF-8">
            <title>Relatório Geral de Eventos</title>
            <style>
                body { margin: 0; padding: 40px; font-family: Arial, sans-serif; background: #fff; color: #1e293b; }
                .relatorio { max-width: 900px; margin: auto; border: 2px solid #0f766e; padding: 30px; }
                h1 { color: #0f766e; font-size: 24px; border-bottom: 2px solid #0f766e; padding-bottom: 8px; }
                table { width: 100%; border-collapse: collapse; margin-top: 20px; font-size: 14px; }
                th, td { border: 1px solid #cbd5e1; padding: 8px 12px; text-align: left; }
                th { background-color: #f1f5f9; color: #0f766e; }
                .codigo { margin-top: 30px; font-size: 12px; color: #64748b; border-top: 1px dashed #cbd5e1; padding-top: 10px; }
            </style>
        </head>
        <body>
            <div class="relatorio">
                <h1>SEAC — Relatório Geral de Eventos</h1>
                <p><strong>Total de eventos cadastrados:</strong> ${eventos.length}</p>
                <table>
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Nome do Evento</th>
                            <th>Tipo / Categoria</th>
                            <th>Data</th>
                            <th>Local</th>
                            <th>Vagas</th>
                            <th>Carga Horária</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${eventos.map(e => `
                            <tr>
                                <td>${e.eventoId}</td>
                                <td>${e.nome}</td>
                                <td>${e.tipo || ""} / ${e.categoria || ""}</td>
                                <td>${e.data} ${e.horario}</td>
                                <td>${e.local}</td>
                                <td>${e.assentos}</td>
                                <td>${e.cargaHoraria}h</td>
                            </tr>
                        `).join("")}
                    </tbody>
                </table>
                <div class="codigo">Código de autenticidade: <strong>${codigo}</strong></div>
            </div>
        </body>
        </html>
    `;

    const arquivoInfo = await gerarPdfRelatorio(html, codigo);

    return {
        codigo,
        totalEventos: eventos.length,
        eventos,
        arquivo: arquivoInfo.caminho,
        formato: arquivoInfo.formato
    };
}

export async function relatorioUsuariosEvento(idEvento) {
    if (!idEvento) {
        throw new Error("Identificador do evento não informado.");
    }

    const eid = Number(idEvento);

    const eventoResultado = await executar(
        `SELECT eventoId, nome, data, local FROM Evento WHERE eventoId = ?`,
        [eid]
    );

    if (eventoResultado.length === 0) {
        throw new Error("Evento não encontrado.");
    }

    const evento = eventoResultado[0];

    // Busca de inscritos no evento usando a tabela oficial Inscricao
    const inscritos = await executar(
        `SELECT u.usuarioId, u.nome, u.matricula, u.siape, u.email,
                i.presente, i.dataInscricao
         FROM Usuario u
         INNER JOIN Inscricao i ON u.usuarioId = i.usuarioId
         WHERE i.eventoId = ?
         ORDER BY u.nome ASC`,
        [eid]
    );

    const codigo = `SEAC-RUE-${Date.now()}`;

    const html = `
        <!DOCTYPE html>
        <html lang="pt-BR">
        <head>
            <meta charset="UTF-8">
            <title>Relatório de Usuários do Evento</title>
            <style>
                body { margin: 0; padding: 40px; font-family: Arial, sans-serif; background: #fff; color: #1e293b; }
                .relatorio { max-width: 900px; margin: auto; border: 2px solid #0f766e; padding: 30px; }
                h1 { color: #0f766e; font-size: 24px; border-bottom: 2px solid #0f766e; padding-bottom: 8px; }
                table { width: 100%; border-collapse: collapse; margin-top: 20px; font-size: 14px; }
                th, td { border: 1px solid #cbd5e1; padding: 8px 12px; text-align: left; }
                th { background-color: #f1f5f9; color: #0f766e; }
                .codigo { margin-top: 30px; font-size: 12px; color: #64748b; border-top: 1px dashed #cbd5e1; padding-top: 10px; }
            </style>
        </head>
        <body>
            <div class="relatorio">
                <h1>SEAC — Relatório de Participantes do Evento</h1>
                <p><strong>Evento:</strong> ${evento.nome} | <strong>Data:</strong> ${evento.data} | <strong>Local:</strong> ${evento.local}</p>
                <p><strong>Total de inscritos:</strong> ${inscritos.length}</p>
                <table>
                    <thead>
                        <tr>
                            <th>Nome</th>
                            <th>Identificação</th>
                            <th>E-mail</th>
                            <th>Presença Confirmada</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${inscritos.map(u => `
                            <tr>
                                <td>${u.nome}</td>
                                <td>${u.matricula ? `Matrícula: ${u.matricula}` : `SIAPE: ${u.siape}`}</td>
                                <td>${u.email}</td>
                                <td>${u.presente ? "Sim" : "Não"}</td>
                            </tr>
                        `).join("")}
                    </tbody>
                </table>
                <div class="codigo">Código de autenticidade: <strong>${codigo}</strong></div>
            </div>
        </body>
        </html>
    `;

    const arquivoInfo = await gerarPdfRelatorio(html, codigo);

    return {
        codigo,
        eventoId: eid,
        nomeEvento: evento.nome,
        totalInscritos: inscritos.length,
        inscritos,
        arquivo: arquivoInfo.caminho,
        formato: arquivoInfo.formato
    };
}