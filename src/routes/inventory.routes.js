import { Router } from "express";
import { createInventory, deleteInventory, getInventory, getInventorys, updateInventory } from "../controllers/inventorys.controller.js";

const router = Router();

router.get("/", getInventorys);
router.get("/:id", getInventory);
router.delete("/:id", deleteInventory);
router.post("/", createInventory);
router.patch("/:id", updateInventory);

export default router;
