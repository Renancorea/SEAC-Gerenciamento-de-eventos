import { Router } from "express";
import { GerarCertificado } from "../controllers/controladorCertificado.js";

const router = Router();

router.post("/", GerarCertificado);

export default router;