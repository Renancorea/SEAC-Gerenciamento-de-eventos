import { Router } from "express";
import {
    CadastrarAcao,
    ListarAcoesPorEvento,
    BuscarAcaoPorId,
    EditarAcao,
    DeletarAcao
} from "../controllers/controladorAcao.js";

const router = Router();

router.post("/", CadastrarAcao);
router.get("/evento/:eventoId", ListarAcoesPorEvento);
router.get("/:id", BuscarAcaoPorId);
router.put("/:id", EditarAcao);
router.delete("/:id", DeletarAcao);

export default router;
