import { pool } from "../connect.js";

export const getProducts = async (req, res) => {
    try {
        const rows = await pool.query("SELECT * FROM products");
        res.json(rows?.rows);
    } catch (error) {
        return res.status(500).json({ message: "Something goes wrong" + error });
    }
};

export const getProduct = async (req, res) => {
    try {
        const { id } = req.params;
        const rows = await pool.query(`SELECT * FROM products WHERE id = $1`, [id]);
        if (rows?.rows.length <= 0) return res.status(404).json({ message: "products not found" });
        res.json(rows?.rows[0]);
    } catch (error) {
        return res.status(500).json({ message: "Something goes wrong" + error });
    }
};

export const deleteProduct = async (req, res) => {
    try {
        const { id } = req.params;
        const rows = await pool.query("DELETE FROM products WHERE id = $1", [id]);
        console.log("🚀 ~ deleteProduct ~ rows:", rows)
        if (rows.affectedRows <= 0) return res.status(404).json({ message: "products not found" });
        res.sendStatus(204);
    } catch (error) {
        return res.status(500).json({ message: "Something goes wrong" + error });
    }
};

export const createProduct = async (req, res) => {
    try {
        const { 
            code,
            description,
            mode_sale,
            price_cost,
            price_sale,
            utility,
            price_whole,
            departament,
            quanty_act,
            quanty_min,
         } = req.body;
        const rows = await pool.query(
            `INSERT INTO products (
                code,
                description,
                mode_sale,
                price_cost,
                price_sale,
                utility,
                price_whole,
                departament,
                quanty_act,
                quanty_min
            ) VALUES (
             $1, $2, $3, $4, $5, $6, $7, $8, $9, $10
             ) RETURNING id;`, [
                code,
                description,
                mode_sale,
                price_cost,
                price_sale,
                utility,
                price_whole,
                departament,
                quanty_act,
                quanty_min
             ]);
        res.status(201).json({ 
            id: rows?.rows[0].id, 
            code,
            description,
            mode_sale,
            price_cost,
            price_sale,
            utility,
            price_whole,
            departament,
            quanty_act,
            quanty_min
        });
    } catch (error) {
        return res.status(500).json({ message: "Something goes wrong" + error });
    }
};

export const updateProduct = async (req, res) => {
    try {
        const { id } = req.params;
        const { 
            code,
            description,
            mode_sale,
            price_cost,
            price_sale,
            utility,
            price_whole,
            departament,
            quanty_act,
            quanty_min
         } = req.body;
        const result = await pool.query(
            `UPDATE products SET 
            code = COALESCE($1, code),
            description = COALESCE($2, description),
            mode_sale = COALESCE($3, mode_sale),
            price_cost = COALESCE($4, price_cost),
            price_sale = COALESCE($5, price_sale),
            utility = COALESCE($6, utility),
            price_whole = COALESCE($7, price_whole),
            departament = COALESCE($8, departament),
            quanty_act = COALESCE($9, quanty_act),
            quanty_min = COALESCE($10, quanty_min)
            WHERE id = $11 RETURNING *`,
            [
                code,
                description,
                mode_sale,
                price_cost,
                price_sale,
                utility,
                price_whole,
                departament,
                quanty_act,
                quanty_min,
                id
            ]
        );
        console.log("🚀 ~ updateProduct ~ result?.rows[0]:", result?.rows[0])
        if (result?.rowCount === 0) return res.status(404).json({ message: "Product not found" });
        res.json(result?.rows[0]);
    } catch (error) {
        return res.status(500).json({ message: "Something goes wrong" + error });
    }
};
