import { Router } from "express";
import { relatorioGeralEventos,relatorioGeralUsuarios,relatorioUsuariosEvento } from "../controllers/controladorRelatorio.js";

const router = Router();

router.get("/eventos", relatorioGeralEventos);
router.get("/usuarios", relatorioGeralUsuarios);
router.get("/usuarios/:usuarioId/eventos", relatorioUsuariosEvento);

export default router;