import { Router } from "express";
import {
    RealizarInscricao,
    RegistrarPresenca,
    VizualizarInscritos,
    VerificarInscricaoUsuario,
    VizualizarPresentes,
    MinhasInscricoes
} from "../controllers/controladorInscricao.js";
import { autenticarUsuario, exigirOrganizador } from "../middlewares/autenticacao.js";

const router = Router();

router.post("/inscricao", autenticarUsuario, RealizarInscricao);
router.post("/", autenticarUsuario, RealizarInscricao);
router.get("/minhas", autenticarUsuario, MinhasInscricoes);
router.put("/presenca", autenticarUsuario, exigirOrganizador, RegistrarPresenca);
router.get("/eventos/:eventoId/inscritos", autenticarUsuario, exigirOrganizador, VizualizarInscritos);
router.get("/:eventoId/inscritos", autenticarUsuario, exigirOrganizador, VizualizarInscritos);
router.get("/eventos/:eventoId/presentes", autenticarUsuario, exigirOrganizador, VizualizarPresentes);
router.get("/:eventoId/presentes", autenticarUsuario, exigirOrganizador, VizualizarPresentes);
router.get("/usuario/:usuarioId/evento/:eventoId", autenticarUsuario, VerificarInscricaoUsuario);
router.get("/usuario/:usuarioId/inscricao", autenticarUsuario, VerificarInscricaoUsuario);

export default router;