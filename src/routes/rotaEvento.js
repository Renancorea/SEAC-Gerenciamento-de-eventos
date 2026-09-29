import { Router } from "express";
import { CadastrarEvento,ListarEventos,ListarDetalhesEventos,EditarEvento,DeletarEvento } from "../controllers/controladorEvento.js";

const router = Router();

router.post("/", CadastrarEvento);
router.get("/", ListarEventos);
router.get("/detalhes", ListarDetalhesEventos);
router.put("/editar/:id", EditarEvento);
router.delete("/deletar/:id", DeletarEvento);

export default router;