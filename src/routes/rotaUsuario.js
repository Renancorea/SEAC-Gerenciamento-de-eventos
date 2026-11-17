import { Router } from "express";
import { Cadastrar } from "../controllers/controladorUsario.js";
import { autenticarOpcional } from "../middlewares/autenticacao.js";

const router = Router();

router.post("/cadastrar", autenticarOpcional, Cadastrar);

export default router;