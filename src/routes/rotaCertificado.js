import { Router } from "express";
import { GerarCertificado } from "../controllers/controladorCertificado.js";

const router = Router();

router.post("/", GerarCertificado);
router.post("/gerar", GerarCertificado);

export default router;