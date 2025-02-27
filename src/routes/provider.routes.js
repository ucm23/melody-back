import { Router } from "express";
import { createProvider, deleteProvider, getProvider, getProviders, updateProvider } from "../controllers/provider.controller.js";

const router = Router();

router.get("/", getProviders);
router.get("/:id", getProvider);
router.delete("/:id", deleteProvider);
router.post("/", createProvider);
router.patch("/:id", updateProvider);

export default router;
