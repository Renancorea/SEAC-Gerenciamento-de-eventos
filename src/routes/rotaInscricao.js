import { Router } from "express";
import {
    RealizarInscricao,
    RegistrarPresenca,
    VizualizarInscritos,
    VerificarInscricaoUsuario,
    VizualizarPresentes
} from "../controllers/controladorInscricao.js";

const router = Router();

router.post("/inscricao", RealizarInscricao);
router.post("/", RealizarInscricao);
router.put("/presenca", RegistrarPresenca);
router.get("/eventos/:eventoId/inscritos", VizualizarInscritos);
router.get("/:eventoId/inscritos", VizualizarInscritos);
router.get("/eventos/:eventoId/presentes", VizualizarPresentes);
router.get("/:eventoId/presentes", VizualizarPresentes);
router.get("/usuario/:usuarioId/evento/:eventoId", VerificarInscricaoUsuario);
router.get("/usuario/:usuarioId/inscricao", VerificarInscricaoUsuario);

export default router;