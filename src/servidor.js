import {express, json } from "express";

import rotaUsuario from "./routes/rotaUsuario.js";
import rotaEvento from "./routes/rotaEvento.js";
import rotaInscricao from "./routes/rotaInscricao.js";
import rotaCertificado from "./routes/rotaCertificado.js";
import rotaRelatorio from "./routes/rotaRelatorio.js";
import rotaCertificado from "./routes/rotaCertificado.js";

const app = express();

app.use(json());

app.use("/api/usuarios", rotaUsuario);
app.use("/api/eventos", rotaEvento);
app.use("/api/participacao", rotaInscricao);
app.use("/api/certificados", rotaCertificado);
app.use("/api/relatorios", rotaRelatorio);
app.use("/api/certificados", rotaCertificado);


app.listen(3000, () => {
    console.log("Servidor rodando na porta 3000");
});