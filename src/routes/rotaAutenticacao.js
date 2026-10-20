import { Router } from "express";
import { Login, Logout } from "../controllers/controladorAutenticacao.js";

const router = Router();

router.post("/login", Login);
router.post("/logout", Logout);
router.post("/api/auth/login", Login);
router.post("/api/auth/logout", Logout);

export default router;