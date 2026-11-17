import { Router } from "express";
import {
    CadastrarAcao,
    ListarAcoesPorEvento,
    BuscarAcaoPorId,
    EditarAcao,
    DeletarAcao
} from "../controllers/controladorAcao.js";
import { autenticarUsuario, exigirOrganizador } from "../middlewares/autenticacao.js";

const router = Router();

router.post("/", autenticarUsuario, exigirOrganizador, CadastrarAcao);
router.get("/evento/:eventoId", ListarAcoesPorEvento);
router.get("/:id", BuscarAcaoPorId);
router.put("/:id", autenticarUsuario, exigirOrganizador, EditarAcao);
router.delete("/:id", autenticarUsuario, exigirOrganizador, DeletarAcao);

export default router;
