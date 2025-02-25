import { Router } from "express";
import { createProduct, deleteProduct, getProduct, getProducts, updateProduct } from "../controllers/products.controller.js";

const router = Router();

router.get("/", getProducts);
router.get("/:id", getProduct);
router.delete("/:id", deleteProduct);
router.post("/", createProduct);
router.patch("/:id", updateProduct);

export default router;
