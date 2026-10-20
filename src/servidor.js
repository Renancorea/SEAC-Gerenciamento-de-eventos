import express from "express";
import path from "path";
import { fileURLToPath } from "url";

// Banco de dados
import Conexao from "./db/conexao.js";
import Tabelas from "./db/tabelas.js";

// Rotas
import rotaUsuario from "./routes/rotaUsuario.js";
import rotaEvento from "./routes/rotaEvento.js";
import rotaInscricao from "./routes/rotaInscricao.js";
import rotaRelatorio from "./routes/rotaRelatorio.js";
import rotaCertificado from "./routes/rotaCertificado.js";
import rotaAutenticacao from "./routes/rotaAutenticacao.js";
import rotaAcao from "./routes/rotaAcao.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Inicialização das tabelas
Tabelas.initialize(Conexao);

app.use(express.json());

// Rotas da API REST
app.use("/api/usuarios", rotaUsuario);
app.use("/api/auth", rotaAutenticacao);
app.use("/api/eventos", rotaEvento);
app.use("/api/participacao", rotaInscricao);
app.use("/api/inscricoes", rotaInscricao);
app.use("/api/certificados", rotaCertificado);
app.use("/api/relatorios", rotaRelatorio);
app.use("/api/acoes", rotaAcao);

// Servir arquivos estáticos da pasta pages e uploads
app.use(express.static(path.join(__dirname, "../pages")));
app.use("/certificados", express.static(path.join(__dirname, "../certificados")));
app.use("/relatorios", express.static(path.join(__dirname, "../relatorios")));

// Redirecionamento da raiz para a página inicial
app.get("/", (requisicao, resposta) => {
    resposta.redirect("/inicio/");
});

// Endpoint de verificação da API
app.get("/api", (requisicao, resposta) => {
    resposta.json({
        mensagem: "API do SEAC funcionando!",
        status: "online",
        versao: "1.0.0"
    });
});

// Middleware para tratamento global de erros
app.use((erro, requisicao, resposta, proximo) => {
    console.error("[SEAC] Erro interno no servidor:", erro);
    resposta.status(500).json({
        mensagem: "Erro interno no servidor",
        erro: erro.message
    });
});

const porta = process.env.PORT || 3000;

app.listen(porta, "0.0.0.0", () => {
    console.log(`Servidor SEAC rodando em http://0.0.0.0:${porta}`);
});
