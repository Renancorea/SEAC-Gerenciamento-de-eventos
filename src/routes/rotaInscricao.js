import { Router } from "express";
import {
    RealizarInscricao,
    RegistrarPresenca,
    VizualizarInscritos,
    VerificarInscricaoUsuario,
    VizualizarPresentes,
    MinhasInscricoes
} from "../controllers/controladorInscricao.js";

const router = Router();

router.post("/", RealizarInscricao);
router.get("/minhas", MinhasInscricoes);
router.put("/presenca", RegistrarPresenca);
router.get("/eventos/:eventoId/inscritos", VizualizarInscritos);
router.get("/eventos/:eventoId/presentes", VizualizarPresentes);
router.get("/usuario/:usuarioId/evento/:eventoId", VerificarInscricaoUsuario);

export default router;