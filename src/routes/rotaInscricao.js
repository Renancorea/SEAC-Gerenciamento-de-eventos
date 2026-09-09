import { Router } from "express";
import { realizarInscricao, registrarPresenca, vizualizarInscritos,verificarInscricaoUsuario, vizualizarPresentes} from "../controllers/controladorInscricao.js";

const router = Router();

router.post("/inscricao", realizarInscricao);
router.put("/presenca", registrarPresenca);
router.get("/eventos/:eventoId/inscritos", vizualizarInscritos);
router.get("/eventos/:eventoId/presentes", vizualizarPresentes);
router.get("/usuario/:userId/inscricao", verificarInscricaoUsuario);

export default router;