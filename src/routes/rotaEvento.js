import { Router } from "express";
import { cadastrarEvento,listarEventos,listarDetalhesEventos,editarEvento,deletarEvento } from "../controllers/controladorEvento.js";

const router = Router();

router.post("/", cadastrarEvento);
router.get("/", listarEventos);
router.get("/detalhes", listarDetalhesEventos);
router.put("/editar/:id", editarEvento);
router.delete("/deletar/:id", deletarEvento);
export default router;