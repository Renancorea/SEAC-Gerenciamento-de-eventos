import puppeteer from "puppeteer";
import Conexao from "../db/conexao.js";


function executar(sql, valores = []) {

    return new Promise((resolve, reject) => {

        Conexao.execute(sql, valores, (err, resultado) => {

            if (err) {
                reject(err);
                return;
            }

            resolve(resultado);

        });

    });

}


export async function relatorioGeralUsuarios() {

    const usuarios = await executar(
        `SELECT nome, matricula, siape
         FROM Usuario`
    );

    const codigo = `SEAC-${Date.now()}`;

    const pdfRelatorioGU = `
        <!DOCTYPE html>

        <html lang="pt-BR">

        <head>

            <meta charset="UTF-8">

            <style>

                body {
                    margin: 0;
                    padding: 0;
                    font-family: Arial, sans-serif;
                }

                .certificado {
                    width: 100%;
                    height: 100vh;
                    display: flex;
                    flex-direction: column;
                    justify-content: center;
                    align-items: center;
                    text-align: center;
                    border: 10px solid #222;
                    box-sizing: border-box;
                    padding: 60px;
                }

                h1 {
                    font-size: 42px;
                    margin-bottom: 40px;
                }

                .texto {
                    font-size: 22px;
                    line-height: 1.6;
                }

                .codigo {
                    margin-top: 50px;
                    font-size: 14px;
                }

            </style>

        </head>

        <body>

            <div class="certificado">

                <h1>Relatório geral usuários</h1>

                <div class="texto">

                    <p>
                        Usuários cadastrados: ${usuarios.length}
                    </p>

                    <p>
                        Nome e matrícula dos usuários:
                    </p>

                    <ul>

                        ${usuarios.map(usuario => `

                            <li>

                                ${usuario.nome} -
                                ${usuario.matricula || usuario.siape + " (SIAPE)"}

                            </li>

                        `).join("")}

                    </ul>

                </div>

                <div class="codigo">

                    Código de autenticidade: ${codigo}

                </div>

            </div>

        </body>

        </html>
    `;


    const browser = await puppeteer.launch();

    try {

        const page = await browser.newPage();

        await page.setContent(pdfRelatorioGU, {
            waitUntil: "networkidle0"
        });

        const relatorio = await page.pdf({

            format: "A4",

            landscape: true,

            printBackground: true

        });

        return relatorio;

    } finally {

        await browser.close();

    }

}


export async function relatorioGeralEventos() {

    const eventos = await executar(
        `SELECT nome, categoria, cargaHoraria
         FROM Evento`
    );

    const codigo = `SEAC-${Date.now()}`;

    const pdfRelatorioGE = `
        <!DOCTYPE html>

        <html lang="pt-BR">

        <head>

            <meta charset="UTF-8">

            <style>

                body {
                    margin: 0;
                    padding: 0;
                    font-family: Arial, sans-serif;
                }

                .certificado {
                    width: 100%;
                    height: 100vh;
                    display: flex;
                    flex-direction: column;
                    justify-content: center;
                    align-items: center;
                    text-align: center;
                    border: 10px solid #222;
                    box-sizing: border-box;
                    padding: 60px;
                }

                h1 {
                    font-size: 42px;
                    margin-bottom: 40px;
                }

                .texto {
                    font-size: 22px;
                    line-height: 1.6;
                }

                .codigo {
                    margin-top: 50px;
                    font-size: 14px;
                }

            </style>

        </head>

        <body>

            <div class="certificado">

                <h1>Relatório geral eventos</h1>

                <div class="texto">

                    <p>
                        Eventos cadastrados: ${eventos.length}
                    </p>

                    <p>
                        Nome, categoria e carga horária dos eventos:
                    </p>

                    <ul>

                        ${eventos.map(evento => `

                            <li>

                                ${evento.nome} -
                                ${evento.categoria} -
                                ${evento.cargaHoraria}

                            </li>

                        `).join("")}

                    </ul>

                </div>

                <div class="codigo">

                    Código de autenticidade: ${codigo}

                </div>

            </div>

        </body>

        </html>
    `;


    const browser = await puppeteer.launch();

    try {

        const page = await browser.newPage();

        await page.setContent(pdfRelatorioGE, {
            waitUntil: "networkidle0"
        });

        const relatorio = await page.pdf({

            format: "A4",

            landscape: true,

            printBackground: true

        });

        return relatorio;

    } finally {

        await browser.close();

    }

}


export async function relatorioUsuariosEvento(idEvento) {

    const participacoes = await executar(
        `SELECT usuarioId
         FROM Participacao
         WHERE eventoId = ? AND inscrito = ?`,
        [idEvento, true]
    );


    const usuarios = await executar(
        `SELECT DISTINCT
            u.nome,
            u.matricula,
            u.siape
         FROM Usuario u
         INNER JOIN Participacao p
             ON u.usuarioId = p.usuarioId
         WHERE p.eventoId = ?
         AND p.inscrito = ?`,
        [idEvento, true]
    );


    const codigo = `SEAC-${Date.now()}`;

    const pdfRelatorioUE = `
        <!DOCTYPE html>

        <html lang="pt-BR">

        <head>

            <meta charset="UTF-8">

            <style>

                body {
                    margin: 0;
                    padding: 0;
                    font-family: Arial, sans-serif;
                }

                .certificado {
                    width: 100%;
                    height: 100vh;
                    display: flex;
                    flex-direction: column;
                    justify-content: center;
                    align-items: center;
                    text-align: center;
                    border: 10px solid #222;
                    box-sizing: border-box;
                    padding: 60px;
                }

                h1 {
                    font-size: 42px;
                    margin-bottom: 40px;
                }

                .texto {
                    font-size: 22px;
                    line-height: 1.6;
                }

                .codigo {
                    margin-top: 50px;
                    font-size: 14px;
                }

            </style>

        </head>

        <body>

            <div class="certificado">

                <h1>Relatório usuários em um evento</h1>

                <div class="texto">

                    <p>
                        Usuários cadastrados no evento:
                        ${participacoes.length}
                    </p>

                    <p>
                        Nome e matrícula dos usuários:
                    </p>

                    <ul>

                        ${usuarios.map(usuario => `

                            <li>

                                ${usuario.nome} -
                                ${usuario.matricula || usuario.siape + " (SIAPE)"}

                            </li>

                        `).join("")}

                    </ul>

                </div>

                <div class="codigo">

                    Código de autenticidade: ${codigo}

                </div>

            </div>

        </body>

        </html>
    `;


    const browser = await puppeteer.launch();

    try {

        const page = await browser.newPage();

        await page.setContent(pdfRelatorioUE, {
            waitUntil: "networkidle0"
        });

        const relatorio = await page.pdf({

            format: "A4",

            landscape: true,

            printBackground: true

        });

        return relatorio;

    } finally {

        await browser.close();

    }

}