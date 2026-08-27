import puppeteer from "puppeteer";

const certificados = [];

export async function gerarCertificado(dados) {

    const {
    nomeParticipante,
    matricula,
    nomeEvento,
    dataEvento,
    cargaHoraria
} = dados;

    if (!nomeParticipante || !matricula || !nomeEvento || !dataEvento) {
    throw new Error(
        "Nome, matrícula, nome do evento e data do evento são obrigatórios"
    );
}

    const certificadoExistente = certificados.find(
        certificado =>
            certificado.nomeParticipante === nomeParticipante &&
            certificado.nomeEvento === nomeEvento
    );

    if (certificadoExistente) {
        throw new Error(
            "O certificado para este participante já foi emitido"
        );
    }

    const codigo = `SEAC-${Date.now()}`;

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
                    ${nomeParticipante}
                </div>

                <div class="matricula">
                    Matrícula: ${matricula}
                </div>

                <div class="texto">
                    participou do evento
                    <strong>${nomeEvento}</strong>,
                    realizado em ${dataEvento}.
                </div>

                ${
                    cargaHoraria
                        ? `<div class="texto">
                            Carga horária: ${cargaHoraria} horas.
                        </div>`
                        : ""
                }

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

        const certificado = {
            id: certificados.length + 1,
            codigo,
            nomeParticipante,
            matricula,
            nomeEvento,
            dataEvento,
            cargaHoraria: cargaHoraria || null,
            caminho
        };

        certificados.push(certificado);

        return certificado;

    } finally {

        await browser.close();

    }
}