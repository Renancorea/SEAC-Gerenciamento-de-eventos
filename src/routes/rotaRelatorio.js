import { Router } from "express";
import {
    RelatorioGeralEventos,
    RelatorioGeralUsuarios,
    RelatorioUsuariosEvento
} from "../controllers/controladorRelatorio.js";
import { autenticarUsuario, exigirOrganizador, exigirAdmin } from "../middlewares/autenticacao.js";

const router = Router();

router.get("/eventos", autenticarUsuario, exigirOrganizador, RelatorioGeralEventos);
router.get("/usuarios", autenticarUsuario, exigirAdmin, RelatorioGeralUsuarios);
router.get("/eventos/:eventoId/usuarios", autenticarUsuario, exigirOrganizador, RelatorioUsuariosEvento);
router.get("/eventos/:eventoId", autenticarUsuario, exigirOrganizador, RelatorioUsuariosEvento);
router.get("/usuarios/:usuarioId/eventos", autenticarUsuario, exigirOrganizador, RelatorioUsuariosEvento);

export default router;