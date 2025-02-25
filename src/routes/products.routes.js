import { Router } from "express";
import { createCategorie, deleteCategorie, getCategorie, getCategories, updateCategorie } from "../controllers/categories.controller.js";

const router = Router();

router.get("/", getCategories);
router.get("/:id", getCategorie);
router.delete("/:id", deleteCategorie);
router.post("/", createCategorie);
router.patch("/:id", updateCategorie);

export default router;
