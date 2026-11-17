import { Router } from "express";
import { Login, Logout, SessaoAtual } from "../controllers/controladorAutenticacao.js";
import { autenticarUsuario } from "../middlewares/autenticacao.js";

const router = Router();

router.post("/login", Login);
router.post("/logout", Logout);
router.get("/me", autenticarUsuario, SessaoAtual);
router.get("/sessao", autenticarUsuario, SessaoAtual);

export default router;