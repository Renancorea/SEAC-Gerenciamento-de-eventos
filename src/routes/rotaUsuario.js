import { Router } from "express";
import { cadastrar, login } from "../controllers/controladorUsario.js";

const router = Router();

router.post("/", cadastrar);
router.post("/api/auth/login", login);
router.get("/", listarEventos);
export default router;