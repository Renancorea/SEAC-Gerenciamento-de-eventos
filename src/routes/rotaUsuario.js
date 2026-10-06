import { Router } from "express";
import { Cadastrar } from "../controllers/controladorUsario.js";

const router = Router();

router.post("/cadastrar", Cadastrar);
export default router;