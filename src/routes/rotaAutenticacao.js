import { Router } from "express";
import { login, logout } from "../controllers/controladorAutenticacao.js";

const router = Router();

router.post("/api/auth/login", login);
router.post("/api/auth/logout", logout);
export default router;