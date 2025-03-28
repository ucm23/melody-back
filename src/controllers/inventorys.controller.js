import { pool } from "../connect.js";

export const getInventorys = async (req, res) => {
    try {
        const store_id = req.query.store_id;
        console.log("🚀 ~ getInventorys ~ req.params:", req.params)
        const rows = await pool.query("SELECT * FROM inventory WHERE store_id = $1", [store_id]);
        console.log("🚀 ~ getInventorys ~ rows:", rows)
        res.json(rows?.rows);
    } catch (error) {
        return res.status(500).json({ message: "Something goes wrong" + error });
    }
};

export const getInventory = async (req, res) => {
    try {
        const { id } = req.params;
        const rows = await pool.query(`SELECT * FROM inventory WHERE id = $1`, [id]);
        if (rows?.rows.length <= 0) return res.status(404).json({ message: "inventory not found" });
        res.json(rows?.rows[0]);
    } catch (error) {
        return res.status(500).json({ message: "Something goes wrong" + error });
    }
};

export const deleteInventory = async (req, res) => {
    try {
        const { id } = req.params;
        const rows = await pool.query("DELETE FROM inventory WHERE id = $1", [id]);
        console.log("🚀 ~ deleteInventory ~ rows:", rows)
        if (rows.affectedRows <= 0) return res.status(404).json({ message: "inventory not found" });
        res.sendStatus(204);
    } catch (error) {
        return res.status(500).json({ message: "Something goes wrong" + error });
    }
};

export const createInventory = async (req, res) => {
    try {
        const { 
            name
         } = req.body;
        const rows = await pool.query(
            `INSERT INTO inventory (
                name
            ) VALUES (
             $1
             ) RETURNING id;`, [
                name
             ]);
        res.status(201).json({ 
            id: rows?.rows[0].id, 
            name
        });
    } catch (error) {
        return res.status(500).json({ message: "Something goes wrong" + error });
    }
};

export const updateInventory = async (req, res) => {
    try {
        const { id } = req.params;
        const { 
            name
         } = req.body;
        const result = await pool.query(
            `UPDATE inventory SET 
            name = COALESCE($1, name)
            WHERE id = $2 RETURNING *`,
            [
                name,
                id
            ]
        );
        console.log("🚀 ~ updateInventory ~ result?.rows[0]:", result?.rows[0])
        if (result?.rowCount === 0) return res.status(404).json({ message: "Inventory not found" });
        res.json(result?.rows[0]);
    } catch (error) {
        return res.status(500).json({ message: "Something goes wrong" + error });
    }
};
