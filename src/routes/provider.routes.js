import { Router } from "express";
import { createProvider, deleteProvider, getProvider, getProviders, updateProvider, getBilling, archiverProvider } from "../controllers/provider.controller.js";

const router = Router();

router.get("/", getProviders);
router.get("/:id", getProvider);
router.get("/billing/:id", getBilling);
router.delete("/:id", deleteProvider);
router.post("/:store_id", createProvider);
router.patch("/:id", updateProvider);
router.patch("/archiver/:id", archiverProvider);

export default router;
