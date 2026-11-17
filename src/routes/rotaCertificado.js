import { Router } from "express";
import {
    GerarCertificado,
    MeusCertificados,
    ListarCertificadosPorUsuario
} from "../controllers/controladorCertificado.js";
import { autenticarUsuario } from "../middlewares/autenticacao.js";

const router = Router();

router.get("/meus", autenticarUsuario, MeusCertificados);
router.get("/usuario/:usuarioId", autenticarUsuario, ListarCertificadosPorUsuario);
router.post("/", autenticarUsuario, GerarCertificado);
router.post("/gerar", autenticarUsuario, GerarCertificado);

export default router;