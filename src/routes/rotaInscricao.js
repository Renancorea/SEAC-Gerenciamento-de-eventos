import { Router } from "express";
import { RealizarInscricao, RegistrarPresenca, VizualizarInscritos,VerificarInscricaoUsuario, VizualizarPresentes} from "../controllers/controladorInscricao.js";

const router = Router();

router.post("/inscricao", RealizarInscricao);
router.put("/presenca", RegistrarPresenca);
router.get("/eventos/:eventoId/inscritos", VizualizarInscritos);
router.get("/eventos/:eventoId/presentes", VizualizarPresentes);
router.get("/usuario/:usuarioId/inscricao", VerificarInscricaoUsuario);

export default router;