import { Router } from "express";
import { realizarInscricao, registrarPresenca, vizualizarInscritos } from "../controllers/controladorInscricao.js";

const router = Router();

router.post("/inscricao", realizarInscricao);
router.put("/presenca", registrarPresenca);
router.get("/eventos/:eventoId/inscritos", vizualizarInscritos);

export default router;