import { Router } from "express";
import {
    RelatorioGeralEventos,
    RelatorioGeralUsuarios,
    RelatorioUsuariosEvento
} from "../controllers/controladorRelatorio.js";

const router = Router();

router.get("/eventos", RelatorioGeralEventos);
router.get("/usuarios", RelatorioGeralUsuarios);
router.get("/eventos/:eventoId/usuarios", RelatorioUsuariosEvento);
router.get("/eventos/:eventoId", RelatorioUsuariosEvento);
router.get("/usuarios/:usuarioId/eventos", RelatorioUsuariosEvento);

export default router;