import { Router } from "express";
import { Cadastrar } from "../controllers/controladorUsario.js";

const router = Router();

router.post("/", Cadastrar);
export default router;