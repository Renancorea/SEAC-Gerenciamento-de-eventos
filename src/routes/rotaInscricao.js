import express from "express";

import { realizarInscricao, registrarPresenca, vizualizarInscritos } from "../controllers/controladorInscricao.js";

const router = express.Router();

router.post("/inscricao", realizarInscricao);
router.put("/presenca", registrarPresenca);
router.get("/eventos/:eventoId/inscritos", vizualizarInscritos);

export default router;