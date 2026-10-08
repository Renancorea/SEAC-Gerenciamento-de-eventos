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


export async function gerarCertificado(dados) {

    const {
        usuarioId,
        eventoId
    } = dados;


    if (!usuarioId || !eventoId) {

        throw new Error(
            "Usuário e evento são obrigatórios"
        );

    }


    const resultado = await executar(
        `SELECT
            u.nome AS nomeParticipante,
            u.matricula,
            u.siape,
            e.nome AS nomeEvento,
            e.data AS dataEvento,
            e.cargaHoraria
         FROM Usuario u
         INNER JOIN Participacao p
             ON u.usuarioId = p.usuarioId
         INNER JOIN Evento e
             ON p.eventoId = e.eventoId
         WHERE u.usuarioId = ?
         AND e.eventoId = ?
         AND p.inscrito = ?
         AND p.presente = ?`,
        [
            usuarioId,
            eventoId,
            true,
            true
        ]
    );


    if (resultado.length === 0) {

        throw new Error(
            "Usuário não está presente neste evento"
        );

    }

    const dadosEvento = resultado[0];

    const certificadoExistente = await executar(
        `SELECT *
         FROM Certificado
         WHERE usuarioId = ?
         AND eventoId = ?`,
        [
            usuarioId,
            eventoId
        ]
    );


    if (certificadoExistente.length > 0) {

        throw new Error(
            "O certificado para este participante já foi emitido"
        );

    }


    const codigo = `SEAC-${Date.now()}`;


    const matricula =
        dadosEvento.matricula ||
        dadosEvento.siape;


    const html = `
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

                <h1>CERTIFICADO</h1>

                <div class="texto">

                    Certificamos que

                </div>

                <div class="nome">

                    ${dadosEvento.nomeParticipante}

                </div>

                <div class="matricula">

                    ${dadosEvento.matricula
                        ? `Matrícula: ${matricula}`
                        : `SIAPE: ${matricula}`}

                </div>

                <div class="texto">

                    participou do evento

                    <strong>
                        ${dadosEvento.nomeEvento}
                    </strong>,

                    realizado em ${dadosEvento.dataEvento}.

                </div>

                <div class="texto">

                    Carga horária:
                    ${dadosEvento.cargaHoraria} horas.

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

        await page.setContent(html, {
            waitUntil: "networkidle0"
        });


        const caminho = `./certificados/${codigo}.pdf`;


        await page.pdf({

            path: caminho,

            format: "A4",

            landscape: true,

            printBackground: true

        });


        await executar(
            `INSERT INTO Certificado
             (cargaHoraria, arquivo, dataEmissao, usuarioId, eventoId)
             VALUES (?, ?, ?, ?, ?)`,
            [
                dadosEvento.cargaHoraria,
                caminho,
                new Date(),
                usuarioId,
                eventoId
            ]
        );


        return {

            codigo,

            usuarioId,

            eventoId,

            nomeParticipante: dadosEvento.nomeParticipante,

            matricula: matricula,

            nomeEvento: dadosEvento.nomeEvento,

            dataEvento: dadosEvento.dataEvento,

            cargaHoraria: dadosEvento.cargaHoraria,

            caminho

        };

    } finally {

        await browser.close();

    }

}