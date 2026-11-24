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

export default router;