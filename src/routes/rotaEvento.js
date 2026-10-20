import { Router } from "express";
import {
    CadastrarEvento,
    ListarEventos,
    ListarDetalhesEventos,
    EditarEvento,
    DeletarEvento,
    PesquisarEventos,
    FiltrarEventos
} from "../controllers/controladorEvento.js";

const router = Router();

router.post("/cadastrar", CadastrarEvento);
router.get("/pesquisar", PesquisarEventos);
router.get("/filtrar", FiltrarEventos);
router.get("/detalhes/:id", ListarDetalhesEventos);
router.get("/detalhes", ListarDetalhesEventos);
router.put("/editar/:id", EditarEvento);
router.delete("/deletar/:id", DeletarEvento);
router.get("/:id", ListarDetalhesEventos);
router.get("/", ListarEventos);

export default router;