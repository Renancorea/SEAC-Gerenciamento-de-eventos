import { Router } from "express";
import {
    GerarCertificado,
    MeusCertificados,
    ListarCertificadosPorUsuario
} from "../controllers/controladorCertificado.js";

const router = Router();

router.get("/meus", MeusCertificados);
router.get("/usuario/:usuarioId", ListarCertificadosPorUsuario);
router.post("/", GerarCertificado);

export default router;