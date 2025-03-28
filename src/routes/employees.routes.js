import { Router } from "express";
import {
    getEmployees,
    getEmployee,
    deleteEmployee,
    createEmployee,
    updateEmployee,
    archiverEmployee
} from "../controllers/employees.controller.js";

const router = Router();

router.get("/", getEmployees);
router.get("/:id", getEmployee);
router.delete("/:id", deleteEmployee);
router.post("/:store_id", createEmployee);
router.patch("/:id", updateEmployee);
router.patch("/archiver/:id", archiverEmployee);

export default router;
