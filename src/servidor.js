import express from "express";

// Banco de dados
import Conexao from "./db/conexao.js";
import Tabelas from "./db/tabelas.js";

// Rotas
import rotaUsuario from "./routes/rotaUsuario.js";
import rotaEvento from "./routes/rotaEvento.js";
import rotaInscricao from "./routes/rotaInscricao.js";
import rotaRelatorio from "./routes/rotaRelatorio.js";
import rotaCertificado from "./routes/rotaCertificado.js";


const app = express();

Tabelas.initialize(Conexao);

app.use(express.json());

app.use("/api/usuarios", rotaUsuario);
app.use("/api/eventos", rotaEvento);
app.use("/api/participacao", rotaInscricao);
app.use("/api/certificados", rotaCertificado);
app.use("/api/relatorios", rotaRelatorio);

const porta = 3000;

app.listen(porta, () => {
    console.log(`Servidor rodando na porta ${porta}`);
});