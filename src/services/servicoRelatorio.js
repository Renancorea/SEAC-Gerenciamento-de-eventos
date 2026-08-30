import { truncate } from "fs";
import puppeteer from "puppeteer";

const usuarios = [
    {
    "nome": "Renan",
    "matricula": "2024001",
    "email": "renan@gmail.com",
    "tipo": 1,
    "senha": "123456"
},
{
    "nome": "Ana",
    "matricula": null,
    "email": "ana@gmail.com",
    "tipo": 0,
    "siape": "1234567",
    "senha": "123456"
}
];

const eventos = [
    {
    id: 1,
    nome: "IFCE vozes",
    local: "Auditório Principal",
    data: "2026-05-15",
    horario: "13:00",
    descricao: "Musicas e talentos",
    tipo: "seinao",
    assentos: 100,
    categoria: "Cultural",
    cargaHoraria: "2h"
    },
    {
    id: 2,
    nome: "X(10°) evento cultural",
    local: "Auditório Principal",
    data: "2026-07-26",
    horario: "08:00",
    descricao: "Autismo e inclusão",
    tipo: "Palestra",
    assentos: 100,
    categoria: "saude e cultura",
    cargaHoraria: "3h"
    }
];

const participacoes = [
    {
        id: 1,
        usuarioId: 1,
        eventoId: 2,
        inscrito: true,
        presente: false
    },
    {
        id: 2,
        usuarioId: 1,
        eventoId: 3,
        inscrito: true,
        presente: true
    },
    {
        id:3,
        usuarioId: 1,
        eventoId: 5,
        inscrito: true,
        presente: true
    }
];


export async function relatorioGeralUsuarios() {

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

                .nome {
                    font-size: 32px;
                    font-weight: bold;
                    margin: 30px 0 10px;
                }

                .matricula {
                    font-size: 20px;
                    margin-bottom: 30px;
                }

                .codigo {
                    margin-top: 50px;
                    font-size: 14px;
                }

            </style>
        </head>

        <body>

            <div class="certificado">

                <h1>Relatorio geral usuarios</h1>
                <div class="texto">
                    <p>Usuarios cadastrados: ${usuarios.length}</p>
                    <p>Nome e matricula dos usuarios:</p>
                    <ul>
                        ${usuarios.map(usuario => `
                            <li>
                                ${usuario.nome} - ${usuario.matricula || usuario.siape + " (siape)"}
                            </li>
                        `).join('')}
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
        // GU gerel usuarioa
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

                .nome {
                    font-size: 32px;
                    font-weight: bold;
                    margin: 30px 0 10px;
                }

                .matricula {
                    font-size: 20px;
                    margin-bottom: 30px;
                }

                .codigo {
                    margin-top: 50px;
                    font-size: 14px;
                }

            </style>
        </head>

        <body>

            <div class="certificado">

                <h1>Relatorio geral eventos</h1>
                <div class="texto">
                    <p>Eventos cadastrados: ${eventos.length}</p>
                    <p>Nome, descricao, carga horaria dos eventos:</p>
                    <ul>
                        ${eventos.map(evento => `
                            <li>
                                ${evento.nome} - ${evento.categoria} - ${evento.cargaHoraria}
                            </li>
                        `).join('')}
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
        // GE gerel eventos
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

                .nome {
                    font-size: 32px;
                    font-weight: bold;
                    margin: 30px 0 10px;
                }

                .matricula {
                    font-size: 20px;
                    margin-bottom: 30px;
                }

                .codigo {
                    margin-top: 50px;
                    font-size: 14px;
                }

            </style>
        </head>

        <body>

            <div class="certificado">

                <h1>Relatorio usuarios em um evento</h1>
                <div class="texto">
                    <p>Usuarios cadastrados no evento: ${participacoes.filter(a => a.eventoId === idEvento).length}</p>
                    <p>Nome e matricula dos usuarios:</p>
                    <ul>
                        ${usuarios.map(usuario => `
                            <li>
                                ${usuario.nome} - ${usuario.matricula || usuario.siape + " (siape)"}
                            </li>
                        `).join('')}
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
        // GU gerel usuarioa
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