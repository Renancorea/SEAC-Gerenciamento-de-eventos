import express from "express";
import path from "path";
import { fileURLToPath } from "url";

import Conexao from "./db/conexao.js";
import Tabelas from "./db/tabelas.js";

import rotaUsuario from "./routes/rotaUsuario.js";
import rotaAutenticacao from "./routes/rotaAutenticacao.js";
import rotaEvento from "./routes/rotaEvento.js";
import rotaInscricao from "./routes/rotaInscricao.js";
import rotaCertificado from "./routes/rotaCertificado.js";
import rotaRelatorio from "./routes/rotaRelatorio.js";
import rotaAcao from "./routes/rotaAcao.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

Tabelas.initialize(Conexao);

app.use(express.json({ limit: "5mb" }));

// Rotas da API REST
app.use("/api/usuarios", rotaUsuario);
app.use("/api/auth", rotaAutenticacao);
app.use("/api/eventos", rotaEvento);
app.use("/api/inscricoes", rotaInscricao);
app.use("/api/certificados", rotaCertificado);
app.use("/api/relatorios", rotaRelatorio);
app.use("/api/acoes", rotaAcao);

app.get("/api", (requisicao, resposta) => {
    resposta.json({ mensagem: "API do SEAC funcionando!", status: "online" });
});

// Arquivos estáticos e páginas do frontend
app.get("/", (requisicao, resposta) => {
    resposta.redirect("/inicio/");
});

app.use("/assets", express.static(path.join(__dirname, "../assets")));
app.use("/cadastro", express.static(path.join(__dirname, "../cadastro")));
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));
app.use("/certificados", express.static(path.join(__dirname, "../certificados")));
app.use("/relatorios", express.static(path.join(__dirname, "../relatorios")));
app.use(express.static(path.join(__dirname, "../pages")));

const porta = process.env.PORT || 3000;

app.listen(porta, "0.0.0.0", () => {
    console.log(`Servidor SEAC rodando em http://0.0.0.0:${porta}`);
});
