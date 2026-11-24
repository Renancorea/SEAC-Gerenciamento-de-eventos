import { Router } from "express";
import { Login, Logout, SessaoAtual } from "../controllers/controladorAutenticacao.js";

const router = Router();

router.post("/login", Login);
router.post("/logout", Logout);
router.get("/me", SessaoAtual);

export default router;