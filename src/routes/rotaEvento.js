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
import { autenticarUsuario, exigirOrganizador } from "../middlewares/autenticacao.js";

const router = Router();

router.post("/cadastrar", autenticarUsuario, exigirOrganizador, CadastrarEvento);
router.get("/pesquisar", PesquisarEventos);
router.get("/filtrar", FiltrarEventos);
router.get("/detalhes/:id", ListarDetalhesEventos);
router.get("/detalhes", ListarDetalhesEventos);
router.put("/editar/:id", autenticarUsuario, exigirOrganizador, EditarEvento);
router.delete("/deletar/:id", autenticarUsuario, exigirOrganizador, DeletarEvento);
router.post("/:id/imagem", autenticarUsuario, exigirOrganizador, UploadImagemEvento);
router.get("/:id/imagens", ListarImagensEvento);
router.get("/:id", ListarDetalhesEventos);
router.get("/", ListarEventos);

export default router;