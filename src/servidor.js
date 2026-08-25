import express, { json } from "express";

import usuario from "./routes/rotaUsuario.js";

const app = express();

app.use(json());

app.use("/api/usuarios", usuario);

app.listen(3000, () => {
    console.log("Servidor rodando na porta 3000");
});