import { Router } from "express";
import {
    CadastrarEvento,
    ListarEventos,
    ListarDetalhesEventos,
    EditarEvento,
    DeletarEvento,
    PesquisarEventos,
    FiltrarEventos,
    UploadImagemEvento,
    ListarImagensEvento
} from "../controllers/controladorEvento.js";

const router = Router();

router.post("/cadastrar", CadastrarEvento);
router.get("/pesquisar", PesquisarEventos);
router.get("/filtrar", FiltrarEventos);
router.get("/detalhes/:id", ListarDetalhesEventos);
router.put("/editar/:id", EditarEvento);
router.delete("/deletar/:id", DeletarEvento);
router.post("/:id/imagem", UploadImagemEvento);
router.get("/:id/imagens", ListarImagensEvento);
router.get("/:id", ListarDetalhesEventos);
router.get("/", ListarEventos);

export default router;