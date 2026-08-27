import express from "express";

import { gerarCertificado } from "../controllers/controladorCertificado.js";

const router = express.Router();

router.post("/", gerarCertificado);

export default router;