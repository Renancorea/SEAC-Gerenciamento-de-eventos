import { Router } from "express";
import { gerarCertificado } from "../controllers/controladorCertificado.js";

const router = Router();

router.post("/", gerarCertificado);

export default router;